import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Download } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useDownloadStore } from '../store/useDownloadStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { SongListItem } from '../components/SongListItem';
import { BottomNav } from '../components/BottomNav';
import { MiniPlayer } from '../components/MiniPlayer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

export const DownloadsScreen = ({ onBack }: { onBack?: () => void }) => {
    const { theme, isDarkMode } = useThemeStore();
    const downloads = useDownloadStore(state => state.downloads);
    const playTrack = usePlayerStore(state => state.playTrack);
    const setQueue = usePlayerStore(state => state.setQueue);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handlePlay = (track: any) => { // Using explicit type if possible, but for now any or Song
        setQueue(downloads); // Context is downloads list
        playTrack(track);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <LinearGradient
                colors={theme.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => onBack ? onBack() : navigation.navigate('Home', { tab: 'Home' })}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color={isDarkMode ? theme.background : 'white'} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.headerTitle, { color: isDarkMode ? theme.background : 'white' }]}>Downloads</Text>
                        <Text style={[styles.headerSubtitle, { color: isDarkMode ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.9)' }]}>{downloads.length} Songs</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.listContainer}>
                <FlatList
                    data={downloads}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <SongListItem
                            song={item}
                            index={index}
                            showIndex={false}
                            onPress={() => handlePlay(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                <Download size={48} color={theme.textSecondary} />
                            </View>
                            <Text style={[styles.emptyText, { color: theme.text }]}>No downloads yet</Text>
                            <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>Songs you download will appear here.</Text>
                        </View>
                    }
                />
            </View>

            {/* Mini Player */}
            <MiniPlayer onPress={() => navigation.navigate('Player')} />

            {/* Bottom Navigation */}
            <BottomNav
                activeTab="Downloads"
                onTabPress={(tab) => {
                    if (tab === 'Home') navigation.navigate('Home', { tab: 'Home' });
                    if (tab === 'Queue') navigation.navigate('Queue');
                    if (tab === 'Downloads') { /* Already on Downloads */ }
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
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
        marginTop: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 180,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
