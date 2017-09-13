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
    }
});

module.exports = mongoose.model('Event', EventSchema);
