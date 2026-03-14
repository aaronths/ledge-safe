import { type Href, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebase/firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Please enter your email and password.");
      return;
    }

    try {
      setIsLoading(true);

      await signInWithEmailAndPassword(auth, email.trim(), password);

      router.replace("/(tabs)/map" as Href);
    } catch (error: any) {
      let message = "Something went wrong. Please try again.";

      if (error.code === "auth/invalid-email") {
        message = "That email address is not valid.";
      } else if (error.code === "auth/invalid-credential") {
        message = "Incorrect email or password.";
      } else if (error.code === "auth/user-not-found") {
        message = "No account was found for that email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect email or password.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      }

      Alert.alert("Sign in failed", message);
      console.log("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/register" as Href);
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
            Sign in to your LedgeSafe account
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
              editable={!isLoading}
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
              editable={!isLoading}
            />
          </View>

          <Pressable onPress={() => {}} className="mt-1 self-end">
            <Text className="text-sm text-blue-600">Forgot password?</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className={`mt-4 rounded-xl py-3.5 active:opacity-90 ${
              isLoading ? "bg-blue-400" : "bg-blue-600"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">
                Sign in
              </Text>
            )}
          </Pressable>
        </View>

        <View className="mt-8 flex-row justify-center gap-1">
          <Text className="text-gray-600">Don{"'"}t have an account?</Text>
          <Pressable onPress={handleSignUp}>
            <Text className="font-medium text-blue-600">Sign up</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}