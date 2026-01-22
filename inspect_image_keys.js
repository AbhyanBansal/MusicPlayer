const axios = require('axios');

const BASE_URL = 'https://saavn.sumit.co/api';

async function testApi() {
    try {
        const songRes = await axios.get(`${BASE_URL}/search/songs?query=believer&limit=1`);
        if (songRes.data.data.results[0] && songRes.data.data.results[0].image) {
            const imgObj = songRes.data.data.results[0].image[0];
            console.log('Image Object Keys:', Object.keys(imgObj));
            console.log('Sample Image Object:', JSON.stringify(imgObj));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testApi();
