// {
//   "expo": {
//     "name": "Note App",
//     "slug": "Note-App",
//     "version": "1.0.2",
//     "orientation": "portrait",
//     "icon": "./assets/images/icon.png",
//     "scheme": "myapp",
//     "userInterfaceStyle": "automatic",
//     "newArchEnabled": true,
//     "updates": {
//       "enabled": true,
//       "fallbackToCacheTimeout": 0,
//       "checkAutomatically": "ON_ERROR_RECOVERY",
//       "url": "https://u.expo.dev/b424d505-8c67-4588-bf86-c3dc97549e8b"
//     },
//     "ios": {
//       "supportsTablet": true
//     },
//     "android": {
//       "adaptiveIcon": {
//         "foregroundImage": "./assets/images/adaptive-icon.png",
//         "backgroundColor": "#ffffff"
//       },
//       "package": "com.naymyokhant.NoteApp"
//     },
//     "web": {
//       "bundler": "metro",
//       "output": "static",
//       "favicon": "./assets/images/favicon.png"
//     },
//     "plugins": [
//       "expo-router",
//       [
//         "expo-splash-screen",
//         {
//           "image": "./assets/images/splash-icon.png",
//           "imageWidth": 200,
//           "resizeMode": "contain",
//           "backgroundColor": "#ffffff"
//         }
//       ]
//     ],
//     "experiments": {
//       "typedRoutes": true
//     },
//     "extra": {
//       "env": "preview",
//       "router": {
//         "origin": false
//       },
//       "eas": {
//         "projectId": "b424d505-8c67-4588-bf86-c3dc97549e8b"
//       }
//     },
//     "runtimeVersion": {
//       "policy": "appVersion"
//     }
//   }
// }

import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: "Note App",
    slug: "Note-App",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD",
      url: "https://u.expo.dev/b424d505-8c67-4588-bf86-c3dc97549e8b",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.naymyokhant.NoteApp",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-font",
      "expo-web-browser",
      [
        "expo-sqlite",
        {
          enableFTS: true,
          useSQLCipher: true,
          android: {
            // Override the shared configuration for Android
            enableFTS: true,
            useSQLCipher: false,
          },
          ios: {
            // You can also override the shared configurations for iOS
            customBuildFlags: [
              "-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1",
            ],
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      env: "preview",
      router: {
        origin: false,
      },
      eas: {
        projectId: "b424d505-8c67-4588-bf86-c3dc97549e8b",
      },
    },
    runtimeVersion: "1.0.0", // Use a string directly here for appVersion
  };
};
