const mongoose = require("mongoose");

const groupStudentSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }
});

// Add index for performance
groupStudentSchema.index({ group: 1, student: 1 }, { unique: true });

const GroupStudent = mongoose.model('GroupStudent', groupStudentSchema);

module.exports = GroupStudent;
