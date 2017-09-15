const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BeerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    event_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    }
});

module.exports = mongoose.model('Beer', BeerSchema);
