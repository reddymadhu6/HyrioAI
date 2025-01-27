const Job = require('../models/Job');
const transporter = require('../config/nodemailer');

exports.postJob = async (req, res) => {
  const { title, description, experienceLevel, candidates, endDate } = req.body;

  try {
    const job = await Job.create({
      company: req.company._id,
      title,
      description,
      experienceLevel,
      candidates,
      endDate,
    });

    for (let email of candidates) {
      await transporter.sendMail({
        to: email,
        subject: `Job Alert: ${title}`,
        text: `Job Details:\n${description}\nExperience Level: ${experienceLevel}`,
      });
    }

    res.status(201).json({ message: 'Job posted and emails sent successfully', job });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
