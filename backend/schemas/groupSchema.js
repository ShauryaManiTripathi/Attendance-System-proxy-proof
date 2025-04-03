const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  department: { type: String, required: true }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
