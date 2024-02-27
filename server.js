const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const app = express();
const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 }); // Cache TTL in seconds

app.get('/api/matches', async (req, res) => {
  const { season, teamId, league, from, to } = req.query;
  const cacheKey = `matches-${season}-${teamId}-${league}-${from}-${to}`;
  const cachedData = myCache.get(cacheKey);

  if (cachedData) {
    console.log('Returning cached data');
    res.json(cachedData);
  } else {
    try {
      const response = await axios.get(`https://v3.football.api-sports.io/fixtures?season=${season}&team=${teamId}&league=${league}&from=${from}&to=${to}`, {
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'X-RapidAPI-Key': '126ab6d01ffa281853d1ae19f4c70a46' // Use environment variables for API keys
        }
      });

      myCache.set(cacheKey, response.data, 60 * 60); // Cache for 1 hour
      console.log('Data fetched and cached');
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
      res.status(500).json({ message: 'Error fetching data' });
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
