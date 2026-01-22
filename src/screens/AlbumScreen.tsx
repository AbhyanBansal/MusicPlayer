import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Play, Pause, MoreVertical, Shuffle } from 'lucide-react-native';
import { AlbumDetailsScreenProps } from '../types/navigation';
import { getAlbumDetails } from '../api/jiosaavn';
import { Song, ImageQuality } from '../types/music';
import { usePlayerStore } from '../store/usePlayerStore';
import { MiniPlayer } from '../components/MiniPlayer';
import { BottomNav } from '../components/BottomNav';
import { SongListItem } from '../components/SongListItem';
import { getArtistName } from '../utils/musicUtils';
import { useThemeStore } from '../store/useThemeStore';

const { width } = Dimensions.get('window');

export const AlbumScreen: React.FC<AlbumDetailsScreenProps> = ({ route, navigation }) => {
    const { id, name, image } = route.params;
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState<Song[]>([]);
    const [albumArtist, setAlbumArtist] = useState<string>('');
    const [isShuffleOn, setIsShuffleOn] = useState(false);

    // Store
    const playTrack = usePlayerStore(state => state.playTrack);
    const setQueue = usePlayerStore(state => state.setQueue);
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const togglePlay = usePlayerStore(state => state.togglePlay);

    // Theme
    const { theme, isDarkMode } = useThemeStore();

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const data = await getAlbumDetails(id);
            if (data && data.songs) {
                // Ensure primaryArtists is populated, fallback to Album Artist
                const album = data.album;
                const artistName = getArtistName(album.artists || album.primaryArtists);
                setAlbumArtist(artistName);

                const songsWithArtist = data.songs.map(song => ({
                    ...song,
                    primaryArtists: getArtistName(song.artists || song.primaryArtists) !== 'Unknown Artist'
                        ? getArtistName(song.artists || song.primaryArtists)
                        : artistName
                }));
                setSongs(songsWithArtist);
            }
            setLoading(false);
        };
        fetchDetails();
    }, [id]);

    const getShuffledList = (list: Song[], startIndex: number) => {
        if (!isShuffleOn) return list;
        const startSong = list[startIndex];
        const otherSongs = list.filter((_, i) => i !== startIndex);

        // Fisher-Yates shuffle
        for (let i = otherSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
        }
        return [startSong, ...otherSongs];
    };

    const handlePlaySong = (song: Song, index: number) => {
        // If the song is already the current track, just toggle play/pause
        if (currentTrack?.id === song.id) {
            togglePlay();
            return;
        }

        if (isShuffleOn) {
            setQueue(getShuffledList(songs, index));
        } else {
            // For sequential, we want the whole album context.
            setQueue(songs);
        }
        playTrack(song);
    };

    const handlePlayAll = () => {
        if (songs.length > 0) {
            if (isShuffleOn) {
                const randomIndex = Math.floor(Math.random() * songs.length);
                const shuffled = getShuffledList(songs, randomIndex);
                setQueue(shuffled);
                playTrack(shuffled[0]);
            } else {
                setQueue(songs);
                playTrack(songs[0]);
            }
        }
    };

    const toggleShuffle = () => {
        setIsShuffleOn(!isShuffleOn);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />

            {/* Header Image Background */}
            <View style={styles.headerImageContainer}>
                <Image source={{ uri: image }} style={styles.headerImage} blurRadius={30} />
                <LinearGradient
                    colors={['transparent', theme.background]}
                    style={styles.gradient}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                {/* Navigation Header */}
                <View style={styles.navHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }]}>
                        <ArrowLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <MoreVertical size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 100 }} />
                ) : (
                    <FlatList
                        data={songs}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 160 }}
                        ListHeaderComponent={
                            <View>
                                {/* Album Info */}
                                <View style={styles.albumInfoContainer}>
                                    <View style={styles.albumImageWrapper}>
                                        <Image source={{ uri: image }} style={styles.albumCoverImage} />
                                    </View>
                                    <Text style={[styles.albumName, { color: theme.text }]} numberOfLines={2}>{name}</Text>
                                    <Text style={[styles.artistName, { color: theme.textSecondary }]}>{albumArtist}</Text>
                                    <Text style={[styles.statsText, { color: theme.textSecondary }]}>{`${songs.length} Songs`}</Text>

                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity style={styles.shuffleButton} onPress={toggleShuffle}>
                                            <Shuffle size={22} color="white" />
                                            <Text style={styles.shuffleButtonText}>Shuffle</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.playButton} onPress={handlePlayAll}>
                                            <Play size={22} color="white" fill="white" />
                                            <Text style={styles.playButtonText}>Play</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        }
                        renderItem={({ item, index }) => (
                            <View style={{ backgroundColor: theme.cardBackground, paddingHorizontal: 20, paddingTop: index === 0 ? 24 : 0 }}>
                                <SongListItem
                                    song={item}
                                    index={index}
                                    showIndex={true}
                                    onPress={() => handlePlaySong(item, index)}
                                />
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>

            {/* Mini Player */}
            <MiniPlayer onPress={() => navigation.navigate('Player')} />

            {/* Bottom Navigation */}
            <BottomNav
                activeTab="Home"
                onTabPress={(tab) => {
                    if (tab === 'Home') navigation.navigate('Home', { tab: 'Home' });
                    if (tab === 'Queue') navigation.navigate('Queue');
                    if (tab === 'Downloads') navigation.navigate('Home', { tab: 'Downloads' });
                    if (tab === 'Settings') navigation.navigate('Home', { tab: 'Settings' });
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 550,
        opacity: 0.6,
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    navHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    albumInfoContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    albumImageWrapper: {
        width: 160,
        height: 160,
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        marginBottom: 20,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    albumCoverImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    albumName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 8,
        textAlign: 'center',
    },
    artistName: {
        fontSize: 18,
        color: '#64748b',
        marginBottom: 4,
        textAlign: 'center',
        fontWeight: '600',
    },
    statsText: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 32,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 40,
    },
    shuffleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f97316', // Orange
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 10,
        elevation: 6,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    shuffleButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 18,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b', // Dark Slate
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 10,
        elevation: 6,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    playButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 18,
    },
    songsContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
        paddingHorizontal: 20,
        marginTop: 0,
    },

});
