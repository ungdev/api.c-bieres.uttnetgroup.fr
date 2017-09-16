const mongoose = require('mongoose');
const Event = mongoose.model('Event');

exports.get = function(req, res) {
    Event.find({}, (err, event) => {
        if (err)
            res.status(400).json(err);
        res.json(event);
    });
};

exports.getById = function(req, res) {
    Event.findById(req.params.id).populate('beers').exec((err, event) => {
        if (err)
            res.status(400).json(err);
        res.json(event);
    });
};

exports.getNext = function(req, res) {
    Event.find({ when: {$gt: new Date()} }).populate('beers').sort({when: 'asc'}).limit(1).exec((err, events) => {
        if (err)
            res.status(400).json(err);
        res.json(events[0]);
    });
};

exports.create = function(req, res) {
    const newEvent = new Event(req.body);
    newEvent.save((err, event) => {
        if (err)
            res.status(400).json(err);
        res.json(event);
    });
};

exports.update = function(req, res) {
    Event.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, (err, event) => {
        if (err)
            res.status(400).json(err);
        res.json(event);
    });
};

exports.delete = function(req, res) {
    Event.remove({_id: req.params.id}, (err, event) => {
        if (err)
            res.status(400).json(err);
        res.json({ message: "Évènement supprimé" });
    });
};
