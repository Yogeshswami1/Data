const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    unique: true,
  },
  sequenceValue: {
    type: Number,
    required: true,
  },
});

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
