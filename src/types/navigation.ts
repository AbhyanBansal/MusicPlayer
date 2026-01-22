import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Home: { tab?: 'Home' | 'Queue' | 'Downloads' | 'Settings' } | undefined;
    Settings: undefined;
    Player: undefined;
    Queue: undefined;
    ArtistDetails: { id: string; name: string; image: string };
    AlbumDetails: { id: string; name: string; image: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type PlayerScreenProps = NativeStackScreenProps<RootStackParamList, 'Player'>;
export type QueueScreenProps = NativeStackScreenProps<RootStackParamList, 'Queue'>;
export type ArtistDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'ArtistDetails'>;
export type AlbumDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'AlbumDetails'>;
