import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Settings, ListMusic, Download } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';

interface BottomNavProps {
    activeTab?: 'Home' | 'Queue' | 'Downloads' | 'Settings';
    onTabPress?: (tab: 'Home' | 'Queue' | 'Downloads' | 'Settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = 'Home', onTabPress }) => {
    const { theme } = useThemeStore();

    return (
        <View style={[styles.bottomNav, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
            <TouchableOpacity style={styles.navItem} onPress={() => onTabPress && onTabPress('Home')}>
                <Home size={24} color={activeTab === 'Home' ? theme.tabActive : theme.tabInactive} />
                <Text style={[styles.navText, { color: activeTab === 'Home' ? theme.tabActive : theme.tabInactive }]}>Home</Text>
                {activeTab === 'Home' && <View style={[styles.activeNavDot, { backgroundColor: theme.tabActive }]} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => onTabPress && onTabPress('Queue')}>
                <ListMusic size={24} color={activeTab === 'Queue' ? theme.tabActive : theme.tabInactive} />
                <Text style={[styles.navText, { color: activeTab === 'Queue' ? theme.tabActive : theme.tabInactive }]}>Queue</Text>
                {activeTab === 'Queue' && <View style={[styles.activeNavDot, { backgroundColor: theme.tabActive }]} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => onTabPress && onTabPress('Downloads')}>
                <Download size={24} color={activeTab === 'Downloads' ? theme.tabActive : theme.tabInactive} />
                <Text style={[styles.navText, { color: activeTab === 'Downloads' ? theme.tabActive : theme.tabInactive }]}>Downloads</Text>
                {activeTab === 'Downloads' && <View style={[styles.activeNavDot, { backgroundColor: theme.tabActive }]} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => onTabPress && onTabPress('Settings')}>
                <Settings size={24} color={activeTab === 'Settings' ? theme.tabActive : theme.tabInactive} />
                <Text style={[styles.navText, { color: activeTab === 'Settings' ? theme.tabActive : theme.tabInactive }]}>Settings</Text>
                {activeTab === 'Settings' && <View style={[styles.activeNavDot, { backgroundColor: theme.tabActive }]} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 85,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        paddingHorizontal: 10,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
        borderTopWidth: 0, // Removed border for cleaner floating look with shadow
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
