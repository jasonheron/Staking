const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

// Define the team IDs
const teamIds = [33, 34, 35, 36, 40, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 55, 62, 63, 65, 66];
const season = 2023;


const dates = [
    '09/03/2024',
    '16/03/2024',
    '30/03/2024',
    '02/04/2024',
    '06/04/2024',
    '13/04/2024',
    '20/04/2024',
    '27/04/2024',
    '04/05/2024',
    '11/05/2024',
    '19/05/2024',
  ];

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentDay = String(today.getDate()).padStart(2, '0');

    const formattedDates = dates.map(date => {
      const [day, month, year] = date.split('/');
      return new Date(`${year}-${month}-${day}`);
    }).filter(date => date < today);

    const previousDate = formattedDates[formattedDates.length - 1]; // Last date before today
    if (previousDate) {
      const year = previousDate.getFullYear();
      const month = (`0${previousDate.getMonth() + 1}`).slice(-2); // JavaScript months are 0-indexed
      const day = (`0${previousDate.getDate()}`).slice(-2);
      setStartDate(`const startDate = \`${year}-${month}-${day}\`;`);
    }

    setEndDate(`const endDate = \`${currentYear}-${currentMonth}-${currentDay}\`;`);
  }, []);



// Function to fetch fixture outcomes for specific teams
const fetchFixtureOutcomesForTeams = async () => {
    let outcomes = [];

    try {
        // Fetch outcomes for each team
        for (const teamId of teamIds) {
            const response = await axios.get(`https://v3.football.api-sports.io/fixtures?season=${season}&team=${teamId}&league=39&from=${startDate}&to=${endDate}`, {
                headers: {
                    'X-RapidAPI-Key': '126ab6d01ffa281853d1ae19f4c70a46'
                }
            });
            // Combine outcomes
            outcomes = outcomes.concat(response.data.response);
        }
        
        return outcomes;
    } catch (error) {
        console.error('Error fetching fixture outcomes:', error);
        return [];
    }
};

// Endpoint to get Premier League outcomes for specific teams
app.get('/get-premier-league-outcomes', async (req, res) => {
    const fixtureOutcomes = await fetchFixtureOutcomesForTeams();
    res.json(fixtureOutcomes);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
