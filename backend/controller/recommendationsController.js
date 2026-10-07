const axios = require('axios');

const getYouTubeRecommendations = async (req, res) => {
  const { searchTerms } = req.body;

  if (!searchTerms || !Array.isArray(searchTerms) || searchTerms.length === 0) {
    return res.status(400).json({ message: 'Search terms are required.' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const allVideos = [];

  try {
    for (const term of searchTerms) {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: term,
          type: 'video',
          maxResults: 2,
          key: apiKey,
        },
      });

      if (response.data.items) {
        const videos = response.data.items.map(item => ({
          title: item.snippet.title,
          link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails.medium?.url,
          description: item.snippet.description,
          channel: item.snippet.channelTitle,
          topic: term.replace(' tutorial', ''),
        }));
        allVideos.push(...videos);
      }
    }

    const uniqueVideos = allVideos.filter(
      (video, index, self) => index === self.findIndex(v => v.title === video.title)
    );

    res.status(200).json(uniqueVideos.slice(0, 5));

  } catch (error) {
    console.error('YouTube API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch video recommendations.' });
  }
};

module.exports = getYouTubeRecommendations;
