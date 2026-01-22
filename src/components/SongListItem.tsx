import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Play, Pause, ListPlus } from 'lucide-react-native';
import { Song } from '../types/music';
import { usePlayerStore } from '../store/usePlayerStore';
import { getArtistName, getImageUrl, formatDuration } from '../utils/musicUtils';
import { useThemeStore } from '../store/useThemeStore';
import { Swipeable } from 'react-native-gesture-handler';
import { useToast } from './NotificationToast';

interface SongListItemProps {
    song: Song;
    index?: number;
    showIndex?: boolean; // For Album view
    onPress: () => void;
}

export const SongListItem: React.FC<SongListItemProps> = ({ song, index, showIndex = false, onPress }) => {
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const addToQueue = usePlayerStore(state => state.addToQueue);
    const isActive = currentTrack?.id === song.id;
    const { theme } = useThemeStore();
    const swipeableRef = useRef<Swipeable>(null);
    const { showToast } = useToast();

    // Prioritize 'artists' object, fallback to 'primaryArtists'
    const artistName = getArtistName(song.artists || song.primaryArtists);

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [0, 100],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                style={styles.rightAction}
                onPress={() => {
                    addToQueue(song);
                    swipeableRef.current?.close();
                    showToast("Added to queue");
                }}
            >
                <View style={styles.actionContent}>
                    <ListPlus size={24} color="white" />
                    <Text style={styles.actionText}>Add to Queue</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
        >
            <TouchableOpacity
                style={[
                    styles.container,
                    { backgroundColor: isActive ? (theme.inputBackground) : theme.cardBackground },
                    isActive && { borderColor: theme.primary, borderWidth: 1 }
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {showIndex && index !== undefined ? (
                    <Text style={[styles.indexText, { color: isActive ? theme.primary : theme.textSecondary }]}>{index + 1}</Text>
                ) : (
                    <Image source={{ uri: getImageUrl(song.image) }} style={styles.image} />
                )}

                <View style={styles.infoContainer}>
                    <Text style={[styles.title, { color: isActive ? theme.primary : theme.text }]} numberOfLines={1}>
                        {song.name}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                        {showIndex
                            ? artistName
                            : `${song.album?.name || 'Single'} • ${formatDuration(song.duration)}`
                        }
                    </Text>
                    {!showIndex && <Text style={[styles.artistName, { color: theme.textSecondary }]} numberOfLines={1}>{artistName}</Text>}
                </View>

                <View style={styles.rightContainer}>
                    {/* Duration if Index is shown (Album view style usually) or we can always show it */}
                    {showIndex && <Text style={styles.durationRight}>{formatDuration(song.duration)}</Text>}

                    {/* Play/Pause Button */}
                    <TouchableOpacity onPress={onPress} style={styles.playButton}>
                        {isActive && isPlaying ? (
                            <Pause size={20} color={theme.primary} fill={theme.primary} />
                        ) : (
                            <Play size={20} color={isActive ? theme.primary : theme.tabInactive} fill={isActive ? theme.primary : "transparent"} />
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 10,
        borderRadius: 12,
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
    },
    rightAction: {
        backgroundColor: '#22c55e', // Green for Add
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '100%',
        marginBottom: 12, // Match container margin
        borderRadius: 12,
        // Align with the card
    },
    actionContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    }
});
