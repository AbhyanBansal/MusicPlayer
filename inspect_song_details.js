const axios = require('axios');

const searchSongs = async (query) => {
    try {
        const res = await axios.get(`https://saavn.sumit.co/api/search/songs?query=${query}`);
        if (res.data.success) {
            const firstSong = res.data.data.results[0];
            console.log('Download URLs:', JSON.stringify(firstSong.downloadUrl, null, 2));
        } else {
            console.log('Search failed:', res.data);
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
};

searchSongs('Beete Lamhein');
