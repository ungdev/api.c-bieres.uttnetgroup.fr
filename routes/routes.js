const eventController = require('../controllers/eventController');
const beerController = require('../controllers/beerController');
const oauthController = require('../controllers/oauthController');

module.exports = function(app) {

    // event routes
    app.route('/api/event')
        .get(eventController.get)
        .post(eventController.create);
    app.route('/api/event/next')
        .get(eventController.getNext);
    app.route('/api/event/next/register')
        .post(eventController.register);
    app.route('/api/event/:id')
        .get(eventController.getById)
        .put(eventController.update)
        .delete(eventController.delete);

    // beer routes
    app.route('/api/beer')
        .get(beerController.get)
        .post(beerController.create);
    app.route('/api/beer/:id')
        .get(beerController.getById)
        .put(beerController.update)
        .delete(beerController.delete);

    // oauth routes
    app.route('/api/oauth/etuutt/link')
        .get(oauthController.getLink);
    app.route('/api/oauth/etuutt/callback')
        .post(oauthController.callback);
};
