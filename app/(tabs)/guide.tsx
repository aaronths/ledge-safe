import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GUIDE_SECTIONS = [
  {
    id: "facts",
    icon: "information-circle-outline" as const,
    title: "Facts and Statistics",
    points: [
      "Rock fishing is one of Australia’s deadliest sports, with multiple deaths every year.",
      "Most fatalities involve anglers swept from exposed rock ledges during high swell and rising tide.",
      "Risk Scores in this app are guidance only and never a guarantee of safety.",
    ],
  },
  {
    id: "equipment",
    icon: "help-buoy-outline" as const,
    title: "Equipment",
    points: [
      "In NSW, rock fishers in declared areas must wear an approved lifejacket that meets current standards; fines apply if you are caught without one.",
      "A well‑fitted lifejacket can dramatically improve survival if you are washed in.",
      "Specialised rock‑fishing cleats or shoes with metal spikes are strongly recommended for grip on wet, slippery ledges.",
    ],
  },
  {
    id: "laws",
    icon: "document-text-outline" as const,
    title: "Laws and Regulations",
    points: [
      "Know where nearby angel rings and other rescue devices are located before you start fishing.",
      "Check local rock‑fishing safety rules and lifejacket requirements for your council or region.",
      "Know your fish size and bag limits, and release undersized or excess fish safely.",
    ],
  },
  {
    id: "education",
    icon: "school-outline" as const,
    title: "Further Education",
    points: [
      "Consider taking a rock‑fishing safety course or attending local safety briefings.",
      "Follow guidance from Surf Life Saving, local councils and marine safety authorities.",
      "Always fish with a buddy, avoid alcohol, and be prepared to walk away if conditions look unsafe.",
    ],
  },
];

export default function GuideScreen() {
  const [openId, setOpenId] = useState<string | null>(
    GUIDE_SECTIONS[0]?.id ?? null,
  );

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0a1628" }}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: "#d8b372", fontSize: 22, fontWeight: "700" }}>
            Guide to Rock Fishing
          </Text>
          <Text style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
            Key facts, legal requirements and safety tips to use alongside
            LedgeSafe.
          </Text>
        </View>

        {GUIDE_SECTIONS.map((section) => {
          const isOpen = openId === section.id;
          return (
            <View
              key={section.id}
              style={{
                backgroundColor: "#0f1f3d",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#1e3a5f",
                overflow: "hidden",
              }}
            >
              <Pressable
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  );
                  setOpenId(isOpen ? null : section.id);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#1e3a5f",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Ionicons name={section.icon} size={18} color="#d8b372" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#e2e8f0",
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {section.title}
                  </Text>
                </View>
                <Ionicons
                  name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
                  size={18}
                  color="#9ca3af"
                />
              </Pressable>

              {isOpen && (
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingBottom: 14,
                    paddingTop: 4,
                    gap: 6,
                  }}
                >
                  {section.points.map((point, idx) => (
                    <View key={idx} style={{ flexDirection: "row", gap: 8 }}>
                      <Text style={{ color: "#d8b372" }}>•</Text>
                      <Text
                        style={{
                          color: "#cbd5f5",
                          fontSize: 13,
                          lineHeight: 19,
                          flex: 1,
                        }}
                      >
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
