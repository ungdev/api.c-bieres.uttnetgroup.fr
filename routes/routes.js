const eventController = require('../controllers/eventController');
const oauthController = require('../controllers/oauthController');

module.exports = function(app) {

    app.route('/api/event')
        .post(eventController.create);

    app.route('/api/etuutt/link')
        .get(oauthController.getLink);

    app.route('/api/etuutt/callback')
        .post(oauthController.callback);
};
