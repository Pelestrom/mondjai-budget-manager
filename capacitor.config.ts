import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.da72b7cc8927485da1a7037801793cb4',
  appName: 'MonDjai',
  webDir: 'dist',
  server: {
    url: 'https://da72b7cc-8927-485d-a1a7-037801793cb4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: '#00A86B'
  }
};

export default config;
