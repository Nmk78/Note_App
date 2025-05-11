import React from "react";
import { Text, ScrollView } from "react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { Link } from "expo-router";

export default function AboutScreen() {
  const { manifest, appOwnership, executionEnvironment } = Constants;

  const updateInfo = Updates.useUpdates
    ? Updates.useUpdates()
    : Updates.manifest || {};

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>📱 App Info</Text>
      <Text>Version: {Constants.expoConfig?.version ?? "unknown"}</Text>
      <Text>
        Build Number:{" "}
        {Constants.expoConfig?.android?.versionCode ??
          Constants.expoConfig?.ios?.buildNumber ??
          "unknown"}
      </Text>
      <Text>App Ownership: {appOwnership}</Text>
      <Text>Execution Env: {executionEnvironment}</Text>

      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
        📦 OTA Update Info
      </Text>
      <Text>Update Channel: {Updates.channel ?? "unknown"}</Text>
      <Text>Update ID: {Updates.updateId ?? "N/A"}</Text>
      <Text>Runtime Version: {Updates.runtimeVersion ?? "N/A"}</Text>

      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
        🧰 Device Info
      </Text>
      <Text>Installation ID: {Constants.installationId}</Text>

      <Text>
        Developed by{" "}
        <Link className="underline text-blue-500" href="http://naymyokhant.vercel.app/">Nay Myo Khant</Link>
      </Text>
    </ScrollView>
  );
}
