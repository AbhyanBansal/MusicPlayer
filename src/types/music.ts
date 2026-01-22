export interface ImageQuality {
    quality: string;
    url: string; // Changed from link to match API
}

export interface DownloadUrl {
    quality: string;
    url: string;
}

// Separate interface for Album when searching for albums individually
export interface AlbumResult {
    id: string;
    name: string;
    year: string;
    type: string; // "album"
    playCount: string;
    language: string;
    explicitContent: string;
    primaryArtists: string | any[];
    artists?: { id: string, name: string }[];
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
    primaryArtists: string;
    language: string;
    copyright: string;
    image: ImageQuality[];
    downloadUrl: DownloadUrl[];
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
