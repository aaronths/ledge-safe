import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_NEWS = [
  {
    id: "1",
    headline: "Lifejacket laws tightened at popular NSW rock fishing spots",
    date: "12 Mar 2025",
    snippet:
      "New South Wales has expanded mandatory lifejacket zones to include more high-risk ledges. Fines up to $1,200 apply for non-compliance.",
    source: "Marine Safety NSW",
  },
  {
    id: "2",
    headline:
      "Surf Life Saving urges caution after weekend rock fishing rescues",
    date: "10 Mar 2025",
    snippet:
      "Multiple anglers were pulled from the water after being swept off rocks. SLS advises checking swell and tide before heading out.",
    source: "Surf Life Saving",
  },
  {
    id: "3",
    headline: "Angel ring installed at notorious Sydney fishing ledge",
    date: "5 Mar 2025",
    snippet:
      "A new emergency throw line has been installed at a well-known rock fishing location to improve rescue response times.",
    source: "Local Council",
  },
  {
    id: "4",
    headline: "Rock fishing safety course sees record sign-ups",
    date: "1 Mar 2025",
    snippet:
      "Free safety workshops are filling quickly as the community responds to recent incidents. Next sessions open for registration.",
    source: "Community News",
  },
];

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

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e3a5f",
    backgroundColor: "#0f1f3d",
  },
  toggleBtnActive: {
    backgroundColor: "#d8b372",
    borderColor: "#d8b372",
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  toggleTextActive: {
    color: "#070f24",
  },
  pageTitle: {
    color: "#d8b372",
    fontSize: 22,
    fontWeight: "700",
  },
  pageSubtitle: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
  },
  newsSection: {
    gap: 12,
  },
  newsTitle: {
    color: "#d8b372",
    fontSize: 22,
    fontWeight: "700",
  },
  newsSubtitle: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 4,
  },
  newsCard: {
    backgroundColor: "#0f1f3d",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e3a5f",
    padding: 16,
    gap: 8,
  },
  newsHeadline: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  newsMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  newsDate: {
    color: "#9ca3af",
    fontSize: 12,
  },
  newsSource: {
    color: "#d8b372",
    fontSize: 12,
    fontWeight: "500",
  },
  newsSnippet: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 19,
  },
});

export default function GuideScreen() {
  const [mode, setMode] = useState<"guide" | "news">("guide");
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
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setMode("guide")}
            style={[
              styles.toggleBtn,
              mode === "guide" && styles.toggleBtnActive,
            ]}
          >
            <Ionicons
              name="book-outline"
              size={16}
              color={mode === "guide" ? "#070f24" : "#e2e8f0"}
            />
            <Text
              style={[
                styles.toggleText,
                mode === "guide" && styles.toggleTextActive,
              ]}
            >
              Guide
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("news")}
            style={[
              styles.toggleBtn,
              mode === "news" && styles.toggleBtnActive,
            ]}
          >
            <Ionicons
              name="newspaper-outline"
              size={16}
              color={mode === "news" ? "#070f24" : "#e2e8f0"}
            />
            <Text
              style={[
                styles.toggleText,
                mode === "news" && styles.toggleTextActive,
              ]}
            >
              News
            </Text>
          </Pressable>
        </View>

        {mode === "news" ? (
          <View style={styles.newsSection}>
            <Text style={styles.newsTitle}>Latest News</Text>
            <Text style={styles.newsSubtitle}>
              Stay informed on the latest news about rock fishing.
            </Text>
            {MOCK_NEWS.map((article) => (
              <View key={article.id} style={styles.newsCard}>
                <Text style={styles.newsHeadline}>{article.headline}</Text>
                <View style={styles.newsMeta}>
                  <Text style={styles.newsDate}>{article.date}</Text>
                  <Text style={styles.newsSource}>{article.source}</Text>
                </View>
                <Text style={styles.newsSnippet}>{article.snippet}</Text>
              </View>
            ))}
          </View>
        ) : (
          <>
            <View style={{ marginBottom: 8, marginTop: 4 }}>
              <Text style={styles.pageTitle}>Guide to Rock Fishing</Text>
              <Text style={styles.pageSubtitle}>
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
                    padding: 2,
                    marginVertical: 5,
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
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                      >
                        {section.title}
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        isOpen ? "chevron-up-outline" : "chevron-down-outline"
                      }
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
                        <View
                          key={idx}
                          style={{ flexDirection: "row", gap: 8 }}
                        >
                          <Text style={{ color: "#d8b372" }}>•</Text>
                          <Text
                            style={{
                              color: "#cbd5f5",
                              fontSize: 15,
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
