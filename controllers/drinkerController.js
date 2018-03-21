const mongoose = require('mongoose')
const Drinker = mongoose.model('Drinker')
const Event = mongoose.model('Event')

const eventHelper = require('../helpers/eventHelper')

exports.get = (req, res) => {
  let where = {}

  if (req.query.multifield) {
    where['$or'] = [
      { lastName: { $regex: new RegExp(req.query.multifield, 'i') } },
      { firstName: { $regex: new RegExp(req.query.multifield, 'i') } }
    ]
  }

  if (req.query.event) {
    where['events'] = { $ne: req.query.event }
  }

  Drinker.find(where)
    .then(drinkers => res.json(drinkers))
    .catch(err => res.status(500).json(err))
}

function createDrinker(req, res, event) {
  if (!event)
    return res.status(404).send()
  if (req.body.studentId == "")
    delete req.body.studentId

  new Drinker(req.body).save()
    .then(drinker => {
      eventHelper.registerDrinker(event, drinker)
        .then(drinker => res.status(201).json(drinker))
        .catch(err => res.status(500).json(err))
    })
    .catch(err => res.status(err.name === "ValidationError" ? 400 : 500).json(err))
}

exports.create = (req, res) => {
  if (req.body.eventId) {
    Event.findById(req.body.eventId)
      .then(event => {
        if (new Date(event.when) < new Date()) {
          return res.status(400).send()
        }
        createDrinker(req, res, event)
      })
      .catch(err => res.status(err.name === "CastError" ? 400 : 500).json(err))
  } else {
    eventHelper.getNextEvent()
      .then(event => createDrinker(req, res, event))
      .catch(err => res.status(500).json(err))
  }
}

exports.updateEmails = (req, res) => {
  // fetch all the drinkers and set default email
  Drinker.find()
    .then(drinkers => {
      return drinkers.map(drinker => {
        updateEmail(drinker)
        return drinker.save()
      })
    })
    .then(promises => Promise.all(promises))
    .then(_ => res.json())
    .catch(err => res.status(500).json(err))
}

function updateEmail(drinker) {
  return new Promise((resolve, reject) => {
    drinker.email = `${formatName(drinker.firstName)}.${formatName(drinker.lastName)}@utt.fr`
    drinker.save()
      .then(_ => resolve())
      .catch(e => reject(e))
  })
}

function formatName(name) {
  return name.split(' ').join('_').toLowerCase()
}
