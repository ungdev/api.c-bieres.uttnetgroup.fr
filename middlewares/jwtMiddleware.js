const jwtHelper = require('../helpers/jwtHelper')

module.exports = function(req, res, next) {

  // 'authorization': 'Bearer [jwt]', we only want the jwt
  const jwt = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null

  // continue only if the jwt is valid
  jwtHelper.verify(jwt)
    .then(payload => {
      req.payload = payload
      return next()
    })
    .catch(_ => next())

}
