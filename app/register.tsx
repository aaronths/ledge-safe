import { type Href, useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
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
import { auth, db } from "../firebase/firebaseConfig";

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );


      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      router.replace("/(tabs)/map" as Href);
    } catch (error: any) {
      Alert.alert("Sign up failed", error?.message ?? "Unknown error");
    } finally {
      setIsLoading(false);
    }
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
              placeholder="At least 6 characters"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              editable={!isLoading}
            />
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={isLoading}
            className={`mt-4 rounded-xl py-3.5 active:opacity-90 ${
              isLoading ? "bg-blue-400" : "bg-blue-600"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">
                Sign up
              </Text>
            )}
          </Pressable>
        </View>

        <View className="mt-8 flex-row justify-center gap-1">
          <Text className="text-gray-600">Already have an account?</Text>
          <Pressable onPress={handleSignIn}>
            <Text className="font-medium text-blue-600">Sign in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}