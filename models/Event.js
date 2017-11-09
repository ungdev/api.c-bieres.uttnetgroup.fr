const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    when: {
        type: Date,
        required: true,
        min: new Date() - 24*60*60*1000
    },
    beers: [{
        type: Schema.Types.ObjectId,
        ref: 'Beer'
    }],
    drinkers: [{
        type: Schema.Types.ObjectId,
        ref: 'Drinker'
    }]
});

module.exports = mongoose.model('Event', EventSchema);
