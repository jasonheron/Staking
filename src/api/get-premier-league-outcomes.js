import axios from 'axios';

const teamIds = [33, 34, 35, 36, 40, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 55, 62, 63, 65, 66];
const season = 2023; // Adjust season as needed
let cachedData = { timestamp: null, outcomes: [] };

const dates = [
    '2024-03-09',
    '2024-03-16',
    '2024-03-30',
    '2024-04-02',
    '2024-04-06',
    '2024-04-13',
    '2024-04-20',
    '2024-04-27',
    '2024-05-04',
    '2024-05-11',
    '2024-05-19',
];

export default async (req, res) => {
    const now = new Date();
    if (cachedData.timestamp && (now.getTime() - cachedData.timestamp) < 3600000) { // 1 hour cache validity
        return res.status(200).json(cachedData.outcomes);
    }

    // Format endDate as YYYY-MM-DD
const endDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

// Find the most recent date from the list in the format YYYY-MM-DD
const mostRecentDate = dates
    .map(date => {
        const [day, month, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    })
    .find(date => new Date(date) < now);


    let outcomes = [];

    try {
        for (const teamId of teamIds) {
            const response = await axios.get(`https://v3.football.api-sports.io/fixtures?season=${season}&team=${teamId}&league=39&from=${mostRecentDate}&to=${endDate}`, {
                headers: {
                    'X-RapidAPI-Key': '126ab6d01ffa281853d1ae19f4c70a46'
                }
            });
            outcomes = outcomes.concat(response.data.response);
        }
        
        // Update cache
        cachedData = { timestamp: now.getTime(), outcomes };

        res.status(200).json(outcomes);
    } catch (error) {
        console.error('Error fetching fixture outcomes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
