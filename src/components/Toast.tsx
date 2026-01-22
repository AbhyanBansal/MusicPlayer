import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface ToastContextProps {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
    const { theme } = useThemeStore();
    const opacity = new Animated.Value(0);

    const showToast = (message: string) => {
        console.log("Showing Toast:", message);
        setToast({ message, visible: true });
        Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setToast(null);
            });
        }, 2000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <View style={styles.container} pointerEvents="box-none">
                    <Animated.View style={[
                        styles.toast,
                        { opacity, backgroundColor: theme.primary || '#f97316' }
                    ]}>
                        <Text style={[styles.message, { color: 'white' }]}>{toast.message}</Text>
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
        ...StyleSheet.absoluteFillObject, // Fill the whole screen
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 120, // adjust position from bottom
        zIndex: 99999, // Super high z-index
        elevation: 1000, // Super high elevation for Android container
    },
    toast: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 1001, // Higher than container
        // Ensure it has a minimum width/height if needed, but text defines it
        minWidth: 150,
        alignItems: 'center',
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
