
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tcponto.app',
  appName: 'TCPonto',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // SECURITY: a app só navega para o Supabase (o domínio de preview do Lovable foi removido)
    allowNavigation: [
      'https://cyapqtyrefkdemhxryvs.supabase.co'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1f2937",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
