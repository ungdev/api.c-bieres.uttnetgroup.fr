const EtuUTTService = require('../services/EtuUTTService.js');
const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const Drinker = mongoose.model('Drinker');

const eventHelper = require('../helpers/eventHelper');
const fileHelper = require('../helpers/fileHelper');

/**
 * Register the given Drinker to the given Event
 * @param  {Response} res
 * @param  {Event} event
 * @param  {Drinker} drinker
 */
const _register = (res, event, drinker) => {
  eventHelper.registerDrinker(event, drinker)
    .then(_ => res.json({event}))
    .catch(err => res.status(500).json(err))
}

/**
 * Unregister the given Drinker to the given Event
 * @param  {Response} res
 * @param  {Event} event
 * @param  {Drinker} drinker
 */
const _unregister = (res, event, drinker) => {
  eventHelper.unregisterDrinker(event, drinker)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err))
}

/**
 * Handle register requests
 * @param  {Request} req
 * @param  {Response} res
 */
exports.register = function(req, res) {
  // by default, register the requester. If id in body, register the drinker with this id
  const toRegister = req.body.id || req.payload.id
  // if id in body, check that the requester is allowed to register him
  if (toRegister != req.payload.id && !req.payload.isAdmin)
    return res.status(403).json({ message: "Non authorisé à inscrire cette personne." })

  Drinker.findById(toRegister)
    .then(drinker => {
      // if event in request, fetch this event, else, fetch the next event
      if (req.body.eventId) {
        Event.findById(req.body.eventId)
          .then(event => {
            if (!event)
              return res.status(404).json({ message: "L'évènement n'existe pas" })
            // all is ok, register the drinker to this event
            _register(res, event, drinker)
          })
          .catch(err => res.status(500).json(err))
      } else {
        // get the next event
        eventHelper.getNextEvent()
          .then(event => {
            // if no next event, return error
            if (!event)
              return res.status(404).json({ message: "Aucun évènement n'est prévu prochainement" });
            // if already registered, return error
            if (event.drinkers.filter(id => String(id) == String(drinker._id)).length)
              return res.status(409).json({ event })
            // all is ok, register the drinker to the next event
            _register(res, event, drinker)
          })
          .catch(err => res.status(500).json(err));
      }
    })
}

/**
 * Handle unregister requests
 * @param  {Request} req
 * @param  {Response} res
 */
exports.unregister = function(req, res) {
  // by default, unregister the requester. If id in body, unregister the drinker with this id
  const toUnregister = req.body.id || req.payload.id
  // if id in body, check that the requester is allowed to unregister him
  if (toUnregister != req.payload.id && !req.payload.isAdmin)
    return res.status(403).json({ message: "Non authorisé à désinscrire cette personne." })
  Drinker.findById(toUnregister)
    .then(drinker => {
      if (!drinker)
        return res.status(404).json({ message: "La personne a désinscrire n'existe pas." })
      // if event in request, fetch this event, else, fetch the next event
      if (req.body.eventId) {
        Event.findById(req.body.eventId)
          .then(event => {
            if (!event)
              return res.status(404).json({ message: "L'évènement n'existe pas" })
            // all is ok, unregister the drinker to this event
            _unregister(res, event, drinker)
          })
          .catch(err => res.status(500).json(err))
      } else {
        // get the next event
        eventHelper.getNextEvent()
          .then(event => {
            // if no next event, return error
            if (!event)
              return res.status(404).json({ message: "Aucun évènement n'est prévu prochainement" });
            // if not registered, return success
            if (event.drinkers.filter(id => String(id) == String(drinker._id)).length === 0)
              return res.status(200).json({ event })
            // all is ok, unregister the drinker to the next event
            _unregister(res, event, drinker)
          })
          .catch(err => res.status(500).json(err));
      }
    })
}

exports.get = function(req, res) {
    // if before attribute in query, return only events than happened before this date
    const query = req.query.before ? {when: {"$lt": req.query.before}} : {};

    Event.find(query).populate(['beers', 'drinkers']).sort(req.query.sort).exec((err, events) => {
        if (err)
            return res.status(500).json(err);

        res.json(events);
    });
};

exports.getById = function(req, res) {
    Event.findById(req.params.id).populate(['beers', 'drinkers']).exec((err, event) => {
        if (err)
            return res.status(500).json(err);
        if (!event)
            return res.status(404).json(err);
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
            return res.status(500).json(err);
        res.json(event);
    });
};

exports.update = function(req, res) {
    Event.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, runValidators: true }, (err, event) => {
        if (err)
            return res.status(500).json(err);
        res.json(event);
    });
};

exports.delete = function(req, res) {
    Event.findById({_id: req.params.id}).populate('beers').exec((err, event) => {
        if (err)
            return res.status(500).json(err);

        fileHelper.deleteBeerImages(event.beers.map(beer => beer.image))
            .then(_ => {
                event.remove(err => {
                    if (err)
                        return res.status(500).json(err);
                    res.status(200).json();
                });

            })
            .catch(err => console.log(err));
    });
};
