import { ImageQuality } from '../types/music';

/**
 * Robustly extracts the artist name from various possible API data structures.
 * Prioritizes the nested `artists.primary` array which is standard in recent JioSaavn API responses.
 * 
 * @param input Can be the 'artists' object, 'primaryArtists' string/array, or just any raw data.
 * @returns A formatted string of artist names or 'Unknown Artist'
 */
export const getArtistName = (input: any): string => {
    if (!input) return 'Unknown Artist';

    // Case 1: Standard API 'artists' object with 'primary' array
    if (typeof input === 'object' && input.primary && Array.isArray(input.primary)) {
        const names = input.primary.map((a: any) => a.name).filter(Boolean);
        if (names.length > 0) return names.join(', ');

        // Fallback to 'all' if primary is empty?
        // if (input.all && Array.isArray(input.all)) ... usually primary is what we want.
    }

    // Case 2: Simple String or Array of Strings (Legacy or simplified objects)
    // If input is the array itself (e.g. passed song.primaryArtists which turned out to be an array)
    if (Array.isArray(input)) {
        const names = input.map((item: any) => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item !== null && item.name) return item.name;
            return null;
        }).filter(Boolean);

        if (names.length > 0) return names.join(', ');
    }

    // Case 3: Simple String
    if (typeof input === 'string') {
        const trimmed = input.trim();
        if (trimmed.length > 0) return trimmed;
    }

    return 'Unknown Artist';
};

/**
 * gets the best available image URL from the image array/object.
 * Prioritizes 500x500 (index 2), then 150x150 (index 1), then 50x50 (index 0).
 */
export const getImageUrl = (images?: ImageQuality[], fallbackImage?: string): string => {
    const defaultPlaceholder = 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg';

    if (!images || !Array.isArray(images) || images.length === 0) {
        return fallbackImage || defaultPlaceholder;
    }

    // API usually returns [50x50, 150x150, 500x500]
    // We want the highest quality available (usually index 2)
    return images[2]?.url || images[1]?.url || images[0]?.url || fallbackImage || defaultPlaceholder;
};

/**
 * Formats seconds into MM:SS format.
 */
export const formatDuration = (seconds?: string | number): string => {
    if (!seconds) return '0:00';

    const s = Number(seconds);
    if (isNaN(s)) return '0:00';

    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);

    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};
