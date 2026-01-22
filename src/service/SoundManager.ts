import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Song } from '../types/music';

class SoundManager {
    public sound: Audio.Sound | null = null;
    private onAuthStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

    constructor() {
        this.setupAudio();
    }

    private async setupAudio() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                playThroughEarpieceAndroid: false,
            });
        } catch (e) {
            console.error('Error setting up audio mode', e);
        }
    }

    public setStatusUpdateCallback(callback: (status: AVPlaybackStatus) => void) {
        this.onAuthStatusUpdate = callback;
    }

    public async loadAndPlay(uri: string) {
        try {
            // Unload existing sound if any
            if (this.sound) {
                await this.sound.unloadAsync();
                this.sound = null;
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true },
                this.onAuthStatusUpdate || undefined
            );

            this.sound = sound;
            return true;
        } catch (error) {
            console.error('Error loading sound', error);
            return false;
        }
    }

    public async play() {
        if (this.sound) {
            await this.sound.playAsync();
        }
    }

    public async pause() {
        if (this.sound) {
            await this.sound.pauseAsync();
        }
    }

    public async resume() {
        if (this.sound) {
            await this.sound.playAsync();
        }
    }

    public async stop() {
        if (this.sound) {
            await this.sound.stopAsync();
        }
    }

    public async seek(positionMillis: number) {
        if (this.sound) {
            await this.sound.setPositionAsync(positionMillis);
        }
    }
}

export const soundManager = new SoundManager();
