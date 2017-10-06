const jwtHelper = require('../helpers/jwtHelper');

module.exports = function(req, res, next) {

    // this middleware should not be applied to the following routes:
    if (
        (new RegExp('oauth').test(req.url))
        || (req.url === '/event/next' && req.method === 'GET')
        || (req.url === '/event/next/register' && req.method === 'POST')
        || (req.url === '/event/next/unregister' && req.method === 'POST')
    ) {
        return next();
    }

    // 'authorization': 'Bearer [jwt]', we only want the jwt
    const jwt = req.headers.authorization.split(' ')[1];

    // continue only if the jwt is valid
    jwtHelper.verify(jwt)
        .then(payload => {
            if (!payload.isAdmin) return res.status(403).json();
            return next();
        })
        .catch(err => res.status(401).json());
};
