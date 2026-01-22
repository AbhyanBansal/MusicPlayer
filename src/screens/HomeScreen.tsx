import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, StatusBar, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { LucideIcon, Home, Heart, Library, Settings, Search, Music2, Signal, Battery, Wifi, Play, Moon, Sun } from 'lucide-react-native';
import { HomeScreenProps } from '../types/navigation';
import { searchSongs, searchArtists, searchAlbums } from '../api/jiosaavn';
import { Song, ArtistResult, AlbumResult, ImageQuality } from '../types/music';

const { width } = Dimensions.get('window');

// --- Types ---
type Tab = 'Suggested' | 'Songs' | 'Artists' | 'Albums';

// --- Components ---

const TabButton = ({ title, active, onPress, activeColor, inactiveColor }: { title: string, active: boolean, onPress: () => void, activeColor: string, inactiveColor: string }) => (
    <TouchableOpacity onPress={onPress} style={styles.tabButton}>
        <Text style={[styles.tabText, { color: active ? activeColor : inactiveColor }]}>{title}</Text>
        {active && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
    </TouchableOpacity>
);

const SectionHeader = ({ title, titleColor, viewAllColor }: { title: string, titleColor: string, viewAllColor: string }) => (
    <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: titleColor }]}>{title}</Text>
        <TouchableOpacity><Text style={[styles.viewAllText, { color: viewAllColor }]}>View All</Text></TouchableOpacity>
    </View>
);

const SongCard = ({ title, subtitle, imageUri, titleColor, subtitleColor }: { title: string, subtitle: string, imageUri: string, titleColor: string, subtitleColor: string }) => (
    <View style={styles.cardContainer}>
        <View style={styles.cardImageContainer}>
            <Image source={{ uri: imageUri }} style={styles.cardImage} />
            <View style={styles.playOverlay}>
                <Play size={20} color="white" fill="white" />
            </View>
        </View>
        <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: subtitleColor }]} numberOfLines={1}>{subtitle}</Text>
    </View>
);

const ArtistCircle = ({ name, imageUri, onPress, textColor }: { name: string, imageUri: string, onPress?: () => void, textColor: string }) => (
    <TouchableOpacity onPress={onPress} style={styles.artistContainer}>
        <View style={styles.artistImageContainer}>
            <Image source={{ uri: imageUri }} style={styles.artistImage} />
        </View>
        <Text style={[styles.artistName, { color: textColor }]} numberOfLines={1}>{name}</Text>
    </TouchableOpacity>
);


// --- Main Screen ---

// ... imports
import { usePlayerStore } from '../store/usePlayerStore';
import { useThemeStore } from '../store/useThemeStore';
import { MiniPlayer } from '../components/MiniPlayer';
import { BottomNav } from '../components/BottomNav';
import { SongListItem } from '../components/SongListItem';
import { getArtistName, getImageUrl } from '../utils/musicUtils';

