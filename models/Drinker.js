const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DrinkerSchema = new Schema({
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    validate: (email) => {
      return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
    }
  },
  inMailList: {
    type: Boolean,
    default: true
  },
  events: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }]
})

module.exports = mongoose.model('Drinker', DrinkerSchema)
