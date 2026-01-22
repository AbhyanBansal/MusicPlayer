import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react-native';
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

    if (!currentTrack) return null;

    return (
        <TouchableOpacity
            activeOpacity={1.0}
            onPress={onPress}
            style={styles.container}
        >
            <BlurView intensity={80} style={styles.blurContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <Image
                        source={{ uri: getImageUrl(currentTrack.image) }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>
                            {currentTrack.name}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }} numberOfLines={1}>
                            {currentTrack.primaryArtists}
                        </Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); playPrevious(); }}>
                        <SkipBack size={20} color="#0f172a" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); togglePlay(); }}
                        style={styles.playButton}
                    >
                        {isPlaying ?
                            <Pause size={16} color="white" fill="white" /> :
                            <Play size={16} color="white" fill="white" />
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); playNext(); }}>
                        <SkipForward size={20} color="#0f172a" />
                    </TouchableOpacity>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 82,
        left: 20,
        right: 20
    },
    blurContainer: {
        height: 70,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        overflow: 'hidden',
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    }
});