// ... imports
import { QueueScreen } from './QueueScreen';
import { DownloadsScreen } from './DownloadsScreen';
import { SettingsScreen } from './SettingsScreen';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
    const [activeTab, setActiveTab] = useState<'Home' | 'Queue' | 'Downloads' | 'Settings'>('Home');

    // Handle incoming tab requests
    React.useEffect(() => {
        if (route.params?.tab) {
            setActiveTab(route.params.tab);
            // Optional: clear params or just let it be. 
            // Better to let it be as it reflects current state.
        }
    }, [route.params?.tab]);


    // Handle Hardware Back Button
    React.useEffect(() => {
        const backAction = () => {
            if (activeTab !== 'Home') {
                setActiveTab('Home');
                return true; // Stop default behavior
            }
            return false; // Let default behavior happen (exit app)
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [activeTab]);

    const [homeTab, setHomeTab] = useState<Tab>('Suggested'); // Renamed from activeTab to avoid conflict
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

    // Theme
    const { theme, isDarkMode, toggleTheme } = useThemeStore();

    // Fetch initial data
    React.useEffect(() => {
        // ... (existing fetch logic)
        console.log('HomeScreen Mounted');
        const fetchSuggested = async () => {
            // ... (keep existing fetch logic)
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
        setQuery(text);
        if (text.length > 2) {
            setLoading(true);
            try {
                if (homeTab === 'Artists') {
                    const res = await searchArtists(text);
                    setArtistResults(res);
                } else if (homeTab === 'Albums') {
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

    const playImmediate = usePlayerStore(state => state.playImmediate);

    const handlePlaySong = (song: Song) => {
        if (currentTrack?.id === song.id) {
            togglePlay();
            return;
        }
        playImmediate(song);
    };

    const handleHomeTabPress = (tab: Tab) => {
        setHomeTab(tab);
    };

    // Add useEffect to re-search when tab changes
    React.useEffect(() => {
        if (query.length > 2) {
            handleSearch(query);
        }
    }, [homeTab]);


    const renderHomeContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />;
        }

        // --- Search Mode ---
        if (query.length > 0 && homeTab !== 'Suggested') {
            // ... existing search render logic using homeTab instead of activeTab
            if (homeTab === 'Artists') {
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
                                <Text style={{ marginLeft: 15, fontSize: 16, fontWeight: '600', color: theme.text }}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                );
            }
            if (homeTab === 'Albums') {
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
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }} numberOfLines={1}>{item.name}</Text>
                                    <Text style={{ fontSize: 14, color: theme.textSecondary }} numberOfLines={1}>
                                        {item.year} • {getArtistName(item.artists || item.primaryArtists)}
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
                {/* Recently Played */}
                {history.length > 0 && (
                    <>
                        <SectionHeader title="Recently Played" titleColor={theme.text} viewAllColor={theme.primary} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 28, paddingRight: 20 }}>
                            {history.map((item) => (
                                <TouchableOpacity key={item.id} onPress={() => handlePlaySong(item)}>
                                    <SongCard
                                        title={item.name}
                                        subtitle={getArtistName(item.artists || item.primaryArtists)}
                                        imageUri={getImageUrl(item.image)}
                                        titleColor={theme.text}
                                        subtitleColor={theme.textSecondary}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}

                {/* Trending Artists */}
                <SectionHeader title="Trending Artists" titleColor={theme.text} viewAllColor={theme.primary} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 28, paddingRight: 20, gap: 20 }}>
                    {trendingArtistsList.map((item) => (
                        <ArtistCircle
                            key={item.id}
                            name={item.name}
                            imageUri={getImageUrl(item.image)}
                            onPress={() => navigation.navigate('ArtistDetails', { id: item.id, name: item.name, image: getImageUrl(item.image) })}
                            textColor={theme.text}
                        />
                    ))}
                </ScrollView>

                {/* Trending Songs */}
                <SectionHeader title="Top Trending" titleColor={theme.text} viewAllColor={theme.primary} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 28, paddingRight: 20 }}>
                    {trendingSongs.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => handlePlaySong(item)}>
                            <SongCard
                                title={item.name}
                                subtitle={getArtistName(item.artists || item.primaryArtists)}
                                imageUri={getImageUrl(item.image)}
                                titleColor={theme.text}
                                subtitleColor={theme.textSecondary}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Your Mixes */}
                <SectionHeader title="Your Mixes" titleColor={theme.text} viewAllColor={theme.primary} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 28, paddingRight: 20, gap: 20 }}>
                    <LinearGradient colors={['#8b5cf6', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mixCard}>
                        <View>
                            <Text style={styles.mixLabel}>CHILL VIBES</Text>
                            <Text style={styles.mixTitle}>Daily Mix{'\n'}Vol. 1</Text>
                        </View>
                        <View style={styles.mixPlayButton}><Play size={16} color="white" fill="white" /></View>
                    </LinearGradient>
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

    const renderMainContent = () => {
        switch (activeTab) {
            case 'Queue':
                return <QueueScreen onBack={() => setActiveTab('Home')} />;
            case 'Downloads':
                return <DownloadsScreen onBack={() => setActiveTab('Home')} />;
            case 'Settings':
                return <SettingsScreen onBack={() => setActiveTab('Home')} />;
            case 'Home':
            default:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <LinearGradient colors={theme.gradientPrimary} style={styles.logoContainer}>
                                    <Music2 size={24} color={isDarkMode ? theme.background : 'white'} />
                                </LinearGradient>
                                <View>
                                    <Text style={[styles.appName, { color: theme.text }]}>Loktune</Text>
                                    <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>DISCOVERY</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.cardBackground }]} onPress={toggleTheme}>
                                {isDarkMode ? <Sun size={22} color={theme.text} /> : <Moon size={22} color={theme.text} />}
                            </TouchableOpacity>
                        </View>

                        {/* Search Input */}
                        <View style={{ paddingHorizontal: 28, marginBottom: 10 }}>
                            <TextInput
                                style={[styles.searchInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                                placeholder="Search..."
                                placeholderTextColor={theme.textSecondary}
                                value={query}
                                onChangeText={handleSearch}
                            />
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabsContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 24, paddingHorizontal: 28 }}>
                                {(['Suggested', 'Songs', 'Artists', 'Albums'] as Tab[]).map((tab) => (
                                    <TabButton
                                        key={tab}
                                        title={tab}
                                        active={homeTab === tab}
                                        onPress={() => handleHomeTabPress(tab)}
                                        activeColor={theme.tabActive}
                                        inactiveColor={theme.tabInactive}
                                    />
                                ))}
                            </ScrollView>
                        </View>

                        {/* Main Content */}
                        <View style={{ flex: 1 }}>
                            {renderHomeContent()}
                        </View>
                    </SafeAreaView>
                );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={[theme.background, theme.background]}
                style={StyleSheet.absoluteFill}
            />
            {/* Background Blobs for specific vibes or just keep them subtle */}
            {activeTab === 'Home' && !isDarkMode && (
                <>
                    <View style={[styles.blobOrange, { backgroundColor: theme.accentBlob1 }]} />
                    <View style={[styles.blobBlue, { backgroundColor: theme.accentBlob2 }]} />
                </>
            )}
            {activeTab === 'Home' && isDarkMode && (
                <>
                    <View style={[styles.blobOrange, { backgroundColor: theme.accentBlob1, opacity: 0.5 }]} />
                    <View style={[styles.blobBlue, { backgroundColor: theme.accentBlob2, opacity: 0.5 }]} />
                </>
            )}

            {renderMainContent()}

            {/* Floating Mini Player */}
            <MiniPlayer onPress={() => navigation.navigate('Player')} />

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabPress={(tab) => {
                if (tab === 'Settings') {
                    // Navigate to settings if it's a separate screen, or handle here
                    // For now, let's keep it as is or handle it
                }
                setActiveTab(tab);
            }} />

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
