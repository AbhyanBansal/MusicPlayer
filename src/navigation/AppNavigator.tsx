import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { QueueScreen } from '../screens/QueueScreen';
import { ArtistScreen } from '../screens/ArtistScreen';
import { AlbumScreen } from '../screens/AlbumScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Music Player' }} />
                <Stack.Screen name="ArtistDetails" component={ArtistScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AlbumDetails" component={AlbumScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Player" component={PlayerScreen} options={{ title: 'Now Playing' }} />
                <Stack.Screen name="Queue" component={QueueScreen} options={{ title: 'Queue' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
