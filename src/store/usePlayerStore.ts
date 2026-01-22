import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, DownloadUrl } from '../types/music';
import { soundManager } from '../service/SoundManager';
import { AVPlaybackStatus } from 'expo-av';
import { useDownloadStore } from './useDownloadStore';

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
    playImmediate: (track: Song) => Promise<void>;
    togglePlay: () => void;
    playNext: () => void;
    playPrevious: () => void;
    seekTo: (position: number) => void;
    addToQueue: (track: Song) => void;
    removeFromQueue: (trackId: string) => void;
    reorderQueue: (fromIndex: number, toIndex: number) => void;
    clearQueue: () => void;

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

                // 1. Check if we have a local download
                const downloadedSong = useDownloadStore.getState().downloads.find(d => d.id === track.id);
                let audioUrl: string | undefined = downloadedSong?.localPath;

                // 2. If not local, find best remote URL
                if (!audioUrl) {
                    const lastDownload = track.downloadUrl?.[track.downloadUrl.length - 1];
                    audioUrl = lastDownload?.url || lastDownload?.link;
                }

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

            playImmediate: async (track) => {
                const { queue, currentTrack, playTrack, setQueue } = get();

                // If queue is empty, just play
                if (queue.length === 0) {
                    set({ queue: [track] });
                    await playTrack(track);
                    return;
                }

                // If playImmediate is called, insert song after current song (or at top)
                const currentIndex = currentTrack
                    ? queue.findIndex(s => s.id === currentTrack.id)
                    : -1;

                let newQueue = [...queue];

                if (currentIndex !== -1) {
                    // Insert after current
                    newQueue.splice(currentIndex + 1, 0, track);
                } else {
                    // Start of queue? Or end?
                    // If no current track but queue exists, play it now.
                    // Let's add to top.
                    newQueue = [track, ...queue];
                }

                set({ queue: newQueue });
                await playTrack(track);
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
                const { queue, currentTrack, playTrack, setQueue } = get();
                if (!currentTrack) return;

                // Find current index
                const currentIndex = queue.findIndex(s => s.id === currentTrack.id);

                // If we have a next song
                if (currentIndex !== -1 && currentIndex < queue.length - 1) {
                    const nextSong = queue[currentIndex + 1];

                    // Remove current song from queue (per requirement)
                    const newQueue = queue.filter(s => s.id !== currentTrack.id);
                    set({ queue: newQueue });

                    playTrack(nextSong);
                } else if (currentIndex === queue.length - 1) {
                    // Last song finished/skipped
                    const newQueue = queue.filter(s => s.id !== currentTrack.id);
                    set({ queue: newQueue, currentTrack: null, isPlaying: false });
                    soundManager.pause(); // Stop playback
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

            addToQueue: (track) => set((state) => {
                return { queue: [...state.queue, track] };
            }),

            removeFromQueue: (trackId) => set((state) => ({
                queue: state.queue.filter(s => s.id !== trackId)
            })),

            reorderQueue: (fromIndex, toIndex) => set((state) => {
                if (toIndex < 0 || toIndex >= state.queue.length) return state;
                const newQueue = [...state.queue];
                const [movedItem] = newQueue.splice(fromIndex, 1);
                newQueue.splice(toIndex, 0, movedItem);
                return { queue: newQueue };
            }),

            clearQueue: () => set({ queue: [] }),

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
                        const { queue, currentTrack, playTrack } = get();

                        // Auto-remove logic:
                        if (currentTrack) {
                            const currentIndex = queue.findIndex(s => s.id === currentTrack.id);

                            let nextSong = null;
                            if (currentIndex !== -1 && currentIndex < queue.length - 1) {
                                nextSong = queue[currentIndex + 1];
                            }

                            const newQueue = queue.filter(s => s.id !== currentTrack.id);
                            set({ queue: newQueue });

                            if (nextSong) {
                                playTrack(nextSong);
                            }
                        }
                    }
                }
            }
        }),
        {
            name: 'player-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ history: state.history }), // Removed queue from persistence
        }
    )
);
