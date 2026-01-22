const axios = require('axios');

const BASE_URL = 'https://saavn.sumit.co/api';

async function testApi() {
    try {
        console.log('--- Testing Song Images ---');
        const songRes = await axios.get(`${BASE_URL}/search/songs?query=believer&limit=1`);
        if (songRes.data.data.results[0]) {
            console.log('Song Image:', JSON.stringify(songRes.data.data.results[0].image, null, 2));
        }

        console.log('--- Testing Album Images ---');
        const albumRes = await axios.get(`${BASE_URL}/search/albums?query=rockstar&limit=1`);
        if (albumRes.data.data.results[0]) {
            console.log('Album Image:', JSON.stringify(albumRes.data.data.results[0].image, null, 2));
        }

        console.log('--- Testing Artist Images ---');
        const artistRes = await axios.get(`${BASE_URL}/search/artists?query=arijit&limit=1`);
        if (artistRes.data.data.results[0]) {
            console.log('Artist Image:', JSON.stringify(artistRes.data.data.results[0].image, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testApi();
