const express = require('express');
const SearchHistory = require('../models/SearchHistory');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Save search query
router.post('/history', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Query required' });
    }

    await SearchHistory.create({
      userId: req.userId,
      query: query.trim()
    });

    res.status(201).json({ message: 'Search saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get last 5 searches
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const searches = await SearchHistory
      .find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(5)
      .select('query timestamp');

    res.json(searches);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;