# Music Player - React Native Intern Assignment

A feature-rich, high-performance music streaming application built with **React Native (Bare Workflow)**, adhering to the requirements of the intern assignment. This project demonstrates advanced capabilities including background playback, queue management, and a polished UI.

## 📱 Features & Requirements Met

### 🚀 Core Functionality
- **Home Screen**: Search for Songs, Artists, and Albums using the JioSaavn API.
- **Player Screen**: Full-screen player with artwork, track details, seeking, and playback controls.
- **Background Playback**: Music continues playing when the app is minimized or the screen is locked, integrated with system notification controls.
- **Mini Player**: Persistent floating player accessible across all screens.

### 🎵 Advanced Queue Management
- **Dynamic Queue**: Add songs to queue via swipe actions or long-press.
- **Auto-Remove**: Songs are automatically removed from the queue after playing (Snapchat-style behavior), ensuring a fresh listening experience.
- **Reorder & Management**: Users can reorder songs and remove items directly from the Queue screen.

### 💾 Offline & Persistence
- **Downloads**: Infrastructure for downloading songs for offline playback.
- **History**: Tracks recently played songs.
- **Theme Persistence**: User preferences for themes are saved locally.

### 🎨 UI/UX Design
- **Polished Aesthetics**: Clean, pastel-themed UI with gradient backgrounds.
- **Smooth Navigation**: Custom stack and bottom tab navigation using React Navigation v7.
- **Custom Splash Screen**: Branded launch experience.

## 🛠️ Tech Stack

- **Framework**: React Native 0.81 (Expo Prebuild / Bare Workflow)
- **Language**: TypeScript
- **State Management**: Zustand (with persistent storage)
- **Navigation**: React Navigation v7
- **Audio Engine**: Expo AV with Background Audio capabilities
- **API**: Axios (JioSaavn Unofficial API)
- **Styling**: StyleSheet with lucide-react-native icons

## 📂 Project Structure

```
src/
├── api/          # API client and service calls
├── components/   # Reusable UI components (MiniPlayer, SongTile, etc.)
├── constants/    # Theme colors and app constants
├── navigation/   # Stack and Tab navigators configuration
├── screens/      # Main application screens (Home, Player, Queue, etc.)
├── service/      # SoundManager for centralized audio logic
├── store/        # Zustand stores (usePlayerStore, useDownloadStore)
├── types/        # TypeScript dictionaries and interfaces
└── utils/        # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js > 18
- JDK 17
- Android Studio / Android SDK

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AbhyanBansal/MusicPlayer.git
   cd MusicPlayer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate Base Android Project (Prebuild):**
   ```bash
   npx expo prebuild --platform android
   ```

4. **Run on Android Emulator/Device:**
   ```bash
   npx expo run:android
   ```
   *Note: This project uses native code and requires a build. It cannot be run in Expo Go.*

## 📦 Building Release APK

To generate a signed release APK:

```bash
cd android
./gradlew assembleRelease
```
The APK will be located at: `android/app/build/outputs/apk/release/app-release.apk`

---
**Completed by:** [Abhyan Bansal]
**Assignment:** React Native Intern Assignment - Music Player
