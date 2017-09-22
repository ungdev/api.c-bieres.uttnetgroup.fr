const mongoose = require('mongoose');
const Drinker = mongoose.model('Drinker');

// TODO: filter
exports.get = function(req, res) {
    let where = {};

    if (req.query.multifield) {
        where = {
            $or: [
                { lastName: { $regex: new RegExp(req.query.multifield, 'i') } },
                { firstName: { $regex: new RegExp(req.query.multifield, 'i') } }
            ]
        };
    }

    Drinker.find(where, (err, drinkers) => {
        if (err)
            res.status(500).json(err);
        res.json(drinkers);
    });
};
