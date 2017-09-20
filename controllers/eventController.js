const EtuUTTService = require('../services/EtuUTTService.js');
const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const Drinker = mongoose.model('Drinker');

/**
 * Make a request to find the next Event from now
 *
 * @return {Promise}
 */
function getNextEvent() {
    return new Promise((resolve, reject) => {
        Event.find({ when: {$gt: new Date()} }).populate('beers').sort({when: 'asc'}).limit(1).exec((err, events) => {
            if (err)
                reject(err);
            resolve(events[0]);
        });
    });
}

/**
 * Given an Event and a Drinker,
 * register the Drinker to the Event
 *
 * @param {Event}
 * @param {Drinker}
 * @return {Promise}
 */
function registerDrinker(event, drinker) {
    return new Promise((resolve, reject) => {

        event.drinkers.push(drinker);
        event.save((err, savedEvent) => {
            if (err)
                reject(err);

            drinker.events.push(savedEvent);
            drinker.save((err, savedDrinker) => {
                if (err)
                    reject(err);
                resolve(drinker);
            });
        });
    });
}

/**
 * Given an Event remove the given drinker,
 * register the drinker to the Event
 *
 * @param {Event}
 * @param {Drinker}
 * @return {Promise}
 */
function unregisterDrinker(event, drinker) {
    return new Promise((resolve, reject) => {

        event.drinkers = event.drinkers.filter(id => String(id) !== String(drinker._id))
        event.save((err, savedEvent) => {
            if (err)
                reject(err);

            drinker.events = drinker.events.filter(id => String(id) !== String(savedEvent._id))
            drinker.save((err, savedDrinker) => {
                if (err)
                    reject(err);
                resolve();
            });
        });
    });
};

exports.unregister = function(req, res) {
    if (!req.body.authorization_code) {
        res.status(400).json({ message: "missing authorization code" })
    }

    let EtuUTT = EtuUTTService();
    let tokenObj;

    // check if the code is valid
    EtuUTT.oauthTokenByAuthCode(req.body.authorization_code)
    .then((data) => {
        tokenObj = data;
        // get the user's data
        return EtuUTT.publicUserAccount();
    })
    .then((etuUTTUser) => {
        // get the next event
        getNextEvent()
            .then(event => {
                if (!event) {
                    res.status(404).json({ message: "Aucun évènement n'est prévu prochainement" });
                }

                // get the drinker, by student id (unique)
                Drinker.findOne({ studentId: String(etuUTTUser.data.studentId) })
                    .then(drinker => {

                        // if exists, unregister him to the event
                        if (drinker) {
                            // if not registered, return 204 ? (nothing to unregister)
                            if (event.drinkers.filter(id => String(id) == String(drinker._id)).length === 0)
                                res.status(204).json({ message: "Tu n'es pas inscrit." });

                            unregisterDrinker(event, drinker)
                                .catch(err => res.status(500).json(err))
                                .then(_ => res.status(200).json({event}));
                        }

                        res.status(204).json({ message: "Tu n'es pas inscrit." });
                    });

            })
            .catch(err => res.status(500).json(err));
    })
    .catch(error => res.status(500).json({ message: "An error occurs during communications with the api of EtuUTT: " + error }))
};

exports.register = function(req, res) {
    if (!req.body.authorization_code) {
        res.status(400).json({ message: "missing authorization code" })
    }

    let EtuUTT = EtuUTTService();
    let tokenObj;

    // check if the code is valid
    EtuUTT.oauthTokenByAuthCode(req.body.authorization_code)
    .then((data) => {
        tokenObj = data;
        // get the user's data
        return EtuUTT.publicUserAccount();
    })
    .then((etuUTTUser) => {
        // get the next event
        getNextEvent()
            .then(event => {
                if (!event) {
                    res.status(404).json({ message: "Aucun évènement n'est prévu prochainement" });
                }

                // get the drinker, by student id (unique)
                Drinker.findOne({ studentId: String(etuUTTUser.data.studentId) })
                    .then(drinker => {

                        // if exists, register him to the event
                        if (drinker) {
                            // if already registered, return error
                            if (event.drinkers.filter(id => String(id) == String(drinker._id)).length)
                                res.status(409).json({ message: "Tu es déjà inscris !" });

                            registerDrinker(event, drinker)
                                .then(_ => res.status(200).json({event}))
                                .catch(err => res.status(500).json(err));
                        } else {
                            // else, store it before
                            const newDrinker = new Drinker(etuUTTUser.data);
                            newDrinker.save((err, drinker) => {
                                if (err)
                                    res.status(400).json(err);

                                registerDrinker(event, drinker)
                                    .then(_ => res.status(200).json({event}))
                                    .catch(err => res.status(500).json(err));
                            });
                        }
                    });


            })
            .catch(err => res.status(500).json(err));
    })
    .catch(error => res.status(500).json({ message: "An error occurs during communications with the api of EtuUTT: " + error }))
};

exports.get = function(req, res) {
    Event.find({}, (err, events) => {
        if (err)
            res.status(500).json(err);
        res.json(events);
    });
};

exports.getById = function(req, res) {
    Event.findById(req.params.id).populate('beers', 'drinkers').exec((err, event) => {
        if (err)
            res.status(500).json(err);
        if (!event)
            res.status(404).json(err);
        res.json(event);
    });
};

exports.getNext = function(req, res) {
    getNextEvent()
        .then(event => res.json(event))
        .catch(err => res.status(500).json(err));
};

exports.create = function(req, res) {
    const newEvent = new Event(req.body);
    newEvent.save((err, event) => {
        if (err)
            res.status(500).json(err);
        res.json(event);
    });
};

exports.update = function(req, res) {
    Event.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, (err, event) => {
        if (err)
            res.status(500).json(err);
        res.json(event);
    });
};

exports.delete = function(req, res) {
    Event.remove({_id: req.params.id}, (err, event) => {
        if (err)
            res.status(500).json(err);
        res.json({ message: "Évènement supprimé" });
    });
};
