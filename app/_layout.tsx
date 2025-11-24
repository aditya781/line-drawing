import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        // This option hides the header bar across all screens in this stack
        headerShown: false,
      }}
    />
  );
}