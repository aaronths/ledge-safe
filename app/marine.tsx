import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { fetchWeatherApi } from "openmeteo";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

type TimeSeriesPoint = {
  time: string;
  sea_level_height_msl: number | null;
  swell_wave_height: number | null;
  swell_wave_direction: number | null;
  swell_wave_period: number | null;
};

type ChartPoint = { value: number; label?: string };

type AISummary = {
  loading: boolean;
  error: string | null;
  summary: string | null;
};

// Add your OpenAI API key here
const OPENAI_API_KEY = "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";

function Section({
  title,
  unit,
  points,
  color,
  height,
}: {
  title: string;
  unit: string;
  points: ChartPoint[];
  color: string;
  height: number;
}) {
  const { min, max } = useMemo(() => {
    if (points.length === 0) return { min: null as number | null, max: null as number | null };
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const p of points) {
      if (p.value < min) min = p.value;
      if (p.value > max) max = p.value;
    }
    return { min, max };
  }, [points]);

  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-3">
      <View className="mb-2 flex-row items-baseline justify-between">
        <Text className="flex-1 pr-2 text-sm font-semibold text-gray-900" numberOfLines={1}>
          {title}
        </Text>
        {min !== null && max !== null ? (
          <Text className="text-xs text-gray-500">
            min {min.toFixed(2)} {unit} · max {max.toFixed(2)} {unit}
          </Text>
        ) : (
          <Text className="text-xs text-gray-400">No data</Text>
        )}
      </View>

      <View style={{ height }}>
        {points.length > 0 ? (
          <LineChart
            data={points}
            areaChart
            curved
            color={color}
            thickness={2}
            hideDataPoints
            hideRules
            initialSpacing={0}
            xAxisLabelTexts={points.map((p) => p.label ?? "")}
            xAxisLabelsVerticalShift={6}
            xAxisLabelTextStyle={{ fontSize: 10, color: "#64748b" }}
            yAxisTextStyle={{ fontSize: 10, color: "#64748b" }}
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-gray-500">No data available.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function AISummaryCard({ timeSeries }: { timeSeries: TimeSeriesPoint[] | null }) {
  const [aiState, setAiState] = useState<AISummary>({
    loading: false,
    error: null,
    summary: null,
  });

  useEffect(() => {
    if (!timeSeries || timeSeries.length === 0) return;

    let cancelled = false;

    (async () => {
      setAiState({ loading: true, error: null, summary: null });

      try {
        // Find the data point closest to current time
        const now = new Date();
        const closest = timeSeries.reduce((prev, curr) => {
          const prevDiff = Math.abs(new Date(prev.time).getTime() - now.getTime());
          const currDiff = Math.abs(new Date(curr.time).getTime() - now.getTime());
          return currDiff < prevDiff ? curr : prev;
        });

        const currentConditions = {
          time: new Date(closest.time).toLocaleString(),
          sea_level_height_msl: closest.sea_level_height_msl,
          swell_wave_height: closest.swell_wave_height,
          swell_wave_direction: closest.swell_wave_direction,
          swell_wave_period: closest.swell_wave_period,
        };

        const prompt = `You are a marine safety advisor. Analyze the following current marine conditions and provide a brief assessment (2-3 sentences) on the safety for fishing activities. Be concise and practical.

Current Marine Conditions:
- Sea Level Height (MSL): ${currentConditions.sea_level_height_msl?.toFixed(2) ?? "N/A"} m
- Swell Wave Height: ${currentConditions.swell_wave_height?.toFixed(2) ?? "N/A"} m
- Swell Wave Direction: ${currentConditions.swell_wave_direction?.toFixed(0) ?? "N/A"}°
- Swell Wave Period: ${currentConditions.swell_wave_period?.toFixed(1) ?? "N/A"} seconds
- Time: ${currentConditions.time}

Provide a safety rating (Safe, Moderate, or Unsafe) and brief reasoning.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a marine safety expert who provides concise, actionable advice about fishing conditions based on marine data.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content?.trim();

        if (!cancelled) {
          setAiState({
            loading: false,
            error: null,
            summary: summary || "No summary available.",
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setAiState({
            loading: false,
            error: e?.message ?? "Failed to generate AI summary.",
            summary: null,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [timeSeries]);

  return (
    <View className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
      <View className="mb-3 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <Ionicons name="sparkles" size={20} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">AI Safety Assessment</Text>
          <Text className="text-xs text-gray-600">Powered by OpenAI</Text>
        </View>
      </View>

      {aiState.loading && (
        <View className="flex-row items-center py-4">
          <ActivityIndicator size="small" color="#2563eb" />
          <Text className="ml-3 text-sm text-gray-600">Analyzing conditions...</Text>
        </View>
      )}

      {aiState.error && (
        <View className="rounded-lg border border-red-200 bg-red-50 p-3">
          <Text className="text-sm font-semibold text-red-800">Analysis failed</Text>
          <Text className="mt-1 text-xs text-red-700">{aiState.error}</Text>
        </View>
      )}

      {aiState.summary && (
        <View className="rounded-lg bg-white p-3">
          <Text className="text-sm leading-relaxed text-gray-800">{aiState.summary}</Text>
        </View>
      )}

      {!aiState.loading && !aiState.error && !aiState.summary && (
        <Text className="text-sm text-gray-500">No data available for analysis.</Text>
      )}
    </View>
  );
}

export default function MarineScreen() {
  const params = useLocalSearchParams<{ lat?: string; lng?: string; name?: string }>();
  const lat = Number(params.lat);
  const lng = Number(params.lng);
  const locationName = params.name ?? "Selected location";
  const { height: windowHeight } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[] | null>(null);

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
          hourly: ["sea_level_height_msl", "swell_wave_height", "swell_wave_direction", "swell_wave_period"],
          forecast_days: 1,
        };
        const url = "https://marine-api.open-meteo.com/v1/marine";
        const responses = await fetchWeatherApi(url, openMeteoParams);
        const response = responses[0];
        if (!response) throw new Error("No response returned.");

        const utcOffsetSeconds = response.utcOffsetSeconds();
        const hourly = response.hourly();
        if (!hourly) throw new Error("No hourly data returned.");

        const timeCount = (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval();
        const time = Array.from({ length: timeCount }, (_, i) =>
          new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
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
          console.log("Open-Meteo marine hourly time series:", JSON.stringify(jsonSeries, null, 2));
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

    const toPoints = (key: keyof Omit<TimeSeriesPoint, "time">): ChartPoint[] =>
      timeSeries
        .map((p, index) => {
          const v = p[key];
          if (typeof v !== "number" || !Number.isFinite(v)) return null;
          // Label every 3rd hour for readability
          const label = index % 3 === 0 ? new Date(p.time).getHours().toString() : "";
          return { value: v, label };
        })
        .filter(Boolean) as ChartPoint[];

    return {
      sea: toPoints("sea_level_height_msl"),
      swellH: toPoints("swell_wave_height"),
      swellDir: toPoints("swell_wave_direction"),
      swellP: toPoints("swell_wave_period"),
    };
  }, [timeSeries]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <ScrollView className="flex-1">
        <View className="px-3 pb-3">
          {/* Header */}
          <View className="h-16 justify-center">
            <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
              Marine hourly
            </Text>
            <Text className="mt-0.5 text-xs text-gray-600" numberOfLines={1}>
              {locationName} · {Number.isFinite(lat) ? lat.toFixed(5) : "—"},{" "}
              {Number.isFinite(lng) ? lng.toFixed(5) : "—"}
            </Text>
          </View>

          {loading && (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator />
              <Text className="mt-3 text-sm text-gray-600">Fetching Open‑Meteo…</Text>
            </View>
          )}

          {!loading && error && (
            <View className="mt-2 rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="font-semibold text-red-800">Couldn't load marine data</Text>
              <Text className="mt-1 text-red-700">{error}</Text>
            </View>
          )}

          {!loading && !error && timeSeries && (
            <View style={{ gap: 12 }}>
              {/* AI Summary Card */}
              <AISummaryCard timeSeries={timeSeries} />

              {/* Charts Grid */}
              {graphData && (
                <>
                  <View className="flex-row" style={{ gap: 10 }}>
                    <View className="flex-1">
                      <Section
                        title="Sea level height (MSL)"
                        unit="m"
                        points={graphData.sea}
                        color="#2563eb"
                        height={160}
                      />
                    </View>
                    <View className="flex-1">
                      <Section
                        title="Swell wave height"
                        unit="m"
                        points={graphData.swellH}
                        color="#16a34a"
                        height={160}
                      />
                    </View>
                  </View>

                  <View className="flex-row" style={{ gap: 10 }}>
                    <View className="flex-1">
                      <Section
                        title="Swell wave direction"
                        unit="°"
                        points={graphData.swellDir}
                        color="#f97316"
                        height={160}
                      />
                    </View>
                    <View className="flex-1">
                      <Section
                        title="Swell wave period"
                        unit="s"
                        points={graphData.swellP}
                        color="#7c3aed"
                        height={160}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}