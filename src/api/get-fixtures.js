import axios from 'axios';

const getCurrentRound = () => {
    const currentDate = new Date(); // Current date
    const schedule = [
        { date: '2024-03-02', round: 27 },
        { date: '2024-03-09', round: 28 },
        { date: '2024-03-16', round: 29 },
        { date: '2024-03-30', round: 30 },
        { date: '2024-04-02', round: 31 },
        { date: '2024-04-06', round: 32 },
        { date: '2024-04-13', round: 33 },
        { date: '2024-04-20', round: 34 },
        { date: '2024-04-27', round: 35 },
        { date: '2024-05-04', round: 36 },
        { date: '2024-05-11', round: 37 },
        { date: '2024-05-19', round: 38 }
    ];

    // Find the latest round whose date is less than or equal to the current date
    for (let i = schedule.length - 1; i >= 0; i--) {
        const roundDate = new Date(schedule[i].date);
        if (currentDate >= roundDate) {
            return schedule[i].round;
        }
    }

    return 1; // Return 1 if no round is found (should not happen)
};

export default async (req, res) => {
    try {
        const currentRound = getCurrentRound();

        const options = {
            method: 'GET',
            url: 'https://v3.football.api-sports.io/fixtures?league=39&season=2023',
            params: {
              round: 'Regular Season - 27'
            },
            headers: {
              'X-RapidAPI-Key': '126ab6d01ffa281853d1ae19f4c70a46',
              'X-RapidAPI-Host': 'v3.football.api-sports.io',
            }
          };

        const fixtures = response.data.response;

        res.status(200).json(fixtures);
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};