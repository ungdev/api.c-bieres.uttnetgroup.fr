module.exports = function(req, res, next) {

    // this middleware should not be applied to the following routes:
    if (
        (new RegExp('oauth').test(req.url))
        || (req.url === '/event/next' && req.method === 'GET')
        || (req.url === '/event/next/register' && req.method === 'POST')
        || (req.url === '/api/event/next/unregister' && req.method === 'POST')
    ) {
        return next();
    }

    console.log("middleware");
    next();
};
