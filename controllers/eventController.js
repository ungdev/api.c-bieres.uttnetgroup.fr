const EtuUTTService = require('../services/EtuUTTService.js');
const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const Drinker = mongoose.model('Drinker');

const fileHelper = require('../helpers/fileHelper');

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

        // if already registered, nothing to do
        if (event.drinkers.includes(drinker._id)) return resolve(drinker);

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
 * @param {Response} res
 * @param {string} studentId
 */
function unregisterDrinker(res, studentId) {
    getNextEvent()
        .then(event => {
            if (!event) res.status(404).json();

            // get the drinker, by student id (unique)
            Drinker.findOne({ studentId })
                .then(drinker => {

                    // if doesn't exists or not in the event, we have nothing to do
                    if (!drinker || event.drinkers.filter(id => String(id) == String(drinker._id)).length === 0) {
                        res.status(204).json();
                    }

                    // else, unregister the drinker
                    event.drinkers = event.drinkers.filter(id => String(id) !== String(drinker._id))
                    event.save((err, savedEvent) => {
                        if (err) res.status(500).json(err);

                        drinker.events = drinker.events.filter(id => String(id) !== String(savedEvent._id))
                        drinker.save((err, savedDrinker) => {
                            if (err) res.status(500).json(err);
                            res.json();
                        });
                    });

                });
        })
        .catch(err => res.status(500).json(err));
};

exports.unregister = function(req, res) {
    if (!req.body.authorization_code && !req.body.studentId) {
        res.status(400).json({ message: "missing authorization code or id" });
    }

    // if unregister by studentId, we don't need to use EtuUTT service
    if (req.body.studentId) {
        unregisterDrinker(res, req.body.studentId);
    } else {
        // else, unregister by authorization_code.
        // so we need to fetch the user

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
            unregisterDrinker(res, etuUTTUser.data.studentId);
        })
        .catch(err => res.status(500).json({ message: "An error occurs during communications with the api of EtuUTT: " + err }))
    }

};

exports.registerById = function(req, res) {
    if (!req.body.id) {
        res.status(400).json({ message: "missing id" });
    }

    // get the next event
    getNextEvent()
        .then(event => {
            if (!event) res.status(404).json({ message: "Aucun évènement n'est prévu prochainement" });

            Drinker.findById(req.body.id).exec((err, drinker) => {
                if (err) res.status(500).json(err);
                if (!drinker) res.status(404).json({ message: "Cette personne n'existe pas." });

                registerDrinker(event, drinker)
                    .then(drinker => res.json(drinker))
                    .catch(err => res.status(500).json(err));
            });
        })
        .catch(err => res.status(500).json(err));
}

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
                                res.status(409).json({ event });

                            registerDrinker(event, drinker)
                                .then(_ => res.json({event}))
                                .catch(err => res.status(500).json(err));
                        } else {
                            // else, store it before
                            const newDrinker = new Drinker(etuUTTUser.data);
                            newDrinker.save((err, drinker) => {
                                if (err)
                                    res.status(400).json(err);

                                registerDrinker(event, drinker)
                                    .then(_ => res.json({event}))
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
    Event.findById(req.params.id).populate(['beers', 'drinkers']).exec((err, event) => {
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
    Event.findById({_id: req.params.id}).populate('beers').exec((err, event) => {
        if (err)
            res.status(500).json(err);

        fileHelper.deleteBeerImages(event.beers.map(beer => beer.image))
            .then(_ => {
                event.remove(err => {
                    if (err)
                        res.status(500).json(err);
                    res.status(200).json();
                });

            })
            .catch(err => console.log(err));
    });
};
