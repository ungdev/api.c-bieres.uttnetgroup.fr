const mongoose = require('mongoose')
const Admin = mongoose.model('Admin')
const Drinker = mongoose.model('Drinker')

const EtuUTTService = require('../services/EtuUTTService.js')
const jwtHelper = require('../helpers/jwtHelper')

const _returnJWT = (res, etuUTTUser, drinker, tokenObj, created) => {
  Admin.findOne({ login: etuUTTUser.data.login })
    .then(admin => res.status(created ? 201 : 200).json(jwtHelper.sign(drinker, tokenObj.access_token, admin || etuUTTUser.data.studentId == process.env.DEFAULT_ADMIN)))
    .catch(err => res.status(500).json(err))
}

/**
 * Get the oauth redirect link for EtuUTT
 *
 * @param  {request} req
 * @param  {response} res
 * @return {response}
 */
exports.getLink = (req, res) => {
  const redirectUri = EtuUTTService().oauthAuthorize()
  res.json({ redirectUri })
}

/**
 * Handle oauth callback. Check the authorization_code.
 * If valid, return a JWT with informations about the User
 *
 * @param  {request} req
 * @param  {response} res
 * @return {response}
 */
exports.callback = (req, res) => {
  if (!req.body.authorization_code)
    return res.status(400).json({ message: "missing authorization code" })

  let EtuUTT = EtuUTTService()
  let tokenObj

  EtuUTT.oauthTokenByAuthCode(req.body.authorization_code)
  .then(data => {
    tokenObj = data
    // get the user's data
    return EtuUTT.publicUserAccount()
  })
  .then(etuUTTUser => {
    Drinker.findOne({ studentId: etuUTTUser.data.studentId })
      .then(drinker => {
        // if drinker doesn't exist, create it
        if (drinker) {
          _returnJWT(res, etuUTTUser, drinker, tokenObj)
        } else {
          const newDrinker = new Drinker(etuUTTUser.data)
          newDrinker.save()
            .then(savedDrinker => _returnJWT(res, etuUTTUser, savedDrinker, tokenObj, true))
        }
      })
  })
  .catch(error => res.status(500).json({ message: "An error occurs during communications with the api of EtuUTT: " + error}))
}

exports.getAccount = (req, res) => {
  Drinker.findById(req.payload.id)
    .then(drinker => res.json(drinker))
    .catch(err => res.status(500).json(err))
}

exports.updateAccount = (req, res) => {
  if (req.payload.id != req.body.account._id) return res.status(403).json()

  Drinker.findByIdAndUpdate(req.payload.id, req.body.account, {new: true, runValidators: true })
    .then(event => res.status(204).send())
    .catch(err => res.status(err.name === "ValidationError" ? 400 : 500).json(err))
}
