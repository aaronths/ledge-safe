import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchWeatherApi } from "openmeteo";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { type GraphPoint } from "react-native-graph";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

type TimeSeriesPoint = {
  time: string;
  sea_level_height_msl: number | null;
  swell_wave_height: number | null;
  swell_wave_direction: number | null;
  swell_wave_period: number | null;
};

function formatTimeLabel(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function Section({
  title,
  unit,
  points,
  color,
  width,
  fixedYAxis,
}: {
  title: string;
  unit: string;
  points: GraphPoint[];
  color: string;
  width: number;
  fixedYAxis?: {
    maxValue: number;
    noOfSections: number;
    mostNegativeValue?: number;
    noOfSectionsBelowXAxis?: number;
  };
}) {
  const { min, max } = useMemo(() => {
    if (points.length === 0)
      return { min: null as number | null, max: null as number | null };
    let minVal = Number.POSITIVE_INFINITY;
    let maxVal = Number.NEGATIVE_INFINITY;
    for (const p of points) {
      if (p.value < minVal) minVal = p.value;
      if (p.value > maxVal) maxVal = p.value;
    }
    return { min: minVal, max: maxVal };
  }, [points]);

  const lineData = useMemo(
    () =>
      points.map((p) => {
        const d = p.date;
        const is3hr = d.getHours() % 3 === 0 && d.getMinutes() === 0;
        return {
          value: p.value,
          label: is3hr ? formatTimeLabel(d) : "",
          showXAxisIndex: is3hr,
        };
      }),
    [points],
  );

  const chartWidth = width - 44;
  const spacing = lineData.length > 1 ? chartWidth / (lineData.length - 1) : 0;

  return (
    <View style={[styles.section, { width }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle} numberOfLines={1}>
          {title}
        </Text>
        {min !== null && max !== null ? (
          <Text style={styles.sectionMeta}>
            min {min.toFixed(2)} {unit} · max {max.toFixed(2)} {unit}
          </Text>
        ) : (
          <Text style={styles.sectionMetaEmpty}>No data</Text>
        )}
      </View>
      <View style={styles.chartContainer}>
        {lineData.length > 0 ? (
          <LineChart
            data={lineData}
            color={color}
            thickness={2}
            hideDataPoints
            parentWidth={chartWidth}
            width={chartWidth}
            spacing={Math.max(8, Math.min(spacing, 40))}
            initialSpacing={8}
            endSpacing={24}
            height={CHART_HEIGHT}
            noOfSections={fixedYAxis?.noOfSections ?? 4}
            noOfSectionsBelowXAxis={fixedYAxis?.noOfSectionsBelowXAxis}
            maxValue={fixedYAxis?.maxValue}
            mostNegativeValue={fixedYAxis?.mostNegativeValue}
            showFractionalValues={false}
            roundToDigits={0}
            yAxisLabelSuffix={` ${unit}`}
            yAxisColor="#475569"
            yAxisTextStyle={{ color: "#9ca3af", fontSize: 10 }}
            xAxisColor="#475569"
            xAxisLabelTexts={lineData.map((d) => d.label)}
            xAxisLabelTextStyle={{
              color: "#9ca3af",
              fontSize: 10,
              width: 44,
              textAlign: "center",
              marginLeft: -22,
            }}
            rulesColor="rgba(71,85,105,0.3)"
            isAnimated
            disableScroll
          />
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>No data available.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const CHART_HEIGHT = 200;

const styles = StyleSheet.create({
  section: {
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    flex: 1,
    paddingRight: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  sectionMeta: {
    fontSize: 11,
    color: "#9ca3af",
  },
  sectionMetaEmpty: {
    fontSize: 11,
    color: "#64748b",
  },
  chartContainer: {
    height: CHART_HEIGHT + 40,
  },
  graph: {
    width: "100%",
    height: 100,
  },
  emptyChart: {
    height: CHART_HEIGHT + 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChartText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  toggleRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e3a5f",
    backgroundColor: "#0f1f3d",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#c9a84c",
    borderColor: "#c9a84c",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  toggleTextActive: {
    color: "#0f1f3d",
  },
});

const HORIZONTAL_PADDING = 32;

export default function MarineScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.max(200, windowWidth - HORIZONTAL_PADDING);
  const params = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    name?: string;
  }>();
  const lat = Number(params.lat);
  const lng = Number(params.lng);
  const locationName = params.name ?? "Selected location";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[] | null>(null);
  const [mode, setMode] = useState<"swell" | "sea" | "period">("swell");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setError("Missing coordinates.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const openMeteoParams = {
          latitude: lat,
          longitude: lng,
          hourly: [
            "sea_level_height_msl",
            "swell_wave_height",
            "swell_wave_direction",
            "swell_wave_period",
          ],
          forecast_days: 1,
        };
        const url = "https://marine-api.open-meteo.com/v1/marine";
        const responses = await fetchWeatherApi(url, openMeteoParams);
        const response = responses[0];
        if (!response) throw new Error("No response returned.");

        const utcOffsetSeconds = response.utcOffsetSeconds();
        const hourly = response.hourly();
        if (!hourly) throw new Error("No hourly data returned.");

        const timeCount =
          (Number(hourly.timeEnd()) - Number(hourly.time())) /
          hourly.interval();
        const time = Array.from(
          { length: timeCount },
          (_, i) =>
            new Date(
              (Number(hourly.time()) +
                i * hourly.interval() +
                utcOffsetSeconds) *
                1000,
            ),
        );

        const sea = hourly.variables(0)?.valuesArray() ?? null;
        const swellH = hourly.variables(1)?.valuesArray() ?? null;
        const swellDir = hourly.variables(2)?.valuesArray() ?? null;
        const swellP = hourly.variables(3)?.valuesArray() ?? null;

        const jsonSeries: TimeSeriesPoint[] = time.map((t, i) => ({
          time: t.toISOString(),
          sea_level_height_msl: sea?.[i] ?? null,
          swell_wave_height: swellH?.[i] ?? null,
          swell_wave_direction: swellDir?.[i] ?? null,
          swell_wave_period: swellP?.[i] ?? null,
        }));

        if (!cancelled) {
          setTimeSeries(jsonSeries);
          // requested: log full time series in JSON format
          console.log(
            "Open-Meteo marine hourly time series:",
            JSON.stringify(jsonSeries, null, 2),
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to fetch marine data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  const graphData = useMemo(() => {
    if (!timeSeries) return null;

    const toPoints = (key: keyof Omit<TimeSeriesPoint, "time">): GraphPoint[] =>
      timeSeries
        .map((p) => {
          const v = p[key];
          if (typeof v !== "number" || !Number.isFinite(v)) return null;
          const d = new Date(p.time);
          if (!Number.isFinite(d.getTime())) return null;
          return { date: d, value: v };
        })
        .filter((x): x is GraphPoint => x != null);

    return {
      sea: toPoints("sea_level_height_msl"),
      swellH: toPoints("swell_wave_height"),
      swellDir: toPoints("swell_wave_direction"),
      swellP: toPoints("swell_wave_period"),
    };
  }, [timeSeries]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0a1628" }}
      edges={["top", "bottom"]}
    >
      <View style={{ flex: 1, paddingHorizontal: 12, paddingBottom: 12 }}>
        <View
          style={{
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={{
              borderRadius: 999,
              padding: 8,
              backgroundColor: "#1e293b",
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#e5e7eb",
              }}
              numberOfLines={1}
            >
              {locationName}
            </Text>
            <Text style={{ fontSize: 11, color: "#9ca3af" }} numberOfLines={1}>
              Conditions Next 24hrs ·{" "}
              {Number.isFinite(lat) ? lat.toFixed(5) : "—"},{" "}
              {Number.isFinite(lng) ? lng.toFixed(5) : "—"}
            </Text>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setMode("swell")}
            style={[
              styles.toggleButton,
              mode === "swell" && styles.toggleButtonActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                mode === "swell" && styles.toggleTextActive,
              ]}
            >
              Swell
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("sea")}
            style={[
              styles.toggleButton,
              mode === "sea" && styles.toggleButtonActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                mode === "sea" && styles.toggleTextActive,
              ]}
            >
              Sea level height
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("period")}
            style={[
              styles.toggleButton,
              mode === "period" && styles.toggleButtonActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                mode === "period" && styles.toggleTextActive,
              ]}
            >
              Wave period
            </Text>
          </Pressable>
        </View>

        <View style={{ flex: 1, marginTop: 8 }}>
          {loading && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator color="#c9a84c" />
              <Text style={{ marginTop: 12, fontSize: 14, color: "#e5e7eb" }}>
                Calculating Location Safety
              </Text>
            </View>
          )}

          {!loading && error && (
            <View
              style={{
                marginTop: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#b91c1c",
                backgroundColor: "#450a0a",
                padding: 16,
              }}
            >
              <Text
                style={{ fontWeight: "600", color: "#fecaca", marginBottom: 4 }}
              >
                Couldn’t load marine data
              </Text>
              <Text style={{ color: "#fecaca", fontSize: 13 }}>{error}</Text>
            </View>
          )}

          {!loading && !error && graphData && (
            <View style={{ flex: 1 }}>
              {mode === "swell" && (
                <View style={{ flex: 1 }}>
                  <Section
                    title="Swell wave height"
                    unit="m"
                    points={graphData.swellH}
                    color="#c9a84c"
                    width={chartWidth}
                    fixedYAxis={{ maxValue: 5, noOfSections: 5 }}
                  />
                </View>
              )}
              {mode === "sea" && (
                <View style={{ flex: 1 }}>
                  <Section
                    title="Sea level height (MSL)"
                    unit="m"
                    points={graphData.sea}
                    color="#38bdf8"
                    width={chartWidth}
                    fixedYAxis={{
                      maxValue: 3,
                      noOfSections: 3,
                      mostNegativeValue: -1,
                      noOfSectionsBelowXAxis: 1,
                    }}
                  />
                </View>
              )}
              {mode === "period" && (
                <View style={{ flex: 1 }}>
                  <Section
                    title="Swell wave period"
                    unit="s"
                    points={graphData.swellP}
                    color="#a855f7"
                    width={chartWidth}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
