const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  manager: {
    type: String,
    required: true,
  },
  primaryContact: {
    type: String,
    required: true,
  },
  secondaryContact: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  enrollmentId: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending',
  },
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
