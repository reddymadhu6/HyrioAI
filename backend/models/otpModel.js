const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  expiration: { type: Date, required: true },
});

module.exports = mongoose.model('OTP', otpSchema);
