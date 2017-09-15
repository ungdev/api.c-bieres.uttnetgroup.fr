const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    when: {
        type: Date,
        required: true
    },
    beers: [{
        type: Schema.Types.ObjectId,
        ref: 'Beer' 
    }]
});

module.exports = mongoose.model('Event', EventSchema);
