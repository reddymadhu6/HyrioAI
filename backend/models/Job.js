const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  experienceLevel: { type: String, required: true, enum: ['BEGINNER', 'INTERMEDIATE', 'EXPERT'] },
  candidates: [{ type: String }],
  endDate: { type: Date, required: true },
});

module.exports = mongoose.model('Job', jobSchema);
