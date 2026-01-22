import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { LucideIcon, Home, Heart, Library, Settings, Search, Music2, Signal, Battery, Wifi, Play } from 'lucide-react-native';
import { HomeScreenProps } from '../types/navigation';
import { searchSongs, searchArtists, searchAlbums } from '../api/jiosaavn';
import { Song, ArtistResult, AlbumResult, ImageQuality } from '../types/music';

const { width } = Dimensions.get('window');

// --- Types ---
type Tab = 'Suggested' | 'Songs' | 'Artists' | 'Albums';

// --- Components ---

const TabButton = ({ title, active, onPress }: { title: string, active: boolean, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.tabButton}>
        <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>{title}</Text>
        {active && <View style={styles.activeDot} />}
    </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
    </View>
);

const SongCard = ({ title, subtitle, imageUri }: { title: string, subtitle: string, imageUri: string }) => (
    <View style={styles.cardContainer}>
        <View style={styles.cardImageContainer}>
            <Image source={{ uri: imageUri }} style={styles.cardImage} />
            <View style={styles.playOverlay}>
                <Play size={20} color="white" fill="white" />
            </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
    </View>
);

const ArtistCircle = ({ name, imageUri, onPress }: { name: string, imageUri: string, onPress?: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.artistContainer}>
        <View style={styles.artistImageContainer}>
            <Image source={{ uri: imageUri }} style={styles.artistImage} />
        </View>
        <Text style={styles.artistName} numberOfLines={1}>{name}</Text>
    </TouchableOpacity>
);


// --- Main Screen ---

