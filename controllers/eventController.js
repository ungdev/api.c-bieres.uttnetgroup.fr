const mongoose = require('mongoose');
const Event = mongoose.model('Event');

exports.get = function(req, res) {
    Event.find({}, (err, event) => {
        if (err)
            res.send(err);
        res.json(event);
    });
};

exports.getById = function(req, res) {
    Event.findById(req.params.id, (err, event) => {
        if (err)
            res.send(err);
        res.json(event);
    });
};

exports.create = function(req, res) {
    const newEvent = new Event(req.body);
    newEvent.save((err, event) => {
        if (err)
            res.send(err);
        res.json(event);
    });
};

exports.update = function(req, res) {
    Event.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, (err, event) => {
        if (err)
            res.send(err);
        res.json(event);
    });
};

exports.delete = function(req, res) {
    Event.remove({_id: req.params.id}, (err, event) => {
        if (err)
            res.send(err);
        res.json({ message: "Évènement supprimé" });
    });
};
