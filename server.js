const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Mock cache object (replace with actual caching mechanism like Redis)
const cache = {};

// Middleware to parse JSON requests
app.use(express.json());

// Route to handle cached fixtures data
app.get('/cached-fixtures', async (req, res) => {
  const { season, team, league, from, to } = req.query;
  const cacheKey = `${season}-${team}-${league}-${from}-${to}`;

  // Check if data is cached
  if (cache[cacheKey]) {
    return res.json(cache[cacheKey]);
  }

  // If data is not cached, make an API call
  try {
    const response = await axios.get(`https://v3.football.api-sports.io/fixtures`, {
      params: {
        season,
        team,
        league,
        from,
        to
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'X-RapidAPI-Key': '126ab6d01ffa281853d1ae19f4c70a46'
      }
    });

    const matchesData = response.data.response;

    // Cache the data
    cache[cacheKey] = matchesData;

    return res.json(matchesData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
