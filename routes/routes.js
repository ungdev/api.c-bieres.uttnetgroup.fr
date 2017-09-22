const eventController = require('../controllers/eventController');
const beerController = require('../controllers/beerController');
const oauthController = require('../controllers/oauthController');
const adminController = require('../controllers/adminController');
const drinkerController = require('../controllers/drinkerController');

module.exports = function(app) {

    // admin routes
    app.route('/api/admin')
        .get(adminController.get)
        .post(adminController.create);
    app.route('/api/admin/:id')
        .delete(adminController.delete);

    // event routes
    app.route('/api/event')
        .get(eventController.get)
        .post(eventController.create);
    app.route('/api/event/next')
        .get(eventController.getNext);
    app.route('/api/event/next/register')
        .post(eventController.register);
    app.route('/api/event/next/register/id')
        .post(eventController.registerById);
    app.route('/api/event/next/unregister')
        .post(eventController.unregister);
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

    // drinker routes
    app.route('/api/drinker')
        .get(drinkerController.get);

    // oauth routes
    app.route('/api/oauth/etuutt/link')
        .get(oauthController.getLink);
    app.route('/api/oauth/etuutt/callback')
        .post(oauthController.callback);
};
