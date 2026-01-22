import axios from 'axios';
import { SearchResponse, Song, ArtistResult, AlbumResult } from '../types/music';

const BASE_URL = 'https://saavn.sumit.co/api';

// Generic search function helper
const searchResource = async <T>(endpoint: string, query: string): Promise<T[]> => {
    try {
        const response = await axios.get<SearchResponse<T>>(`${BASE_URL}/search/${endpoint}`, {
            params: {
                query: query,
                page: 1,
                limit: 20
            }
        });

        if ((response.data.success === true || response.data.status === 'SUCCESS') && response.data.data) {
            return response.data.data.results;
        } else {
            console.warn(`API ${endpoint} returned non-success status:`, response.data);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
};

export const searchSongs = (query: string) => searchResource<Song>('songs', query);
export const searchArtists = (query: string) => searchResource<ArtistResult>('artists', query);
export const searchAlbums = (query: string) => searchResource<AlbumResult>('albums', query);

export const getArtistDetails = async (id: string): Promise<{ artist: ArtistResult, topSongs: Song[] } | null> => {
    try {
        // Note: Using 'artists' endpoint with id. Assuming structure based on common API patterns.
        // We might need to adjust 'n' or 'page' params to get 50 songs.
        const response = await axios.get(`${BASE_URL}/artists`, {
            params: {
                id: id,
                n: 50, // Request 50 songs
                page: 1
            }
        });

        if ((response.data.success === true || response.data.status === 'SUCCESS') && response.data.data) {
            // The API structure for artist details usually returns { ...artistData, topSongs: [...] }
            // or sometimes { ...artistData, songs: [...] }
            const data = response.data.data;
            return {
                artist: data,
                topSongs: data.topSongs || data.songs || [] // Fallback to empty array
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching artist details:', error);
        return null;
    }
};

export const getAlbumDetails = async (id: string): Promise<{ album: AlbumResult, songs: Song[] } | null> => {
    try {
        const response = await axios.get(`${BASE_URL}/albums`, {
            params: {
                id: id
            }
        });

        if ((response.data.success === true || response.data.status === 'SUCCESS') && response.data.data) {
            const data = response.data.data;
            return {
                album: data,
                songs: data.songs || []
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching album details:', error);
        return null;
    }
};
