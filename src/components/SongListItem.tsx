import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { Song, ImageQuality } from '../types/music';
import { usePlayerStore } from '../store/usePlayerStore';

interface SongListItemProps {
    song: Song;
    index?: number;
    showIndex?: boolean; // For Album view
    onPress: () => void;
}

export const SongListItem: React.FC<SongListItemProps> = ({ song, index, showIndex = false, onPress }) => {
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const isActive = currentTrack?.id === song.id;

    const getImageUrl = (images?: ImageQuality[]) => {
        if (!images || images.length === 0) return 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg';
        return images[2]?.url || images[1]?.url || images[0]?.url || 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg';
    };

    const formatDuration = (seconds?: string | number) => {
        if (!seconds) return '';
        const s = Number(seconds);
        const min = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <TouchableOpacity
            style={[styles.container, isActive && styles.activeContainer]}
            onPress={onPress}
        >
            {showIndex && index !== undefined ? (
                <Text style={[styles.indexText, isActive && styles.activeText]}>{index + 1}</Text>
            ) : (
                <Image source={{ uri: getImageUrl(song.image) }} style={styles.image} />
            )}

            <View style={styles.infoContainer}>
                <Text style={[styles.title, isActive && styles.activeText]} numberOfLines={1}>
                    {song.name}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                    {showIndex
                        ? (Array.isArray(song.primaryArtists) ? song.primaryArtists.join(', ') : song.primaryArtists) || 'Unknown Artist'
                        : `${song.album?.name || 'Single'} • ${formatDuration(song.duration)}`
                    }
                </Text>
                {!showIndex && <Text style={styles.artistName} numberOfLines={1}>{song.primaryArtists}</Text>}
            </View>

            <View style={styles.rightContainer}>
                {/* Duration if Index is shown (Album view style usually) or we can always show it */}
                {showIndex && <Text style={styles.durationRight}>{formatDuration(song.duration)}</Text>}

                {/* Play/Pause Button */}
                <TouchableOpacity onPress={onPress} style={styles.playButton}>
                    {isActive && isPlaying ? (
                        <Pause size={20} color="#f97316" fill="#f97316" />
                    ) : (
                        <Play size={20} color={isActive ? "#f97316" : "#94a3b8"} fill={isActive ? "#f97316" : "transparent"} />
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 10,
        borderRadius: 12,
        backgroundColor: 'white', // Changed from transparent
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    activeContainer: {
        backgroundColor: '#fff7ed', // orange-50
        borderColor: '#f97316',
        borderWidth: 1,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    indexText: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '600',
        width: 30, // Fixed width for alignment
        textAlign: 'center',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    activeText: {
        color: '#f97316',
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    artistName: {
        fontSize: 12,
        color: '#94a3b8',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    durationRight: {
        fontSize: 12,
        color: '#94a3b8',
    },
    playButton: {
        padding: 4,
    }
});
