const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  credits: { type: Number, required: true }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
