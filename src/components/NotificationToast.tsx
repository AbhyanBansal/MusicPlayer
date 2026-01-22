import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';

interface ToastContextProps {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

const TOAST_WIDTH = Math.min(Dimensions.get('window').width - 40, 400);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [message, setMessage] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);
    const { theme, isDarkMode } = useThemeStore();
    const currentTrack = usePlayerStore(state => state.currentTrack);

    // BottomNav: 85, MiniPlayer: Bottom 92 + Height 70 = 162.
    // Dynamic bottom: 175 (if MiniPlayer) else 100.
    const bottomPosition = currentTrack ? 175 : 100;

    // Animation Values
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(100)).current;

    const hideToast = useCallback(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsVisible(false);
        });
    }, [opacity, translateY]);

    const showToast = useCallback((msg: string) => {
        setMessage(msg);
        setIsVisible(true);

        // Reset values
        opacity.setValue(0);
        translateY.setValue(100);

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                friction: 5,
                useNativeDriver: true,
            })
        ]).start();

        // Auto hide
        setTimeout(() => {
            hideToast();
        }, 2500);
    }, [hideToast, opacity, translateY]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {isVisible && (
                <View style={[styles.container, { bottom: bottomPosition }]} pointerEvents="none">
                    <Animated.View style={[
                        styles.toast,
                        {
                            opacity,
                            transform: [{ translateY }],
                            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            borderColor: theme.primary,
                            shadowColor: theme.primary,
                        }
                    ]}>
                        <View style={[styles.indicator, { backgroundColor: theme.primary }]} />
                        <Text style={[styles.message, { color: isDarkMode ? '#f1f5f9' : '#0f172a' }]}>{message}</Text>
                    </Animated.View>
                </View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // bottom set dynamically inline
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        elevation: 99999,
    },
    toast: {
        width: TOAST_WIDTH,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        // Shadows
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    indicator: {
        width: 4,
        height: 20,
        borderRadius: 2,
        marginRight: 12,
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center', // Center text for better balance
    }
});
