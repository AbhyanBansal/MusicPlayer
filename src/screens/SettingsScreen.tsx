import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/useThemeStore';
import { useDownloadStore } from '../store/useDownloadStore';
import { Trash2, Info, ChevronRight, Download, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

export const SettingsScreen = ({ onBack }: { onBack?: () => void }) => {
    const { theme, isDarkMode } = useThemeStore();
    const deleteAll = useDownloadStore(state => state.deleteAll);
    const downloads = useDownloadStore(state => state.downloads);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleDeleteAll = () => {
        Alert.alert(
            "Delete All Downloads",
            "Are you sure you want to delete all downloaded songs? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteAll();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => onBack ? onBack() : navigation.goBack()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Storage Section */}
                <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Storage</Text>

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' }]}>
                                <Download size={20} color={theme.primary} />
                            </View>
                            <View>
                                <Text style={[styles.rowText, { color: theme.text }]}>Downloads</Text>
                                <Text style={[styles.rowSubText, { color: theme.textSecondary }]}>{downloads.length} songs downloaded</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.separator, { backgroundColor: theme.border }]} />

                    <TouchableOpacity style={styles.row} onPress={handleDeleteAll}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                <Trash2 size={20} color="#ef4444" />
                            </View>
                            <Text style={[styles.rowText, { color: '#ef4444' }]}>Delete All Downloads</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>About</Text>
                    <View style={styles.aboutContainer}>
                        <View style={[styles.logoContainer, { backgroundColor: theme.inputBackground }]}>
                            <Info size={32} color={theme.primary} />
                        </View>
                        <Text style={[styles.appName, { color: theme.text }]}>Loktune</Text>
                        <Text style={[styles.version, { color: theme.textSecondary }]}>Version 1.0.0</Text>
                        <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
                            A modern, ad-free music player built for discovery and seamless playback.
                        </Text>
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>Made with ❤️ using React Native</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 28,
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)', // subtle background
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { fontSize: 32, fontWeight: '800' },
    content: { padding: 20 },
    section: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 16,
        opacity: 0.8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconContainer: {
        width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center'
    },
    rowText: { fontSize: 16, fontWeight: '600' },
    rowSubText: { fontSize: 13, marginTop: 2 },
    separator: {
        height: 1,
        marginVertical: 12,
        marginLeft: 56, // Align with text
    },
    aboutContainer: { alignItems: 'center', paddingVertical: 10 },
    logoContainer: {
        width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    appName: { fontSize: 24, fontWeight: '800', marginBottom: 4, letterSpacing: -0.5 },
    version: { fontSize: 14, marginBottom: 16, opacity: 0.8 },
    aboutText: { textAlign: 'center', lineHeight: 22, fontSize: 15, paddingHorizontal: 10 },
    footerText: { fontSize: 12, marginTop: 24, opacity: 0.6 },
});
