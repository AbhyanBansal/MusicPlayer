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
import { getArtistName } from '../utils/musicUtils';
import { useThemeStore } from '../store/useThemeStore';

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

    // Theme
    const { theme, isDarkMode } = useThemeStore();

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const data = await getArtistDetails(id);
            if (data && data.topSongs) {
                // Ensure primaryArtists is populated, fallback to Artist Name
                const songsWithArtist = data.topSongs.map(song => ({
                    ...song,
                    primaryArtists: getArtistName(song.artists || song.primaryArtists) === 'Unknown Artist'
                        ? name
                        : getArtistName(song.artists || song.primaryArtists)
                }));
                setSongs(songsWithArtist);
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
                                {/* Artist Info */}
                                <View style={styles.artistInfoContainer}>
                                    <View style={styles.artistImageWrapper}>
                                        <Image source={{ uri: image }} style={styles.artistProfileImage} />
                                    </View>
                                    <Text style={[styles.artistName, { color: theme.text }]}>{name}</Text>
                                    <Text style={[styles.statsText, { color: theme.textSecondary }]}>{`${songs.length} Top Songs`}</Text>

                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity style={styles.shuffleButton} onPress={handleShufflePlay}>
                                            <Play size={22} color="white" fill="white" />
                                            <Text style={styles.shuffleButtonText}>Shuffle</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.playButton} onPress={() => songs.length > 0 && playTrack(songs[0])}>
                                            <Play size={22} color="white" fill="white" />
                                            <Text style={styles.playButtonText}>Play</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Songs Section Header */}
                                <View style={[styles.songsContainer, { backgroundColor: theme.cardBackground, minHeight: undefined }]}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Songs</Text>
                                        <TouchableOpacity><Text style={[styles.viewAllText, { color: theme.primary }]}>See All</Text></TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        }
                        renderItem={({ item, index }) => (
                            <View style={{ backgroundColor: theme.cardBackground, paddingHorizontal: 20 }}>
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
        height: 550, // Increased to cover taller content
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
        width: 160,
        height: 160,
        borderRadius: 80,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        marginBottom: 20,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    artistProfileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 80,
    },
    artistName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 8,
        textAlign: 'center',
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
        marginTop: 0, // Removed gap
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

