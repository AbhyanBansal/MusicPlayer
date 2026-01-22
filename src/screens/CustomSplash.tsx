import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated } from 'react-native';
import { Music2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface CustomSplashProps {
    onFinish: () => void;
}

export const CustomSplash: React.FC<CustomSplashProps> = ({ onFinish }) => {
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Hold splash for 2 seconds, then fade out
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => onFinish());
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Split Background */}
            <View style={styles.leftHalf} />
            <View style={styles.rightHalf} />

            {/* Logo Content */}
            <View style={styles.content}>
                {/* Logo Icon Placeholder: Play button with Note */}
                <View style={styles.logoIcon}>
                    {/* 
                        Ideally we use the actual uploaded image here. 
                        Since we can't easily reference the user's uploaded temp path in the app bundle without moving it, 
                        we will simulate the look with an icon or assume the asset is placed.
                        I'll use a styled Lucide icon to mimic it for now.
                     */}
                    <View style={styles.triangle} />
                    <Music2 size={40} color="white" style={styles.note} />
                </View>

                <Text style={styles.appName}>Loktune</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        flexDirection: 'row',
        zIndex: 9999, // Ensure it sits on top
    },
    leftHalf: {
        flex: 1,
        backgroundColor: '#FFD9C0', // Soft Peach
    },
    rightHalf: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        // Creating a rounded triangle shape is hard with just Views, 
        // using a placeholder style that approximates the brand color
        backgroundColor: '#F97316',
        borderRadius: 25,
        borderBottomLeftRadius: 10,
        marginBottom: 20,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    triangle: {
        // Placeholder for clear shape
    },
    note: {
        // Icon style
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F97316', // Orange text on split background might need stroke or shadow if crossing, but usually centered
        // Since text is centered, it crosses the boundary. 
        // On the Left (Peach): Orange text is okay. On Right (White): Orange text is okay.
        // Actually, in the reference, the logo is centered.
    },
});
