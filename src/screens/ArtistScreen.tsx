import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowLeft, Play, Pause, MoreVertical } from 'lucide-react-native';
import { ArtistDetailsScreenProps } from '../types/navigation';
import { getArtistDetails } from '../api/jiosaavn';
import { Song, ImageQuality } from '../types/music';
import { usePlayerStore } from '../store/usePlayerStore';
import { MiniPlayer } from '../components/MiniPlayer';
import { BottomNav } from '../components/BottomNav';
import { SongListItem } from '../components/SongListItem';

const { width } = Dimensions.get('window');

export const ArtistScreen: React.FC<ArtistDetailsScreenProps> = ({ route, navigation }) => {
    const { id, name, image } = route.params;
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState<Song[]>([]);

    // Store
    const playTrack = usePlayerStore(state => state.playTrack);
    const setQueue = usePlayerStore(state => state.setQueue);
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const togglePlay = usePlayerStore(state => state.togglePlay);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const data = await getArtistDetails(id);
            if (data && data.topSongs) {
                setSongs(data.topSongs);
            }
            setLoading(false);
        };
        fetchDetails();
    }, [id]);

    const handlePlaySong = (song: Song, index: number) => {
        if (currentTrack?.id === song.id) {
            togglePlay();
            return;
        }
        setQueue(songs); // Set the entire Top Songs list as queue
        playTrack(song);
    };

    const handleShufflePlay = () => {
        if (songs.length > 0) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            setQueue(songs);
            playTrack(songs[randomIndex]);
        }
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

                {/* Artist Info */}
                <View style={styles.artistInfoContainer}>
                    <View style={styles.artistImageWrapper}>
                        <Image source={{ uri: image }} style={styles.artistProfileImage} />
                    </View>
                    <Text style={styles.artistName}>{name}</Text>
                    <Text style={styles.statsText}>{loading ? 'Loading...' : `${songs.length} Top Songs`}</Text>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.shuffleButton} onPress={handleShufflePlay}>
                            <Play size={20} color="white" fill="white" />
                            <Text style={styles.shuffleButtonText}>Shuffle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.playButton} onPress={handleShufflePlay}>
                            <Play size={20} color="#f97316" fill="#f97316" />
                            <Text style={styles.playButtonText}>Play</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Songs List */}
                <View style={styles.songsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Songs</Text>
                        <TouchableOpacity><Text style={styles.viewAllText}>See All</Text></TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
                    ) : (
                        <FlatList
                            data={songs}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 160 }}
                            renderItem={({ item, index }) => {
                                const isCurrentSong = currentTrack?.id === item.id;
                                return (
                                    <TouchableOpacity
                                        style={[styles.songItem, isCurrentSong && styles.activeSongItem]}
                                        onPress={() => handlePlaySong(item, index)}
                                    >
                                        <Image source={{ uri: getImageUrl(item.image) }} style={styles.songImage} />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={[styles.songTitle, isCurrentSong && styles.activeSongText]} numberOfLines={1}>{item.name}</Text>
                                            <Text style={styles.songSubtitle} numberOfLines={1}>{item.album?.name || 'Single'}</Text>
                                        </View>
                                        <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
                                        {isCurrentSong && isPlaying ? (
                                            <Pause size={20} color="#f97316" fill="#f97316" style={{ marginLeft: 10 }} />
                                        ) : (
                                            <Play size={20} color={isCurrentSong ? "#f97316" : "#94a3b8"} fill={isCurrentSong ? "#f97316" : "transparent"} style={{ marginLeft: 10 }} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
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
    artistInfoContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    artistImageWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        marginBottom: 16,
    },
    artistProfileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    artistName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 4,
    },
    statsText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 30,
    },
    shuffleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f97316',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 8,
        elevation: 4,
    },
    shuffleButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 8,
        elevation: 2,
    },
    playButtonText: {
        color: '#f97316',
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
    },
    viewAllText: {
        fontSize: 14,
        color: '#f97316',
        fontWeight: '600',
    },

});
