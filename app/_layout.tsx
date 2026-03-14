import "../global.css";

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
