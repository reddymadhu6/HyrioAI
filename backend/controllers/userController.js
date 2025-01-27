const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/Company");

const sendVerificationEmail = async (user) => {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  user.emailVerificationToken = verificationToken;
  await user.save();

  const verificationLink = `http://localhost:5000/api/users/verify-email/${verificationToken}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verify Your Email",
    html: `<p>Click the link below to verify your email:</p>
           <a href="${verificationLink}">${verificationLink}</a>`,
  };

  await transporter.sendMail(mailOptions);
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = new User({ companyName, email, password, phone });
  await user.save();

  await sendVerificationEmail(user);

  res.status(201).json({ message: "Registration successful! Verify your email to activate your account." });
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.verified = true;
  user.emailVerificationToken = null;
  await user.save();

  res.status(200).json({ message: "Email verified successfully! You can now log in." });
};

module.exports = { registerUser, verifyEmail };
