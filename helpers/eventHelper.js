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
    // next event can be today ! So greater than yesterday
    let yesterday = new Date();
    yesterday.setTime(yesterday.getTime() - 24*60*60*1000);
    Event.find({ when: {$gt: yesterday} }).populate('beers').sort({when: 'asc'}).limit(1).exec((err, events) => {
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
 * @param {Drinker}
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
 * Given an Event and a Drinker,
 * unregister the Drinker to the Event
 *
 * @param {Event}
 * @param {Drinker}
 * @return {Promise}
 */
function unregisterDrinker(event, drinker) {
  return new Promise((resolve, reject) => {
    // remove the drinker from the drinkers of this event
    event.drinkers = event.drinkers.filter(id => String(id) !== String(drinker._id))
    // save changes
    event.save((err, savedEvent) => {
      if (err)
        reject(err)
      // remove the event from the events of this drinker
      drinker.events = drinker.events.filter(id => String(id) !== String(savedEvent._id))
      // save changes
      drinker.save((err, savedDrinker) => {
        if (err)
          reject(err)
        resolve({event: savedEvent, drinker: savedDrinker})
      })
    })
  })
}

module.exports = {getNextEvent, unregisterDrinker, registerDrinker};
