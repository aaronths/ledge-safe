import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { LedgeButton } from "@/components/LedgeButton";
import { LedgeInput } from "@/components/LedgeInput";
import { OceanBackdrop } from "@/components/OceanBackdrop";

const easing = Easing.bezier(0.2, 0, 0, 1);

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    // TODO: Add real authentication
    router.replace("/(tabs)/map" as Href);
  };

  const handleBackToSignIn = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/login" as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-midnight-950" edges={["top", "bottom"]}>
      <OceanBackdrop />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 pb-8 pt-3"
      >
        <View className="pt-2">
          <Pressable
            className="flex-row items-center gap-2 self-start"
            onPress={handleBackToSignIn}
          >
            <Ionicons name="arrow-back" size={16} color="#d8b372" />
            <Text className="text-base font-medium text-sand-200/75">Back</Text>
          </Pressable>
        </View>

        <View className="flex-1 justify-center">
          <View className="items-center">
            <Text className="text-[38px] font-semibold tracking-tight text-sand-100">
              Create Account
            </Text>
            <Text className="mt-2 max-w-[300px] text-center text-lg leading-7 text-sand-200/85">
              Join the crew. Stay safe on the rocks.
            </Text>
          </View>

          <Animated.View
            entering={FadeInDown.duration(400).easing(easing)}
            className="mt-8 w-full gap-7"
          >
            <View className="gap-5">
              <LedgeInput
                autoCapitalize="words"
                autoComplete="name"
                label="Full Name"
                onChangeText={setName}
                placeholder="John Fisher"
                value={name}
              />

              <LedgeInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                label="Email Address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                value={email}
              />

              <LedgeInput
                autoCapitalize="none"
                autoComplete="new-password"
                label="Password"
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                value={password}
              />

              <LedgeInput
                autoCapitalize="none"
                autoComplete="new-password"
                label="Confirm Password"
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
                value={confirmPassword}
              />
            </View>

            <Text className="text-center text-xs leading-relaxed text-sand-200/45">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </Text>

            <View className="gap-3">
              <LedgeButton onPress={handleRegister}>Create Account</LedgeButton>

              <LedgeButton variant="ghost" onPress={handleBackToSignIn}>
                <Text className="text-center text-base font-medium text-sand-200/65">
                  Already have an account? <Text className="text-sand-300">Sign in</Text>
                </Text>
              </LedgeButton>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
