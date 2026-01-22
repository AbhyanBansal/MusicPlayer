const axios = require('axios');

const BASE_URL = 'https://saavn.sumit.co/api';

async function testApi() {
    try {
        console.log('--- Testing Albums Artists ---');
        const albumRes = await axios.get(`${BASE_URL}/search/albums?query=rockstar&limit=1`);
        if (albumRes.data.data.results[0]) {
            const item = albumRes.data.data.results[0];
            console.log('Type of artists:', typeof item.artists);
            console.log('Is Array?', Array.isArray(item.artists));
            console.log('Value:', JSON.stringify(item.artists, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testApi();
