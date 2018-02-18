const mongoose = require('mongoose')
const Beer = mongoose.model('Beer')
const Event = mongoose.model('Event')

const fileHelper = require('../helpers/fileHelper')

exports.get = (req, res) => {
  Beer.find()
    .then(beers => res.json(beers))
    .catch(err => res.status(500).json(err))
}

exports.getById = (req, res) => {
  Beer.findById(req.params.id)
    .then(beer => {
      if (!beer)
        return res.status(404).send()
      res.json(beer)
    })
    .catch(err => res.status(500).json(err))
}

exports.create = (req, res) => {
  // save the uploaded image if uploaded
  fileHelper.saveUploadedBeerImage(req.file)
    .then(filename => {
      const newBeer = new Beer(req.body)
      newBeer.image = filename
      newBeer.save()
        .then(beer => {
          Event.findById(beer.event_id)
            .then(event => {
              event.beers.push(beer)
              event.save().then(_ => res.status(201).json(beer))
            })
        })
        .catch(err => res.status(err.name === "ValidationError" ? 400 : 500).json(err))
    })
    .catch(err => res.status(500).json(err))
}

exports.update = (req, res) => {
  fileHelper.saveUploadedBeerImage(req.file)
    .then(filename => {
      req.body.image = filename ? filename : req.body.image
      Beer.findByIdAndUpdate(req.params.id, req.body, {new: true})
        .then(beer => res.status(beer ? 204 : 404).send())
        .catch(err => res.status(err.name === "ValidationError" ? 400 : 500).json(err))
    })
    .catch(err => res.status(500).json(err))
}

exports.delete = (req, res) => {
  Beer.findById(req.params.id)
    .then(beer => {
      if (!beer)
        return res.status(404).send()
      fileHelper.deleteBeerImage(beer.image)
        .then(_ => {
          Event.findById(beer.event_id)
            .then(event => {
              event.beers = event.beers.filter(id => id != beer._id)
              event.save().then(_ => {
                beer.remove()
                res.status(204).send()
              })
            })
        })
        .catch(err => res.status(500).send())
    })
    .catch(err => res.status(err.name === "CastError" ? 400 : 500).json(err))
}
