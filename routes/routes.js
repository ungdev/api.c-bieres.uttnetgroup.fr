const eventController = require('../controllers/eventController');
const oauthController = require('../controllers/oauthController');

module.exports = function(app) {

    // event routes
    app.route('/api/event')
        .get(eventController.get)
        .post(eventController.create);
    app.route('/api/event/:id')
        .get(eventController.getById)
        .put(eventController.update)
        .delete(eventController.delete);

    // oauth routes
    app.route('/api/etuutt/link')
        .get(oauthController.getLink);
    app.route('/api/etuutt/callback')
        .post(oauthController.callback);
};
