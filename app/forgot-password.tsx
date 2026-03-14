import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { LedgeButton } from "@/components/LedgeButton";
import { LedgeInput } from "@/components/LedgeInput";
import { OceanBackdrop } from "@/components/OceanBackdrop";

const easing = Easing.bezier(0.2, 0, 0, 1);

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/login" as Href);
  };

  const handleSendReset = () => {
    // TODO: Connect to real password reset endpoint
    handleBack();
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
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={16} color="#d8b372" />
            <Text className="text-base font-medium text-sand-200/75">Back</Text>
          </Pressable>
        </View>

        <View className="flex-1 justify-center">
          <View className="items-center">
            <Text className="text-[38px] font-semibold tracking-tight text-sand-100">
              Reset Password
            </Text>
            <Text className="mt-2 max-w-[310px] text-center text-lg leading-7 text-sand-200/85">
              Enter your email and we will send a link to reset your password.
            </Text>
          </View>

          <Animated.View
            entering={FadeInDown.duration(360).easing(easing)}
            className="mt-8 w-full gap-7"
          >
            <LedgeInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email Address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
            />

            <View className="gap-3">
              <LedgeButton onPress={handleSendReset}>Send Reset Link</LedgeButton>

              <LedgeButton variant="ghost" onPress={handleBack}>
                <Text className="text-center text-base font-medium text-sand-200/65">
                  Back to <Text className="text-sand-300">Sign in</Text>
                </Text>
              </LedgeButton>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
