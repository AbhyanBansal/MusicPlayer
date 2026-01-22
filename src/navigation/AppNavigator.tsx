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

import { CustomSplash } from '../screens/CustomSplash';

export const AppNavigator = () => {
    const [isSplashVisible, setSplashVisible] = React.useState(true);

    if (isSplashVisible) {
        return <CustomSplash onFinish={() => setSplashVisible(false)} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ArtistDetails" component={ArtistScreen} />
                <Stack.Screen name="AlbumDetails" component={AlbumScreen} />
                <Stack.Screen name="Player" component={PlayerScreen} />
                <Stack.Screen name="Queue" component={QueueScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