// ... imports
import { usePlayerStore } from '../store/usePlayerStore';
import { MiniPlayer } from '../components/MiniPlayer';
import { BottomNav } from '../components/BottomNav';
import { SongListItem } from '../components/SongListItem';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Suggested');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Search Results State
    const [songResults, setSongResults] = useState<Song[]>([]);
    const [artistResults, setArtistResults] = useState<ArtistResult[]>([]);
    const [albumResults, setAlbumResults] = useState<AlbumResult[]>([]);

    // Dynamic Data State
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [trendingArtistsList, setTrendingArtistsList] = useState<ArtistResult[]>([]);

    // Store
    const history = usePlayerStore(state => state.history);
    const playTrack = usePlayerStore(state => state.playTrack);
    const setQueue = usePlayerStore(state => state.setQueue);
    const togglePlay = usePlayerStore(state => state.togglePlay);
    const currentTrack = usePlayerStore(state => state.currentTrack);

    // Fetch initial data
    // Fetch initial data
    React.useEffect(() => {
        console.log('HomeScreen Mounted');
        const fetchSuggested = async () => {
            console.log('Fetching suggested content...');
            try {
                // Determine query based on time of day? For now, fetch generic charts
                const songs = await searchSongs('Top Trending');
                console.log('Fetched Trending Songs:', songs.length);
                setTrendingSongs(songs.slice(0, 5)); // Take top 5

                const artists = await searchArtists('Best Artists');
                console.log('Fetched Trending Artists:', artists.length);
                setTrendingArtistsList(artists.slice(0, 5));
            } catch (e) {
                console.warn('Failed to fetch suggested', e);
            }
        };
        fetchSuggested();
    }, []);

    const handleSearch = async (text: string) => {
        // ... same search implementation ...
        setQuery(text);
        if (text.length > 2) {
            setLoading(true);
            try {
                if (activeTab === 'Artists') {
                    const res = await searchArtists(text);
                    setArtistResults(res);
                } else if (activeTab === 'Albums') {
                    const res = await searchAlbums(text);
                    setAlbumResults(res);
                } else {
                    const res = await searchSongs(text);
                    setSongResults(res);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        } else {
            setSongResults([]);
            setArtistResults([]);
            setAlbumResults([]);
        }
    };



    // ...

    const handlePlaySong = (song: Song) => {
        if (currentTrack?.id === song.id) {
            togglePlay();
            return;
        }
        setQueue([song]);
        playTrack(song);
    };

    const handleTabPress = (tab: Tab) => {
        setActiveTab(tab);
        // Search triggered by useEffect
    };

    // Add useEffect to re-search when tab changes
    React.useEffect(() => {
        if (query.length > 2) {
            handleSearch(query);
        }
    }, [activeTab]);

    const formatDuration = (seconds?: string | number) => {
        if (!seconds) return '';
        const s = Number(seconds);
        const min = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const getImageUrl = (images?: ImageQuality[]) => {
        if (!images || images.length === 0) return 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg'; // Placeholder
        // Try 500x500 (index 2), then 150x150 (index 1), then 50x50 (index 0)
        return images[2]?.url || images[1]?.url || images[0]?.url || 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg';
    };

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 50 }} />;
        }

        // --- Search Mode ---
        if (query.length > 0 && activeTab !== 'Suggested') {
            // ... (keep search list rendering same, but use handlePlaySong) ...
            if (activeTab === 'Artists') {
                return (
                    <FlatList
                        data={artistResults}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
                                onPress={() => navigation.navigate('ArtistDetails', { id: item.id, name: item.name, image: getImageUrl(item.image) })}
                            >
                                <Image source={{ uri: getImageUrl(item.image) }} style={{ width: 60, height: 60, borderRadius: 30 }} />
                                <Text style={{ marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#333' }}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                );
            }
            if (activeTab === 'Albums') {
                return (
                    <FlatList
                        data={albumResults}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
                                onPress={() => navigation.navigate('AlbumDetails', { id: item.id, name: item.name, image: getImageUrl(item.image) })}
                            >
                                <Image source={{ uri: getImageUrl(item.image) }} style={{ width: 60, height: 60, borderRadius: 8 }} />
                                <View style={{ marginLeft: 15, flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }} numberOfLines={1}>{item.name}</Text>
                                    <Text style={{ fontSize: 14, color: '#666' }} numberOfLines={1}>
                                        {item.year} • {(Array.isArray(item.artists) ? item.artists.map(a => a.name).join(', ') : item.primaryArtists) || 'Unknown'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                );
            }
            // Songs (Default)
            return (
                <FlatList
                    data={songResults}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
                    renderItem={({ item }) => (
                        <SongListItem
                            song={item}
                            onPress={() => handlePlaySong(item)}
                        />
                    )}
                />
            );
        }

        // --- Suggested (Discovery) Mode ---
        return (
            <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
                {/* Recently Played (Real History) */}
                {history.length > 0 && (
                    <>
                        <SectionHeader title="Recently Played" />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 28, paddingRight: 20 }}>
                            {history.map((item) => (
                                <TouchableOpacity key={item.id} onPress={() => handlePlaySong(item)}>
                                    <SongCard
                                        title={item.name}
                                        subtitle={item.primaryArtists}
                                        imageUri={getImageUrl(item.image)}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}

                {/* Trending Artists (Real Data) */}
                <SectionHeader title="Trending Artists" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 28, paddingRight: 20, gap: 20 }}>
                    {trendingArtistsList.map((item) => (
                        <ArtistCircle
                            key={item.id}
                            name={item.name}
                            imageUri={getImageUrl(item.image)}
                            onPress={() => navigation.navigate('ArtistDetails', { id: item.id, name: item.name, image: getImageUrl(item.image) })}
                        />
                    ))}
                </ScrollView>

                {/* Trending Songs (Simulated as 'Mixes' for now visually, or just list) */}
                <SectionHeader title="Top Trending" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 28, paddingRight: 20 }}>
                    {trendingSongs.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => handlePlaySong(item)}>
                            <SongCard
                                title={item.name}
                                subtitle={item.primaryArtists}
                                imageUri={getImageUrl(item.image)}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Your Mixes (Static for now as placeholders) */}
                <SectionHeader title="Your Mixes" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 28, paddingRight: 20, gap: 20 }}>
                    {/* Mix Card 1 */}
                    <LinearGradient colors={['#8b5cf6', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mixCard}>
                        <View>
                            <Text style={styles.mixLabel}>CHILL VIBES</Text>
                            <Text style={styles.mixTitle}>Daily Mix{'\n'}Vol. 1</Text>
                        </View>
                        <View style={styles.mixPlayButton}><Play size={16} color="white" fill="white" /></View>
                    </LinearGradient>
                    {/* Mix Card 2 */}
                    <LinearGradient colors={['#3b82f6', '#06b6d4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mixCard}>
                        <View>
                            <Text style={styles.mixLabel}>ENERGY</Text>
                            <Text style={styles.mixTitle}>Workout{'\n'}Radio</Text>
                        </View>
                        <View style={styles.mixPlayButton}><Play size={16} color="white" fill="white" /></View>
                    </LinearGradient>
                </ScrollView>

            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            {/* Background Blobs (Simulated with simple views for performance, normally would use SVG or Image) */}
            <View style={styles.blobOrange} />
            <View style={styles.blobBlue} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <LinearGradient colors={['#f97316', '#ea580c']} style={styles.logoContainer}>
                            <Music2 size={24} color="white" />
                        </LinearGradient>
                        <View>
                            <Text style={styles.appName}>Soundrix</Text>
                            <Text style={styles.appSubtitle}>DISCOVERY</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.searchButton}>
                        <Search size={22} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Search Input (Always visible for now to facilitate searching) */}
                <View style={{ paddingHorizontal: 28, marginBottom: 10 }}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor="#94a3b8"
                        value={query}
                        onChangeText={handleSearch}
                    />
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 24, paddingHorizontal: 28 }}>
                        {(['Suggested', 'Songs', 'Artists', 'Albums'] as Tab[]).map((tab) => (
                            <TabButton key={tab} title={tab} active={activeTab === tab} onPress={() => handleTabPress(tab)} />
                        ))}
                    </ScrollView>
                </View>

                {/* Main Content */}
                <View style={{ flex: 1 }}>
                    {renderContent()}
                </View>

            </SafeAreaView>

            {/* Floating Mini Player */}
            <MiniPlayer onPress={() => navigation.navigate('Player')} />

            {/* Bottom Navigation */}
            <BottomNav activeTab="Home" />

        </View>
    );
};

// --- Styles ---

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef2f6',
    },
    blobOrange: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(253, 186, 116, 0.3)', // orange-300/30
    },
    blobBlue: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(147, 197, 253, 0.3)', // blue-300/30
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingTop: 10,
        paddingBottom: 20,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    appName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
        lineHeight: 20,
    },
    appSubtitle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94a3b8',
        letterSpacing: 1,
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
    },
    tabsContainer: {
        marginBottom: 20,
        height: 40,
    },
    tabButton: {
        alignItems: 'center',
        marginTop: 8,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#0f172a',
    },
    tabTextInactive: {
        color: '#94a3b8',
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#f97316',
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 28,
        marginBottom: 16,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#f97316',
    },
    cardContainer: {
        width: 160,
        marginRight: 20,
    },
    cardImageContainer: {
        width: 160,
        height: 190,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    playOverlay: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
        marginLeft: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        marginLeft: 4,
    },
    artistContainer: {
        alignItems: 'center',
    },
    artistImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'white',
        overflow: 'hidden',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    artistImage: {
        width: '100%',
        height: '100%',
    },
    artistName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0f172a',
    },
    mixCard: {
        width: 240,
        height: 100,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mixLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 2,
        marginBottom: 4,
    },
    mixTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        lineHeight: 22,
    },
    mixPlayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

});
