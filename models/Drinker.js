const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DrinkerSchema = new Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    events: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

module.exports = mongoose.model('Drinker', DrinkerSchema);