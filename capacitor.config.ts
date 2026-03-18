import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.musicplayer',
  appName: 'Music Player',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
