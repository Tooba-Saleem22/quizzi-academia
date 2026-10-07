const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENROUTER_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1/chat/completions',
  model: "meta-llama/llama-3.2-3b-instruct:free", 
};

router.post('/generate-explanation', async (req, res) => {
  try {
    const { question, options, correctAnswerIndex, userAnswerIndex } = req.body;

    if (!question || !options || correctAnswerIndex === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: question, options, and correctAnswerIndex'
      });
    }

    if (!OPENROUTER_CONFIG.apiKey) {
      return res.status(500).json({
        error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in environment variables.'
      });
    }

    const isUserCorrect = userAnswerIndex === correctAnswerIndex;
    const correctOption = options[correctAnswerIndex];
    const userOption = userAnswerIndex !== undefined ? options[userAnswerIndex] : null;

    const prompt = `As an expert educational AI, analyze this quiz question and provide a clear, educational explanation.

**Question:** ${question}

**Options:**
${options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join('\n')}

**Correct Answer:** ${String.fromCharCode(65 + correctAnswerIndex)}. ${correctOption}
${userOption && !isUserCorrect ? `**Student's Answer:** ${String.fromCharCode(65 + userAnswerIndex)}. ${userOption}` : ''}
**Student was:** ${isUserCorrect ? 'CORRECT' : 'INCORRECT'}

Please provide a comprehensive explanation that includes:

1. **Why the correct answer is right** - Explain the reasoning and key concepts
2. **Common misconceptions** - Why other options might seem appealing but are wrong
3. **Key learning points** - Important concepts students should remember
4. **Additional context** - Any helpful background information or tips

Keep the explanation educational, encouraging, and under 300 words. Focus on helping the student understand the concept rather than just the answer.`;

    console.log('Sending request to OpenRouter API...');

    const response = await axios.post(
      OPENROUTER_CONFIG.baseURL,
      {
        model: "meta-llama/llama-3.2-3b-instruct:free",         messages: [
          {
            role: 'system',
            content: 'You are an expert educational AI assistant. Your role is to provide clear, detailed explanations for quiz questions that help students learn and understand concepts better. Always be encouraging and focus on education rather than just correctness.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3, 
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'Quiz Explanation Generator',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        },
        timeout: 30000 
      }
    );

    console.log('OpenRouter API response received');

    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      console.error('Invalid response format from OpenRouter:', response.data);
      return res.status(500).json({
        error: 'Invalid response format from AI service'
      });
    }

    const explanation = response.data.choices[0].message.content.trim();

    if (!explanation || explanation.length < 10) {
      console.error('Generated explanation is too short or empty:', explanation);
      return res.status(500).json({
        error: 'Generated explanation is invalid'
      });
    }

    console.log(`AI explanation generated successfully. Tokens used: ${response.data.usage?.total_tokens || 'unknown'}`);

    res.json({
      success: true,
      explanation: explanation,
      metadata: {
        model: "meta-llama/llama-3.2-3b-instruct:free", // Free model        tokensUsed: response.data.usage?.total_tokens || 0,
        isCorrect: isUserCorrect
      }
    });

  } catch (error) {
    console.error('Error generating AI explanation:', error);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      console.error(`OpenRouter API Error (${status}):`, errorData);

      if (status === 401) {
        return res.status(500).json({
          error: 'Invalid API key. Please check your OpenRouter API key configuration.'
        });
      } else if (status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.'
        });
      } else if (status === 400) {
        return res.status(400).json({
          error: 'Invalid request format. Please check your input data.'
        });
      } else {
        return res.status(500).json({
          error: `AI service error: ${errorData.error?.message || 'Unknown error'}`
        });
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
      return res.status(500).json({
        error: 'Failed to connect to AI service. Please check your internet connection.'
      });
    } else {
      console.error('Unexpected error:', error.message);
      return res.status(500).json({
        error: 'An unexpected error occurred while generating explanation.'
      });
    }
  }
});

router.get('/test-connection', async (req, res) => {
  try {
    if (!OPENROUTER_CONFIG.apiKey) {
      return res.status(500).json({
        error: 'OpenRouter API key not configured'
      });
    }

    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
      },
      timeout: 10000
    });

    res.json({
      success: true,
      message: 'OpenRouter API connection successful',
      availableModels: response.data.data?.slice(0, 5).map(model => model.id) || []
    });

  } catch (error) {
    console.error('Test connection error:', error.message);
    res.status(500).json({
      error: 'Failed to connect to OpenRouter API',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;