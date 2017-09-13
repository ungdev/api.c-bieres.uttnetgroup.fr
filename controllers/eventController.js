const mongoose = require('mongoose');
const Event = mongoose.model('Event');

exports.create = function(req, res) {
    const newEvent = new Event(req.body);
    newEvent.save((err, event) => {
        if (err)
            res.send(err);
        res.json(event);
    });
}
