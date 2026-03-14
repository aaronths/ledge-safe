import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  View,
} from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebase/firebaseConfig";

import { LedgeButton } from "@/components/LedgeButton";
import { LedgeInput } from "@/components/LedgeInput";
import { OceanBackdrop } from "@/components/OceanBackdrop";

const easing = Easing.bezier(0.2, 0, 0, 1);

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

  const handleCreateAccount = () => {
    router.push("/register" as Href);
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password" as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-midnight-950" edges={["top", "bottom"]}>
      <OceanBackdrop />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6 pb-8 pt-6"
      >
        <View className="items-center gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-sand-300">
              <MaterialCommunityIcons name="anchor" size={20} color="#070f24" />
            </View>

            <Text className="text-[36px] font-semibold tracking-tight text-sand-100">
              Ledge Safe
            </Text>
          </View>

          <Text className="max-w-[280px] text-center text-lg leading-7 text-sand-200/85">
            Check the ledge before you cast.
          </Text>
        </View>

        <Animated.View
          entering={FadeInDown.duration(400).easing(easing)}
          className="mt-10 w-full gap-7"
        >
          <View className="gap-5">
            <LedgeInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email Address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
              editable={!isLoading}
            />

            <LedgeInput
              autoCapitalize="none"
              autoComplete="password"
              label="Password"
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              editable={!isLoading}
            />
          </View>

          <Pressable
            onPress={handleForgotPassword}
            className="self-center"
            disabled={isLoading}
          >
            <Text className="text-base text-sand-200/55">Forgot password?</Text>
          </Pressable>

          <View className="gap-3">
            <LedgeButton onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                "Sign In"
              )}
            </LedgeButton>

            <LedgeButton
              variant="ghost"
              onPress={handleCreateAccount}
              disabled={isLoading}
            >
              <Text className="text-center text-base font-medium text-sand-200/65">
                New here? <Text className="text-sand-300">Create an account</Text>
              </Text>
            </LedgeButton>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}