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
} from "react-native";

const INITIAL_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
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
    },
    []
  );

  const handleCalculateSafety = useCallback(() => {
    setSavedCoordinates({
      latitude: centerCoordinates.latitude,
      longitude: centerCoordinates.longitude,
    });
  }, [centerCoordinates.latitude, centerCoordinates.longitude]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
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
  );
}

const styles = StyleSheet.create({
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
