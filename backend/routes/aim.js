const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/explanation', async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "openrouter/free", 
        messages: [{ role: 'user', content: `Explain the topic: ${topic}` }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const explanation = response.data.choices[0].message.content;
    res.json({ explanation });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

module.exports = router;


