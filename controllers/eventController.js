const EtuUTTService = require('../services/EtuUTTService.js');
const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const Drinker = mongoose.model('Drinker');

const eventHelper = require('../helpers/eventHelper');
const fileHelper = require('../helpers/fileHelper');

exports.unregister = function(req, res) {
    if (!req.body.authorization_code) {
        res.status(400).json({ message: "missing authorization code" });
    }

    // unregister by authorization_code.
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
        Drinker.findOne({ studentId: etuUTTUser.data.studentId })
            .then(drinker => {
                eventHelper.getNextEvent()
                    .then(event => {
                        eventHelper.unregisterDrinker(event, drinker)
                            .then(result => res.status(result.code).json(result.data))
                            .catch(err => res.status(500).json(err));
                    })
                    .catch(err => res.status(500).json(err));
            })
            .catch(err => res.status(500).json(err));
    })
    .catch(err => res.status(500).json({ message: "An error occurs during communications with the api of EtuUTT: " + err }))

};

exports.unregisterById = function(req, res) {
    if (!req.body.id) {
        res.status(400).json({ message: "missing id" });
    }
    if (!req.body.eventId) {
        res.status(400).json({ message: "missing event id" });
    }

    Event.findById(req.body.eventId).populate('drinkers').exec((err, event) => {
        if (err) res.status(500).json();
        if (!event) res.status(404).json();

        Drinker.findById(req.body.id).populate('events').exec((err, drinker) => {
            if (err) res.status(500).json();
            if (!drinker) res.status(404).json();

            eventHelper.unregisterDrinker(event, drinker)
                .then(result => res.status(result.code).json(result.data))
                .catch(err => res.status(500).json(err));
        })
    })
};

exports.registerById = function(req, res) {
    if (!req.body.id) {
        res.status(400).json({ message: "missing drinker id" });
    }
    if (!req.body.eventId) {
        res.status(400).json({ message: "missing event id" });
    }

    // get the next event
    Event.findById(req.body.eventId)
        .then(event => {
            if (!event) res.status(404).json({ message: "L'évènement n'existe pas" });

            Drinker.findById(req.body.id).exec((err, drinker) => {
                if (err) res.status(500).json(err);
                if (!drinker) res.status(404).json({ message: "Cette personne n'existe pas." });

                eventHelper.registerDrinker(event, drinker)
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
        eventHelper.getNextEvent()
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
                                return res.status(409).json({ event });

                            eventHelper.registerDrinker(event, drinker)
                                .then(_ => res.json({event}))
                                .catch(err => res.status(500).json(err));
                        } else {
                            // else, store it before
                            const newDrinker = new Drinker(etuUTTUser.data);
                            newDrinker.save((err, drinker) => {
                                if (err)
                                    res.status(400).json(err);

                                eventHelper.registerDrinker(event, drinker)
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
    Event.find().sort(req.query.sort).exec((err, events) => {
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
    eventHelper.getNextEvent()
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
    Event.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, runValidators: true }, (err, event) => {
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
