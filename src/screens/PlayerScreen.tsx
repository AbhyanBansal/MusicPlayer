import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, MoreHorizontal, SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, ListMusic, Download, Check, Loader } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../store/usePlayerStore';
import { useThemeStore } from '../store/useThemeStore';
import { ImageQuality } from '../types/music';
import { getArtistName, getImageUrl, formatDuration } from '../utils/musicUtils';
import { useToast } from '../components/NotificationToast';
import { useDownloadStore } from '../store/useDownloadStore';

const { width, height } = Dimensions.get('window');

export const PlayerScreen = ({ navigation }: any) => {
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const position = usePlayerStore(state => state.position);
    const duration = usePlayerStore(state => state.duration);
    const togglePlay = usePlayerStore(state => state.togglePlay);
    const playNext = usePlayerStore(state => state.playNext);
    const playPrevious = usePlayerStore(state => state.playPrevious);
    const seekTo = usePlayerStore(state => state.seekTo);
    const addToQueue = usePlayerStore(state => state.addToQueue);

    // Download Store
    const downloadSong = useDownloadStore(state => state.downloadSong);
    const isDownloaded = useDownloadStore(state => state.isDownloaded);
    const isDownloading = useDownloadStore(state => state.isDownloading);

    const [isSeeking, setIsSeeking] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);
    const { theme, isDarkMode } = useThemeStore();
    const { showToast } = useToast();

    const isSongDownloaded = currentTrack ? isDownloaded(currentTrack.id) : false;
    const isSongDownloading = currentTrack ? isDownloading[currentTrack.id] : false;

    const artistName = currentTrack ? getArtistName(currentTrack.artists || currentTrack.primaryArtists) : '';

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
            {/* Background */}
            <LinearGradient
                colors={[theme.background, theme.inputBackground]}
                style={styles.background}
            />

            <SafeAreaView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronDown size={28} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}></Text>
                    <View style={{ width: 44 }} /> {/* Spacer for balance if needed, or just remove if title is empty */}
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
                    <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={1}>{currentTrack.name}</Text>
                    <Text style={[styles.artistName, { color: theme.textSecondary }]} numberOfLines={1}>{artistName}</Text>
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
                        minimumTrackTintColor={theme.primary}
                        maximumTrackTintColor={theme.border}
                        thumbTintColor={theme.primary}
                    />
                    <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: theme.textSecondary }]}>{formatDuration(sliderValue)}</Text>
                        <Text style={[styles.timeText, { color: theme.textSecondary }]}>{formatDuration(duration)}</Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    <TouchableOpacity>
                        <Shuffle size={24} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playPrevious}>
                        <SkipBack size={32} color={theme.text} fill={theme.text} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={togglePlay} style={[styles.playButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                        {isPlaying ?
                            <Pause size={32} color="white" fill="white" /> :
                            <Play size={32} color="white" fill="white" />
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playNext}>
                        <SkipForward size={32} color={theme.text} fill={theme.text} />
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Repeat size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Bottom Action Bar */}
                <View style={[styles.bottomActions, { justifyContent: 'space-around', paddingHorizontal: 50 }]}>
                    <TouchableOpacity style={styles.bottomIcon} onPress={() => {
                        navigation.navigate('Queue');
                    }}>
                        <ListMusic size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.bottomIcon}
                        onPress={async () => {
                            if (!currentTrack || isSongDownloaded || isSongDownloading) return;

                            showToast("Downloading...");
                            // Find URL
                            const lastDownload = currentTrack.downloadUrl?.[currentTrack.downloadUrl.length - 1];
                            const url = lastDownload?.url || lastDownload?.link;

                            if (url) {
                                const success = await downloadSong(currentTrack, url);
                                if (success) {
                                    showToast("Downloaded to library");
                                } else {
                                    showToast("Download failed");
                                }
                            } else {
                                showToast("No download URL found");
                            }
                        }}
                    >
                        {isSongDownloaded ? (
                            <Check size={24} color={theme.primary} />
                        ) : isSongDownloading ? (
                            <Loader size={24} color={theme.textSecondary} />
                        ) : (
                            <Download size={24} color={theme.text} />
                        )}
                    </TouchableOpacity>
                </View>



            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
});
