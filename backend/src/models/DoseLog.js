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
  },
  takenAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['taken', 'missed', 'skipped'],
    required: true,
  },
});

module.exports = mongoose.model('DoseLog', doseLogSchema);