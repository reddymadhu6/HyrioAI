const Company = require('../models/Company');
const generateToken = require('../utils/generateToken');
const transporter = require('../config/nodemailer');
const admin = require("../config/firebaseConfig");

exports.registerCompany = async (req, res) => {
  const { name, email, password, mobile } = req.body;

  try {
    const companyExists = await Company.findOne({ email });
    if (companyExists) return res.status(400).json({ message: 'Email already exists' });

    const company = await Company.create({ name, email, password, mobile });

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${company._id}`;
    await transporter.sendMail({
      to: email,
      subject: 'Verify your account',
      text: `Click the link to verify: ${verificationLink}`,
    });

    const result= await sendOTP(company);


    res.status(201).json({ message: 'Registration successful. Check your email for verification.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.loginCompany = async (req, res) => {
  const { email, password } = req.body;

  try {
    const company = await Company.findOne({ email });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const isMatch = await company.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(company._id);
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  const user = await Company.findOne({ _id: token });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.verified = true;
  await user.save();

  res.status(200).json({ message: "Email verified successfully! You can now log in." });
};



const OTP = require('../models/otpModel');
const twilio = require('twilio');

// Twilio credentials
const accountSid = '';
const authToken = '';
const twilioPhoneNumber ='';

const client = twilio(accountSid, authToken);

// Function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

// Function to send OTP via SMS using Twilio
async function sendSMSOTP(phone, otp) {
  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      to: phone,  // User's phone number (must be in E.164 format, e.g., +1234567890)
      from: twilioPhoneNumber, // Your Twilio phone number
    });
    console.log('OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}

// Controller to handle sending OTP
exports.sendOTP = async (req, res) => {
  const { phone } = req.body;

  const otp = generateOTP();
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 5); // OTP expires in 5 minutes

  // Save OTP in the database
  const otpRecord = new OTP({
    phone,
    otp,
    expiration,
  });

  try {
    await otpRecord.save(); // Save OTP record in DB
    await sendSMSOTP(phone, otp); // Send OTP to phone via Twilio SMS

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Controller to handle OTP verification
exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // Find OTP record in the database
    const otpRecord = await OTP.findOne({ phone });

    if (!otpRecord) {
      return res.status(404).json({ message: 'OTP not found for this phone number' });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiration) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified successfully
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};
