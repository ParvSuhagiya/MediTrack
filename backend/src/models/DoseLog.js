const mongoose = require('mongoose');

const doseLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  takenAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DoseLog', doseLogSchema);