const mongoose = require('mongoose');
const Drinker = mongoose.model('Drinker');
const eventHelper = require('../helpers/eventHelper');

exports.create = function(req, res) {
    // A Drinker is created on the registration for the next event.
    // So we need to fetch the next event
    eventHelper.getNextEvent()
        .then(event => {
            if (!event) res.status(404).json();

            if (req.body.studentId == "") {
                delete req.body.studentId;
            }

            const newDrinker = new Drinker(req.body);
            newDrinker.save((err, drinker) => {
                if (err) res.status(500).json(err);

                eventHelper.registerDrinker(event, drinker)
                    .then(results => res.json(results))
                    .catch(err => res.status(500).json(err));
            });

        })
        .catch(err => res.status(500).json(err));
};

exports.get = function(req, res) {
    let where = {};

    if (req.query.multifield) {
        where['$or'] = [
            { lastName: { $regex: new RegExp(req.query.multifield, 'i') } },
            { firstName: { $regex: new RegExp(req.query.multifield, 'i') } }
        ]
    }

    if (req.query.nextEvent) {
        eventHelper.getNextEvent()
            .then(event => {
                if (!event) res.status(404);

                //where.events = { $ne: event._id };

                //console.log(where);

                fetchDrinker(res, where);
            })
            .catch(err => res.status(500).json(err));
    } else {
        fetchDrinker(res, where);
    }

};

function fetchDrinker(res, where) {
    Drinker.find(where, (err, drinkers) => {
        if (err)
            res.status(500).json(err);
        
        res.json(drinkers);
    });
}
