const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: String,
    required: true,
  },
  clinic: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
