const mongoose = require('mongoose');
const Beer = mongoose.model('Beer');
const Event = mongoose.model('Event');

const fileHelper = require('../helpers/fileHelper');

exports.get = function(req, res) {
    Beer.find({}, (err, beer) => {
        if (err)
            return res.status(400).json(err);
        res.json(beer);
    });
};

exports.getById = function(req, res) {
    Beer.findById(req.params.id).exec((err, beer) => {
        if (err)
            return res.status(400).json(err);
        res.json(beer);
    });
};

exports.create = function(req, res) {
    // save the uploaded image if uploaded
    fileHelper.saveUploadedBeerImage(req.file)
        .then(filename => {
            const newBeer = new Beer(req.body);
            newBeer.image = filename;
            newBeer.save((err, beer) => {
                console.log(beer);
                if (err)
                    return res.status(400).json(err);
                if (!beer)
                    return res.status(500).json();

                Event.findById(beer.event_id).exec((err, event) => {
                    event.beers.push(beer);
                    event.save(err => {
                        res.json(beer)
                    });
                });
            });
        })
        .catch(err => res.status(500).json(err));
};

exports.update = function(req, res) {
    fileHelper.saveUploadedBeerImage(req.file)
        .then(filename => {
            req.body.image = filename ? filename : req.body.image;
            Beer.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, (err, beer) => {
                if (err)
                    return res.status(400).json(err);
                res.json(beer);
            });
        })
        .catch(err => res.status(500).json(err));
};

exports.delete = function(req, res) {

    Beer.findById(req.params.id).exec((err, beer) => {
        if (err)
            return res.status(400).json(err);
        fileHelper.deleteBeerImage(beer.image)
            .then(_ => {
                Event.findById(beer.event_id).exec((err, event) => {
                    event.beers = event.beers.filter(id => id != beer._id);
                    event.save(err => {
                        beer.remove();
                        res.json();
                    });
                });
            })
            .catch(err => console.log(err));
    });
};
