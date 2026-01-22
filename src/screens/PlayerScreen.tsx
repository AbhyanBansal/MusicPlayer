import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, MoreHorizontal, SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, Timer, Cast, ListMusic, MessageSquare } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../store/usePlayerStore';
import { ImageQuality } from '../types/music';

const { width, height } = Dimensions.get('window');

// Helper to get image URL
const getImageUrl = (images?: ImageQuality[]) => {
    if (!images || images.length === 0) return 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg';
    return images[2]?.url || images[1]?.url || images[0]?.url || 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg';
};

const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

export const PlayerScreen = ({ navigation }: any) => {
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const position = usePlayerStore(state => state.position);
    const duration = usePlayerStore(state => state.duration);
    const togglePlay = usePlayerStore(state => state.togglePlay);
    const playNext = usePlayerStore(state => state.playNext);
    const playPrevious = usePlayerStore(state => state.playPrevious);
    const seekTo = usePlayerStore(state => state.seekTo);

    const [isSeeking, setIsSeeking] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);

    useEffect(() => {
        if (!isSeeking) {
            setSliderValue(position);
        }
    }, [position, isSeeking]);

    if (!currentTrack) {
        return (
            <View style={styles.container}>
                <Text>No Track Playing</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Background Gradient (simulated based on extracting colors, static for now) */}
            <LinearGradient
                colors={['#fff', '#f0f9ff']} // Can be dynamic later
                style={styles.background}
            />

            <SafeAreaView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronDown size={28} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}></Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <MoreHorizontal size={24} color="#0f172a" />
                    </TouchableOpacity>
                </View>

                {/* Album Art */}
                <View style={styles.artworkContainer}>
                    <Image
                        source={{ uri: getImageUrl(currentTrack.image) }}
                        style={styles.artwork}
                    />
                </View>

                {/* Track Info */}
                <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.name}</Text>
                    <Text style={styles.artistName} numberOfLines={1}>{currentTrack.primaryArtists}</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0}
                        maximumValue={duration > 0 ? duration : 1}
                        value={sliderValue}
                        onSlidingStart={() => setIsSeeking(true)}
                        onSlidingComplete={(val) => {
                            seekTo(val);
                            setIsSeeking(false);
                        }}
                        minimumTrackTintColor="#f97316"
                        maximumTrackTintColor="#e2e8f0"
                        thumbTintColor="#f97316"
                    />
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(sliderValue)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    <TouchableOpacity>
                        <Shuffle size={24} color="#94a3b8" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playPrevious}>
                        <SkipBack size={32} color="#0f172a" fill="#0f172a" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
                        {isPlaying ?
                            <Pause size={32} color="white" fill="white" /> :
                            <Play size={32} color="white" fill="white" />
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playNext}>
                        <SkipForward size={32} color="#0f172a" fill="#0f172a" />
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Repeat size={24} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Bottom Action Bar */}
                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.bottomIcon}>
                        <Timer size={22} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomIcon}>
                        <Cast size={22} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomIcon}>
                        <ListMusic size={22} color="#0f172a" />
                    </TouchableOpacity>
                </View>

                {/* Lyrics Pull-up Hint */}
                <View style={styles.lyricsHint}>
                    <ChevronDown size={20} color="#94a3b8" style={{ transform: [{ rotate: '180deg' }] }} />
                    <Text style={styles.lyricsText}>Lyrics</Text>
                </View>

            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    iconButton: {
        padding: 8,
    },
    artworkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        marginVertical: 20,
    },
    artwork: {
        width: width - 48,
        height: width - 48,
        borderRadius: 24,
    },
    trackInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    trackTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 8,
        textAlign: 'center',
    },
    artistName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748b',
        textAlign: 'center',
    },
    progressContainer: {
        marginBottom: 20,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16, // Match slider padding visual
        marginTop: -5,
    },
    timeText: {
        fontSize: 12,
        color: '#64748b',
        fontVariant: ['tabular-nums'],
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    playButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    },
    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginBottom: 20,
    },
    bottomIcon: {
        padding: 10,
    },
    lyricsHint: {
        alignItems: 'center',
        paddingBottom: 10,
    },
    lyricsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0f172a',
        marginTop: 4,
    },
});
