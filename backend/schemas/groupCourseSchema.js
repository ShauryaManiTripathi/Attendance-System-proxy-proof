const mongoose = require("mongoose");

const groupCourseSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true }
});

// Add index for performance
groupCourseSchema.index({ group: 1, course: 1, faculty: 1 }, { unique: true });

const GroupCourse = mongoose.model('GroupCourse', groupCourseSchema);

module.exports = GroupCourse;
