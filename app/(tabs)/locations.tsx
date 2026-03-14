import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase/firebaseConfig";

type SavedLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  savedAt: any;
};

function formatDate(savedAt: any): string {
  if (!savedAt) return "Recently saved";
  const date = savedAt.toDate ? savedAt.toDate() : new Date(savedAt);
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default function LocationsScreen() {
  const router = useRouter();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "savedLocations"),
      orderBy("savedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setLocations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedLocation)));
      setLoading(false);
    });

    return unsub;
  }, []);

  const handleViewConditions = (location: SavedLocation) => {
    router.push({
      pathname: "/marine",
      params: {
        lat: String(location.latitude),
        lng: String(location.longitude),
        name: location.name,
      },
    });
  };

  const handleUnsave = (location: SavedLocation) => {
    Alert.alert(
      "Remove location",
      `Remove "${location.name}" from your saved locations?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const user = auth.currentUser;
            if (!user) return;
            await deleteDoc(doc(db, "users", user.uid, "savedLocations", location.id));
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0a1628" }} edges={["bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#c9a84c" size="large" />
          <Text style={{ color: "#64748b", marginTop: 12, fontSize: 14 }}>Loading locations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a1628" }} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 4 }}>
          <Text style={{ color: "#c9a84c", fontSize: 22, fontWeight: "700" }}>
            Saved Locations
          </Text>
          <Text style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            {locations.length === 0
              ? "No locations saved yet"
              : `${locations.length} location${locations.length === 1 ? "" : "s"} saved`}
          </Text>
        </View>

        {locations.length === 0 ? (
          <View
            style={{
              backgroundColor: "#0f1f3d",
              borderRadius: 20,
              padding: 40,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#1e3a5f",
              marginTop: 8,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: "#1e3a5f",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="bookmark-outline" size={30} color="#c9a84c" />
            </View>
            <Text
              style={{
                color: "#e2e8f0",
                fontSize: 17,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              No saved locations
            </Text>
            <Text
              style={{
                color: "#64748b",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Tap the bookmark icon on the map to save locations here for quick access.
            </Text>
          </View>
        ) : (
          locations.map((loc) => (
            <View
              key={loc.id}
              style={{
                backgroundColor: "#0f1f3d",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#1e3a5f",
                overflow: "hidden",
              }}
            >
              {/* Card body */}
              <View style={{ padding: 18 }}>
                {/* Top row: icon + name + bookmark */}
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: "#1e3a5f",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Ionicons name="location" size={22} color="#c9a84c" />
                  </View>

                  <View style={{ flex: 1, paddingTop: 2 }}>
                    <Text
                      style={{
                        color: "#e2e8f0",
                        fontSize: 17,
                        fontWeight: "700",
                        lineHeight: 22,
                      }}
                    >
                      {loc.name}
                    </Text>
                    <Text
                      style={{
                        color: "#c9a84c",
                        fontSize: 11,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        marginTop: 4,
                      }}
                    >
                      Saved {formatDate(loc.savedAt)}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleUnsave(loc)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.5 : 1,
                      padding: 6,
                      marginTop: -2,
                    })}
                  >
                    <Ionicons name="bookmark" size={24} color="#c9a84c" />
                  </Pressable>
                </View>

                {/* Coordinates row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 14,
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: "#1e3a5f",
                  }}
                >
                  <Ionicons name="compass-outline" size={15} color="#475569" />
                  <Text
                    style={{
                      color: "#475569",
                      fontSize: 13,
                      fontVariant: ["tabular-nums"],
                      flex: 1,
                    }}
                  >
                    {loc.latitude.toFixed(6)}°, {loc.longitude.toFixed(6)}°
                  </Text>
                </View>
              </View>

              {/* Footer button row */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "#1e3a5f",
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pressable
                  onPress={() => handleViewConditions(loc)}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    backgroundColor: pressed ? "#27446f" : "#1e3a5f",
                  })}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      flexWrap: "nowrap",
                    }}
                  >
                    <Ionicons name="water" size={17} color="#c9a84c" />
                    <Text
                      style={{
                        color: "#c9a84c",
                        fontSize: 15,
                        fontWeight: "700",
                        marginLeft: 8,
                      }}
                    >
                      View Conditions
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Module-level store to pass target location to the map tab
export const pendingMapTarget = {
  pending: false,
  latitude: 0,
  longitude: 0,
  name: "",
};