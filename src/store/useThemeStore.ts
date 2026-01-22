import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

interface ThemeState {
    isDarkMode: boolean;
    toggleTheme: () => void;
    theme: typeof Colors.light;
}

export const useThemeStore = create<ThemeState>((set) => ({
    isDarkMode: false,
    theme: Colors.light,
    toggleTheme: () => set((state) => {
        const newMode = !state.isDarkMode;
        return {
            isDarkMode: newMode,
            theme: newMode ? Colors.dark : Colors.light,
        };
    }),
}));
