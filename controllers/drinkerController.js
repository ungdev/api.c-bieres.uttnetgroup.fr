const mongoose = require('mongoose');
const Drinker = mongoose.model('Drinker');
const Event = mongoose.model('Event');
const eventHelper = require('../helpers/eventHelper');

function createDrinker(req, res, event) {
    if (!event) res.status(404).json();

    if (req.body.studentId == "") {
        delete req.body.studentId;
    }

    const newDrinker = new Drinker(req.body);
    newDrinker.save((err, drinker) => {
        if (err) return res.status(500).json(err);

        eventHelper.registerDrinker(event, drinker)
            .then(results => res.json(results))
            .catch(err => res.status(500).json(err));
    });
}

exports.create = function(req, res) {
    // A Drinker is created on the registration for a futur event (by def)
    if (req.body.eventId) {
        Event.findOne({ _id: req.body.eventId, when: {$gt: new Date()} })
            .then(event => {
                createDrinker(req, res, event);
            })
            .catch(err => res.status(500).json(err));
    } else {
        eventHelper.getNextEvent()
            .then(event => {
                createDrinker(req, res, event);
            })
            .catch(err => res.status(500).json(err));
    }
};

exports.get = function(req, res) {
    let where = {};

    if (req.query.multifield) {
        where['$or'] = [
            { lastName: { $regex: new RegExp(req.query.multifield, 'i') } },
            { firstName: { $regex: new RegExp(req.query.multifield, 'i') } }
        ]
    }

    if (req.query.event) {
        where['events'] = { $ne: req.query.event };
    }

    Drinker.find(where, (err, drinkers) => {
        if (err)
            return res.status(500).json(err);

        res.json(drinkers);
    });

};
