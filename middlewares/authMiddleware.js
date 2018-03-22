const jwtHelper = require('../helpers/jwtHelper');

module.exports = function(req, res, next) {

  // this middleware should not be applied to the following routes:
  if (
    (new RegExp('oauth').test(req.url))
    || (req.url === '/event/next' && req.method === 'GET')
    || (req.url === '/event/mail' && req.method === 'GET')
    || (req.url === '/event/next/register' && req.method === 'POST')
    || (req.url === '/event/next/unregister' && req.method === 'POST')
    || (req.url.match('/event') && req.method === 'GET')
  ) {
    return next()
  }

  // check auth
  if (!req.payload) return res.status(401).json()

  return next()
}
