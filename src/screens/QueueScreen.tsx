import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QueueScreenProps } from '../types/navigation';

export const QueueScreen: React.FC<QueueScreenProps> = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Queue Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
    },
});
