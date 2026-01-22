import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Directory, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system';
import { Song } from '../types/music';

interface DownloadStore {
    downloads: Song[];
    isDownloading: Record<string, boolean>;
    downloadSong: (song: Song, url: string) => Promise<boolean>;
    isDownloaded: (id: string) => boolean;
    deleteAll: () => Promise<void>;
}

const DOWNLOAD_DIR = new Directory(Paths.document, 'music');

const ensureDirExists = () => {
    if (!DOWNLOAD_DIR.exists) {
        DOWNLOAD_DIR.create();
    }
};

export const useDownloadStore = create<DownloadStore>()(
    persist(
        (set, get) => ({
            downloads: [],
            isDownloading: {},

            downloadSong: async (song: Song, url: string) => {
                const { isDownloaded } = get();

                if (isDownloaded(song.id)) return true;

                set(state => ({ isDownloading: { ...state.isDownloading, [song.id]: true } }));

                try {
                    ensureDirExists();

                    // Determine filename
                    // Try to keep original extension if present in url 
                    const extension = url.split('.').pop()?.split('?')[0] || 'm4a';
                    const filename = `song_${song.id}.${extension}`;

                    const destinationFile = new File(DOWNLOAD_DIR, filename);

                    // Download
                    await File.downloadFileAsync(url, destinationFile);

                    if (destinationFile.exists) {
                        const downloadedSong: Song = {
                            ...song,
                            localPath: destinationFile.uri
                        };

                        set(state => ({
                            downloads: [downloadedSong, ...state.downloads],
                            isDownloading: { ...state.isDownloading, [song.id]: false }
                        }));
                        return true;
                    } else {
                        throw new Error('File not found after download');
                    }

                } catch (error) {
                    console.error('Download error:', error);
                    set(state => ({ isDownloading: { ...state.isDownloading, [song.id]: false } }));
                    return false;
                }
            },

            isDownloaded: (id: string) => {
                return get().downloads.some(s => s.id === id);
            },

            deleteAll: async () => {
                const { downloads } = get();
                try {
                    for (const song of downloads) {
                        if (song.localPath) {
                            try {
                                await FileSystem.deleteAsync(song.localPath, { idempotent: true });
                            } catch (e) {
                                console.warn(`Failed to delete file for song ${song.id}`, e);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error deleting downloads:', error);
                }
                set({ downloads: [] });
            }
        }),
        {
            name: 'download-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ downloads: state.downloads }), // Only persist downloads list
        }
    )
);
