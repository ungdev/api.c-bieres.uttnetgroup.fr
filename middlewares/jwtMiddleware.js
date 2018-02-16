const jwtHelper = require('../helpers/jwtHelper')

module.exports = function(req, res, next) {

  if (!req.headers.authorization) return res.status(401).json()

  // 'authorization': 'Bearer [jwt]', we only want the jwt
  const jwt = req.headers.authorization.split(' ')[1]

  // continue only if the jwt is valid
  jwtHelper.verify(jwt)
    .then(payload => {
      req.payload = payload
      return next()
    })
    .catch(_ => next())

}
