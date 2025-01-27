const express = require('express');
const { postJob } = require('../controllers/jobController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/post', protect, postJob);

module.exports = router;
