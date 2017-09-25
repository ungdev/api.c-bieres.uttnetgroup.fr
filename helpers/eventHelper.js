const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const Drinker = mongoose.model('Drinker');

/**
 * Make a request to find the next Event from now
 *
 * @return {Promise}
 */
function getNextEvent() {
    return new Promise((resolve, reject) => {
        Event.find({ when: {$gt: new Date()} }).populate('beers').sort({when: 'asc'}).limit(1).exec((err, events) => {
            if (err)
                reject(err);
            resolve(events[0]);
        });
    });
}

/**
 * Given an Event and a Drinker,
 * register the Drinker to the Event
 *
 * @param {Event}
 * @param {Drinker}g
 * @return {Promise}
 */
function registerDrinker(event, drinker) {
    return new Promise((resolve, reject) => {

        // if already registered, nothing to do
        if (event.drinkers.includes(drinker._id)) resolve({drinker, event});

        event.drinkers.push(drinker);
        event.save((err, savedEvent) => {
            if (err)
                reject(err);

            drinker.events.push(savedEvent);
            drinker.save((err, savedDrinker) => {
                if (err)
                    reject(err);
                resolve({drinker, event});
            });
        });
    });
}

/**
 * Given an Event remove the given drinker,
 * register the drinker to the Event
 *
 * @param {Response} res
 * @param {string} studentId
 */
function unregisterDrinker(res, studentId) {
    eventHelper.getNextEvent()
        .then(event => {
            if (!event) res.status(404).json();

            // get the drinker, by student id (unique)
            Drinker.findOne({ studentId })
                .then(drinker => {

                    // if doesn't exists or not in the event, we have nothing to do
                    if (!drinker || event.drinkers.filter(id => String(id) == String(drinker._id)).length === 0) {
                        res.status(204).json();
                    }

                    // else, unregister the drinker
                    event.drinkers = event.drinkers.filter(id => String(id) !== String(drinker._id))
                    event.save((err, savedEvent) => {
                        if (err) res.status(500).json(err);

                        drinker.events = drinker.events.filter(id => String(id) !== String(savedEvent._id))
                        drinker.save((err, savedDrinker) => {
                            if (err) res.status(500).json(err);
                            res.json({event: savedEvent, drinker});
                        });
                    });

                });
        })
        .catch(err => res.status(500).json(err));
};

module.exports = {getNextEvent, unregisterDrinker, registerDrinker};
