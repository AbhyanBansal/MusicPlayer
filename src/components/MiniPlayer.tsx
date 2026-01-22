import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { ImageQuality } from '../types/music';

// Helper to get image URL
const getImageUrl = (images?: ImageQuality[]) => {
    if (!images || images.length === 0) return 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg';
    return images[2]?.url || images[1]?.url || images[0]?.url || 'https://www.awi.de/o/awitheme/assets/images/placeholder-square.svg';
};

interface MiniPlayerProps {
    onPress: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress }) => {
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const togglePlay = usePlayerStore(state => state.togglePlay);
    const playNext = usePlayerStore(state => state.playNext);
    const playPrevious = usePlayerStore(state => state.playPrevious);
    const { theme } = useThemeStore();

    if (!currentTrack) return null;

    return (
        <TouchableOpacity
            activeOpacity={1.0}
            onPress={onPress}
            style={styles.container}
        >
            <LinearGradient
                colors={theme.miniPlayerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientContainer}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <Image
                        source={{ uri: getImageUrl(currentTrack.image) }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }} numberOfLines={1}>
                            {currentTrack.name}
                        </Text>
                        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }} numberOfLines={1}>
                            {currentTrack.primaryArtists}
                        </Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); playPrevious(); }}>
                        <SkipBack size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); togglePlay(); }}
                        style={styles.playButton}
                    >
                        {isPlaying ?
                            <Pause size={16} color={theme.miniPlayerGradient[1]} fill={theme.miniPlayerGradient[1]} /> :
                            <Play size={16} color={theme.miniPlayerGradient[1]} fill={theme.miniPlayerGradient[1]} />
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); playNext(); }}>
                        <SkipForward size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 92, // 80 (Navbar) + 12 (Spacing)
        left: 12,
        right: 12
    },
    gradientContainer: {
        height: 70,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        // Stronger shadow for floating effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    }
});
