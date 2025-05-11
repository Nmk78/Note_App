import { Stack } from "expo-router";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "../utils/db";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <SQLiteProvider databaseName="notes.db" onInit={migrateDbIfNeeded}>
          <Stack screenOptions={{ headerShown: false }}>
            <StatusBar style="auto" backgroundColor="#f3f4f6" />
            <Stack.Screen name="index" />
            <Stack.Screen
              name="info"
              options={{
                headerShown: true,
                title: "Info",
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
              }}
            />
          </Stack>
        </SQLiteProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
