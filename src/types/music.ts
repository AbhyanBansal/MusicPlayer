export interface ImageQuality {
    quality: string;
    url: string; // Changed from link to match API
}

export interface DownloadUrl {
    quality: string;
    url: string;
    link?: string; // Support both url and link
}

// Separate interface for Album when searching for albums individually
export interface AlbumResult {
    id: string;
    name: string;
    year: string;
    type: string; // "album"
    playCount: string;
    language: string;
    primaryArtists?: string | any[]; // Kept for backward compat if needed
    artists?: {
        primary: ArtistResult[];
        featured?: ArtistResult[];
        all?: ArtistResult[];
    };
    image: ImageQuality[];
    url: string;
}

// Separate interface for Artist when searching for artists
export interface ArtistResult {
    id: string;
    name: string;
    role: string;
    type: string; // "artist"
    image: ImageQuality[];
    url: string;
}

// Album inside a Song
export interface Album {
    id: string;
    name: string;
    url: string;
}

export interface Song {
    id: string;
    name: string;
    type: string;
    album: Album;
    year: string;
    duration: string;
    label: string;
    primaryArtists?: string; // Often empty/undefined in new API responses
    artists?: {
        primary: ArtistResult[];
        featured?: ArtistResult[];
        all?: ArtistResult[];
    };
    language: string;
    copyright: string;
    image: ImageQuality[];
    downloadUrl: DownloadUrl[];
    localPath?: string; // Path to downloaded file
}

export interface SearchResponseData<T> {
    results: T[];
    total: number;
    start: number;
}

export interface SearchResponse<T = Song> {
    status?: string;
    success?: boolean;
    data: SearchResponseData<T>;
}
