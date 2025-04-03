const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  topic: { type: String }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
