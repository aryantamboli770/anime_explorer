const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Encryption function
const encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(process.env.ENCRYPT_KEY),
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(text)),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

// Get encrypted profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileData = {
      email: user.email,
      joined: user.joined.toISOString().split('T')[0]
    };

    const encryptedData = encrypt(profileData);

    res.json({ encryptedProfile: encryptedData });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;