import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlayerStore } from '../store/usePlayerStore';
import { useThemeStore } from '../store/useThemeStore';
import { SongListItem } from '../components/SongListItem';
import { QueueScreenProps, RootStackParamList } from '../types/navigation';
import { BottomNav } from '../components/BottomNav';
import { MiniPlayer } from '../components/MiniPlayer';

export const QueueScreen = ({ onBack }: { onBack?: () => void }) => {
    const queue = usePlayerStore(state => state.queue);
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const playTrack = usePlayerStore(state => state.playTrack);
    const clearQueue = usePlayerStore(state => state.clearQueue);
    const removeFromQueue = usePlayerStore(state => state.removeFromQueue);
    const reorderQueue = usePlayerStore(state => state.reorderQueue);
    const { theme, isDarkMode } = useThemeStore();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={theme.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={24} color={isDarkMode ? theme.background : 'white'} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.headerTitle, { color: isDarkMode ? theme.background : 'white' }]}>Queue</Text>
                        <Text style={[styles.headerSubtitle, { color: isDarkMode ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.9)' }]}>{queue.length} Songs</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    {queue.length > 0 && (
                        <TouchableOpacity onPress={clearQueue} style={styles.clearButton}>
                            <Trash2 size={24} color={isDarkMode ? theme.background : 'white'} />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <View style={styles.listContainer}>
                <FlatList
                    data={queue}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <View style={styles.queueItemContainer}>
                            <View style={styles.reorderControls}>
                                <TouchableOpacity
                                    onPress={() => reorderQueue(index, index - 1)}
                                    disabled={index === 0}
                                    style={[styles.reorderButton, index === 0 && styles.disabledButton]}
                                >
                                    <ChevronUp size={20} color={index === 0 ? theme.border : theme.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => reorderQueue(index, index + 1)}
                                    disabled={index === queue.length - 1}
                                    style={[styles.reorderButton, index === queue.length - 1 && styles.disabledButton]}
                                >
                                    <ChevronDown size={20} color={index === queue.length - 1 ? theme.border : theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flex: 1 }}>
                                <SongListItem
                                    song={item}
                                    onPress={() => playTrack(item)}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={() => removeFromQueue(item.id)}
                                style={styles.removeButton}
                            >
                                <X size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Your queue is empty.</Text>
                            <Text style={styles.emptySubText}>Play some music to add to your queue!</Text>
                        </View>
                    }
                />
            </View>

            {/* Mini Player */}
            <MiniPlayer onPress={() => navigation.navigate('Player')} />

            {/* Bottom Navigation */}
            <BottomNav
                activeTab="Queue"
                onTabPress={(tab) => {
                    if (tab === 'Home') navigation.navigate('Home', { tab: 'Home' });
                    if (tab === 'Queue') { /* Already on Queue */ }
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
        backgroundColor: '#eef2f6',
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
    clearButton: {
        padding: 8,
    },
    listContainer: {
        flex: 1,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 180, // Space for mini player and bottom nav
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    emptySubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#94a3b8',
    },
    queueItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingRight: 8,
    },
    reorderControls: {
        marginRight: 8,
        alignItems: 'center',
        gap: 4,
    },
    reorderButton: {
        padding: 4,
    },
    disabledButton: {
        opacity: 0.3,
    },
    removeButton: {
        padding: 8,
        marginLeft: 4,
    },
});
