import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: Add real authentication
    router.replace("/(tabs)/map" as Href);
  };

  const handleSignIn = () => {
    router.push("/login" as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900">LedgeSafe</Text>
          <Text className="mt-2 text-gray-600">
            Make a new LedgeSafe account
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700">
              Email
            </Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              value={email}
            />
          </View>

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700">
              Password
            </Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900"
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
            />
          </View>

          <Pressable onPress={() => {}} className="mt-1 self-end">
            <Text className="text-sm text-blue-600">Forgot password?</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            className="mt-4 rounded-xl bg-blue-600 py-3.5 active:opacity-90"
          >
            <Text className="text-center text-base font-semibold text-white">
              Sign in
            </Text>
          </Pressable>
        </View>

        <View className="mt-8 flex-row justify-center gap-1">
          <Text className="text-gray-600">Already have an account?</Text>
          <Pressable onPress={handleSignIn}>
            <Text className="font-medium text-blue-600">Sign up</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
