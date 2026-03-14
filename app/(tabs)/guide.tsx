import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GUIDE_ITEMS = [
  {
    icon: "map-outline" as const,
    title: "Find a Location",
    description: "Pan and zoom the map to any area you want to assess. The crosshair marks the exact point being analysed.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Calculate Safety",
    description: "Tap the button on the map screen to run a safety analysis for the selected coordinates.",
  },
  {
    icon: "stats-chart-outline" as const,
    title: "Read the Results",
    description: "Review the safety score and contributing factors returned for your chosen location.",
  },
  {
    icon: "bookmark-outline" as const,
    title: "Save Locations",
    description: "Save locations you care about to quickly revisit their safety data in the Locations tab.",
  },
];

export default function GuideScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a1628" }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: "#c9a84c", fontSize: 22, fontWeight: "700" }}>How it works</Text>
          <Text style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
            Get started with LedgeSafe in four simple steps.
          </Text>
        </View>

        {GUIDE_ITEMS.map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#0f1f3d",
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: "#1e3a5f",
              flexDirection: "row",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: "#1e3a5f",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Ionicons name={item.icon} size={20} color="#c9a84c" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#e2e8f0", fontSize: 15, fontWeight: "600", marginBottom: 4 }}>
                {item.title}
              </Text>
              <Text style={{ color: "#64748b", fontSize: 13, lineHeight: 20 }}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}