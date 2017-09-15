const mongoose = require('mongoose');
const Beer = mongoose.model('Beer');

exports.get = function(req, res) {
    Beer.find({}, (err, beer) => {
        if (err)
            res.status(400).json(err);
        res.json(beer);
    });
};

exports.getById = function(req, res) {
    Beer.findById(req.params.id).exec((err, beer) => {
        if (err)
            res.status(400).json(err);
        res.json(beer);
    });
};

exports.create = function(req, res) {
    const newBeer = new Beer(req.body);
    newBeer.save((err, beer) => {
        if (err)
            res.status(400).json(err);
        res.json(beer);
    });
};

exports.update = function(req, res) {
    Beer.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, (err, beer) => {
        if (err)
            res.status(400).json(err);
        res.json(beer);
    });
};

exports.delete = function(req, res) {
    Beer.remove({_id: req.params.id}, (err, beer) => {
        if (err)
            res.status(400).json(err);
        res.json({ message: "Bière supprimé" });
    });
};
