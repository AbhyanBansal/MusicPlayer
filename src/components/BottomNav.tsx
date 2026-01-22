import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Heart, Library, Settings } from 'lucide-react-native';

interface BottomNavProps {
    activeTab?: 'Home' | 'Likes' | 'Library' | 'Settings';
    onTabPress?: (tab: 'Home' | 'Likes' | 'Library' | 'Settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = 'Home', onTabPress }) => {
    return (
        <BlurView intensity={90} style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => onTabPress && onTabPress('Home')}>
                <Home size={24} color={activeTab === 'Home' ? "#f97316" : "#94a3b8"} />
                <Text style={[styles.navText, activeTab === 'Home' && { color: '#f97316' }]}>Home</Text>
                {activeTab === 'Home' && <View style={styles.activeNavDot} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => onTabPress && onTabPress('Likes')}>
                <Heart size={24} color={activeTab === 'Likes' ? "#f97316" : "#94a3b8"} />
                <Text style={[styles.navText, activeTab === 'Likes' && { color: '#f97316' }]}>Likes</Text>
                {activeTab === 'Likes' && <View style={styles.activeNavDot} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => onTabPress && onTabPress('Library')}>
                <Library size={24} color={activeTab === 'Library' ? "#f97316" : "#94a3b8"} />
                <Text style={[styles.navText, activeTab === 'Library' && { color: '#f97316' }]}>Library</Text>
                {activeTab === 'Library' && <View style={styles.activeNavDot} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => onTabPress && onTabPress('Settings')}>
                <Settings size={24} color={activeTab === 'Settings' ? "#f97316" : "#94a3b8"} />
                <Text style={[styles.navText, activeTab === 'Settings' && { color: '#f97316' }]}>Settings</Text>
                {activeTab === 'Settings' && <View style={styles.activeNavDot} />}
            </TouchableOpacity>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.4)',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
        color: '#94a3b8',
    },
    activeNavDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#f97316',
        marginTop: 4,
    },
});
