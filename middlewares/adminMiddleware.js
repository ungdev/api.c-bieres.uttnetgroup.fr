module.exports = function(req, res, next) {

  // this middleware should not be applied to the following routes:
  if (
    (new RegExp('oauth').test(req.url))
    || (req.url === '/event/next' && req.method === 'GET')
    || (req.url.match('/event') && req.method === 'GET')
    || (req.url.match('/event/register'))
  ) {
    return next()
  }

  // check admin
  if (!req.payload.isAdmin) return res.status(403).json()

  return next()
}
