import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.github.jschoch.espELSFrontend',
  appName: 'espELS',
  webDir: 'build',
  bundledWebRuntime: true,
  loggingBehavior?: 'debug',
  android: {
    allowMixedContent: true
  },
  cordova: {
    allowMixedContent: true
  },
  server: {
    allowMixedContent: true
  }
};

export default config;