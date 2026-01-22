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

const { width } = Dimensions.get('window');

export const AlbumScreen: React.FC<AlbumDetailsScreenProps> = ({ route, navigation }) => {
    const { id, name, image } = route.params;
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState<Song[]>([]);
    const [isShuffleOn, setIsShuffleOn] = useState(false);

    // Store
    const playTrack = usePlayerStore(state => state.playTrack);
    const setQueue = usePlayerStore(state => state.setQueue);
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const togglePlay = usePlayerStore(state => state.togglePlay);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const data = await getAlbumDetails(id);
            if (data && data.songs) {
                setSongs(data.songs);
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

    // ...

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

    const getImageUrl = (images?: ImageQuality[]) => {
        if (!images || images.length === 0) return image || 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg';
        return images[2]?.url || images[1]?.url || images[0]?.url || image;
    };

    const formatDuration = (seconds?: string | number) => {
        if (!seconds) return '';
        const s = Number(seconds);
        const min = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Image Background */}
            <View style={styles.headerImageContainer}>
                <Image source={{ uri: image }} style={styles.headerImage} blurRadius={30} />
                <LinearGradient
                    colors={['transparent', '#eef2f6']}
                    style={styles.gradient}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                {/* Navigation Header */}
                <View style={styles.navHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <MoreVertical size={24} color="#0f172a" />
                    </TouchableOpacity>
                </View>

                {/* Album Info */}
                <View style={styles.albumInfoContainer}>
                    <View style={styles.albumImageWrapper}>
                        <Image source={{ uri: image }} style={styles.albumCoverImage} />
                    </View>
                    <Text style={styles.albumName} numberOfLines={2}>{name}</Text>
                    <Text style={styles.statsText}>{loading ? 'Loading...' : `${songs.length} Songs`}</Text>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.shuffleButton, isShuffleOn && styles.shuffleButtonActive]}
                            onPress={toggleShuffle}
                        >
                            <Shuffle size={20} color={isShuffleOn ? "white" : "#0f172a"} />
                            <Text style={[styles.shuffleButtonText, isShuffleOn && { color: 'white' }]}>Shuffle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.playButton} onPress={handlePlayAll}>
                            <Play size={20} color="white" fill="white" />
                            <Text style={styles.playButtonText}>Play</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Songs List */}
                <View style={styles.songsContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
                    ) : (
                        <FlatList
                            data={songs}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 160 }}
                            renderItem={({ item, index }) => (
                                <SongListItem
                                    song={item}
                                    index={index}
                                    showIndex={true}
                                    onPress={() => handlePlaySong(item, index)}
                                />
                            )}
                        />
                    )}
                </View>
            </SafeAreaView>

            {/* Mini Player */}
            <MiniPlayer onPress={() => navigation.navigate('Player')} />

            {/* Bottom Navigation */}
            <BottomNav
                activeTab="Home"
                onTabPress={(tab) => {
                    if (tab === 'Home') navigation.navigate('Home');
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef2f6',
    },
    headerImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
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
        marginTop: 10,
        paddingHorizontal: 20,
    },
    albumImageWrapper: {
        width: 160,
        height: 160,
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        marginBottom: 16,
    },
    albumCoverImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    albumName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 4,
        textAlign: 'center',
    },
    statsText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    shuffleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        gap: 8,
        elevation: 2,
    },
    shuffleButtonActive: {
        backgroundColor: '#0f172a', // Dark when active
    },
    shuffleButtonText: {
        color: '#0f172a',
        fontWeight: '700',
        fontSize: 16,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f97316',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 8,
        elevation: 4,
    },
    playButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    songsContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 24,
        paddingHorizontal: 20,
    },

});
