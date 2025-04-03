const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  timestamp: { type: Date, default: Date.now }
});

// Add index for performance
attendanceSchema.index({ session: 1, student: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
