const axios = require('axios');

const BASE_URL = 'https://saavn.sumit.co/api';

async function testApi() {
    try {
        const artistRes = await axios.get(`${BASE_URL}/search/artists?query=arijit&limit=1`);
        if (artistRes.data.data.results[0]) {
            console.log('Artist Keys:', JSON.stringify(Object.keys(artistRes.data.data.results[0])));
        }

        const albumRes = await axios.get(`${BASE_URL}/search/albums?query=rockstar&limit=1`);
        if (albumRes.data.data.results[0]) {
            console.log('Album Keys:', JSON.stringify(Object.keys(albumRes.data.data.results[0])));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testApi();
