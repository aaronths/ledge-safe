import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebase/firebaseConfig";

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/login" as Href);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a1628" }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>

        {/* Avatar + email */}
        <View style={{
          backgroundColor: "#0f1f3d",
          borderRadius: 20,
          padding: 28,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#1e3a5f",
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#1e3a5f",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            borderWidth: 2,
            borderColor: "#c9a84c",
          }}>
            <Ionicons name="person" size={36} color="#c9a84c" />
          </View>
          <Text style={{ color: "#e2e8f0", fontSize: 17, fontWeight: "700" }}>
            {user?.email}
          </Text>
          <Text style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
            Member since {user?.metadata.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString("en-AU", { month: "long", year: "numeric" })
              : "—"}
          </Text>
        </View>

        {/* Account info */}
        <View style={{
          backgroundColor: "#0f1f3d",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#1e3a5f",
          overflow: "hidden",
        }}>
          <Text style={{
            color: "#c9a84c",
            fontSize: 11,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 1,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 10,
          }}>
            Account
          </Text>

          {[
            { icon: "mail-outline" as const, label: "Email", value: user?.email ?? "—" },
            { icon: "shield-checkmark-outline" as const, label: "UID", value: user?.uid ? user.uid.slice(0, 12) + "..." : "—" },
          ].map((row, i, arr) => (
            <View
              key={row.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderTopWidth: 1,
                borderTopColor: "#1e3a5f",
                gap: 14,
              }}
            >
              <Ionicons name={row.icon} size={18} color="#c9a84c" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 11, marginBottom: 2 }}>{row.label}</Text>
                <Text style={{ color: "#e2e8f0", fontSize: 14 }}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sign out */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#1a0a0a" : "#1c0f0f",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#7f1d1d",
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            marginTop: 8,
          })}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={{ color: "#ef4444", fontSize: 15, fontWeight: "600" }}>
            Sign out
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}