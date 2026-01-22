import axios from 'axios';

const BASE_URL = 'https://saavn.sumit.co/api';

async function testApi() {
    try {
        console.log('--- Testing Artists ---');
        const artistRes = await axios.get(`${BASE_URL}/search/artists?query=arijit&limit=1`);
        console.log(JSON.stringify(artistRes.data, null, 2));

        console.log('--- Testing Albums ---');
        const albumRes = await axios.get(`${BASE_URL}/search/albums?query=rockstar&limit=1`);
        console.log(JSON.stringify(albumRes.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testApi();
