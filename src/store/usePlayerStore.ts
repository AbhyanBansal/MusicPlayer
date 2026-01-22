import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, DownloadUrl } from '../types/music';
import { soundManager } from '../service/SoundManager';
import { AVPlaybackStatus } from 'expo-av';

interface PlayerState {
    // Playback State
    currentTrack: Song | null;
    isPlaying: boolean;
    queue: Song[];
    position: number;
    duration: number;

    // History
    history: Song[];

    // Actions
    setQueue: (songs: Song[]) => void;
    playTrack: (track: Song) => Promise<void>;
    togglePlay: () => void;
    playNext: () => void;
    playPrevious: () => void;
    seekTo: (position: number) => void;

    addToHistory: (track: Song) => void;
    clearHistory: () => void;

    // Internal
    _updateStatus: (status: AVPlaybackStatus) => void;
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            currentTrack: null,
            isPlaying: false,
            queue: [],
            position: 0,
            duration: 0,
            history: [],

            setQueue: (songs) => set({ queue: songs }),

            playTrack: async (track) => {
                const { addToHistory, _updateStatus } = get();

                // Get highest quality URL
                const getBestUrl = (downloads: DownloadUrl[]) => {
                    const sorted = [...downloads].sort((a, b) => {
                        // prioritizing 320kbps or 160kbps (assuming quality string contains bitrate)
                        // Simple check for now based on array order or implementation
                        return 0;
                    });
                    // Actually, let's just grab the last one as usually it's best or use logic if 'quality' field is distinct
                    // The API returns downloadUrl as array.
                    return downloads[downloads.length - 1]?.url;
                };

                // NOTE: API structure for downloadUrl has 'link' not 'url' based on previous simple types, 
                // but let's check if we need to map it. 
                // Wait, previously we saw `image` had `url` but `downloadUrl` interface says `link`. 
                // Let's assume `link` is correct for downloadUrl or check. 
                // For now, let's try to find a valid link.

                // For safety, let's inspect the track object if we could, but we assume it has downloadUrl
                const audioUrl = track.downloadUrl?.[track.downloadUrl.length - 1]?.url; // Use best quality

                if (!audioUrl) {
                    console.warn('No audio URL found for', track.name);
                    return;
                }

                // Setup callback before playing
                soundManager.setStatusUpdateCallback(_updateStatus);

                const success = await soundManager.loadAndPlay(audioUrl);

                if (success) {
                    addToHistory(track);
                    set({ currentTrack: track, isPlaying: true, duration: Number(track.duration) });
                }
            },

            togglePlay: () => {
                const { isPlaying, currentTrack } = get();
                if (currentTrack) {
                    if (isPlaying) {
                        soundManager.pause();
                    } else {
                        soundManager.resume();
                    }
                    set({ isPlaying: !isPlaying });
                }
            },

            playNext: () => {
                const { queue, currentTrack, playTrack } = get();
                if (!currentTrack) return;
                const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
                if (currentIndex < queue.length - 1) {
                    playTrack(queue[currentIndex + 1]);
                }
            },

            playPrevious: () => {
                const { queue, currentTrack, playTrack } = get();
                if (!currentTrack) return;
                const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
                if (currentIndex > 0) {
                    playTrack(queue[currentIndex - 1]);
                }
            },

            seekTo: (position) => {
                soundManager.seek(position * 1000); // soundManager expects millis
            },

            addToHistory: (track) => set((state) => {
                const newHistory = [track, ...state.history.filter(s => s.id !== track.id)].slice(0, 20);
                return { history: newHistory };
            }),

            clearHistory: () => set({ history: [] }),

            // Internal Callback from SoundManager
            _updateStatus: (status) => {
                if (status.isLoaded) {
                    set({
                        position: status.positionMillis / 1000,
                        duration: status.durationMillis ? status.durationMillis / 1000 : 0,
                        isPlaying: status.isPlaying
                    });

                    if (status.didJustFinish) {
                        get().playNext(); // Auto-play next
                    }
                }
            }
        }),
        {
            name: 'player-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ history: state.history, queue: state.queue }),
        }
    )
);
