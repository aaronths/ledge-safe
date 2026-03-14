import { useCallback, useState } from "react";
import MapView, {
  type Region,
  type MapViewProps,
} from "react-native-maps";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";

const INITIAL_REGION: Region = {
  latitude: -34.025476,
  longitude: 151.149311,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
      const [loading, setLoading] = useState(false);
    const [showStatsPage, setShowStatsPage] = useState(false);
    const [scores, setScores] = useState<{interval_start: string, interval_end: string, score: number, interval_label: string}[]>([]);
  const [centerCoordinates, setCenterCoordinates] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude,
  });
  const [savedCoordinates, setSavedCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleRegionChangeComplete = useCallback<NonNullable<MapViewProps["onRegionChangeComplete"]>>(
    (newRegion) => {
      setCenterCoordinates({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });

      fetch('http://localhost:5001/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        
      })
      .catch(err => {
        console.error('Error fetching weather:', err);
      });
    },
    []
  );

  const handleCalculateSafety = useCallback(() => {
    setSavedCoordinates({
      latitude: centerCoordinates.latitude,
      longitude: centerCoordinates.longitude,
    });
    setLoading(true);
    fetch('http://localhost:5001/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: centerCoordinates.latitude,
        longitude: centerCoordinates.longitude,
      }),
    })
      .then(res => res.json())
      .then(data => {
        const scoreList = Array.isArray(data) ? data : data.scores;
        const formattedScores = (scoreList || []).map((s: any) => {
          const start = new Date(s.interval_start);
          const end = new Date(s.interval_end);
          const formatHour = (d: any) => {
            let h = d.getUTCHours();
            let ampm = h < 12 ? 'am' : 'pm';
            let hour = h % 12;
            if (hour === 0) hour = 12;
            return `${hour}${ampm}`;
          };
          return {
            ...s,
            interval_label: `${formatHour(start)}-${formatHour(end)}`,
          };
        });
        setScores(formattedScores);
        setShowStatsPage(true);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error('Error fetching scores:', err);
      });
  }, [centerCoordinates.latitude, centerCoordinates.longitude]);

  return (
    loading && (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingBox}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Loading...</Text>
        </View>
      </View>
    )
    ||
    (showStatsPage ? (
      <View style={styles.statsPageContainer}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Safety Scores by Interval</Text>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {scores.length === 0 ? (
              <Text>No scores available.</Text>
            ) : (
              scores.map((score, idx) => (
                <View key={idx} style={{ marginBottom: 12, padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6' }}>
                  <Text style={{ fontWeight: 'bold' }}>Interval: {score.interval_label}</Text>
                  <Text>Score: {score.score.toFixed(2)}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
        <Pressable
          onPress={() => setShowStatsPage(false)}
          style={{ marginTop: 16, backgroundColor: '#2563eb', borderRadius: 8, padding: 16 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Go Back</Text>
        </Pressable>
      </View>
    ) : (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={{
            latitude: centerCoordinates.latitude,
            longitude: centerCoordinates.longitude,
            latitudeDelta: INITIAL_REGION.latitudeDelta,
            longitudeDelta: INITIAL_REGION.longitudeDelta,
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton
        />

        <View style={styles.crosshairOverlay} pointerEvents="none">
          <View style={styles.crosshair}>
            <View style={styles.crosshairLineVertical} />
            <View style={styles.crosshairLineHorizontal} />
          </View>
        </View>

        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 pb-6 pt-4">
          <Pressable
            onPress={handleCalculateSafety}
            className="rounded-xl bg-blue-600 py-3.5 active:opacity-90"
          >
            <Text className="text-center text-base font-semibold text-white">
              Calculate safety for this location
            </Text>
          </Pressable>
          {savedCoordinates && (
            <Text className="mt-3 text-center text-sm text-gray-500">
              Saved: {savedCoordinates.latitude.toFixed(6)},{" "}
              {savedCoordinates.longitude.toFixed(6)}
            </Text>
          )}
        </View>
      </View>
    ))
  )
}

const styles = StyleSheet.create({
        loadingOverlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 20,
        },
        loadingBox: {
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 32,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
        },
      statsPageContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 24,
        paddingTop: 48,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
      },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      minWidth: 300,
      maxWidth: '90%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  crosshairOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshair: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairLineVertical: {
    position: "absolute",
    width: 2,
    height: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 1,
  },
  crosshairLineHorizontal: {
    position: "absolute",
    width: 24,
    height: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 1,
  },
});
