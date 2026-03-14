import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { type Href, useRouter } from "expo-router";
import MapView, {
  MapType,
  type MapViewProps,
  type Region,
} from "react-native-maps";
import { auth, db } from "../../firebase/firebaseConfig";
import { pendingMapTarget } from "./locations";

const FALLBACK_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const MAP_TYPES: { label: string; value: MapType }[] = [
  { label: "Standard", value: "standard" },
  { label: "Satellite", value: "satellite" },
  { label: "Hybrid", value: "hybrid" },
];

type SearchResult = {
  name: string;
  latitude: number;
  longitude: number;
};

type SavedLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [centerCoordinates, setCenterCoordinates] = useState({
    latitude: FALLBACK_REGION.latitude,
    longitude: FALLBACK_REGION.longitude,
  });
  const [locationName, setLocationName] = useState<string>("San Francisco, CA");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [savedCoordinates, setSavedCoordinates] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [mapType, setMapType] = useState<MapType>("standard");
  const [isSaving, setIsSaving] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [marineLoading, setMarineLoading] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (results.length > 0) {
        const r = results[0];
        const parts = [
          r.district ?? r.subregion,
          r.city ?? r.region,
          r.isoCountryCode,
        ].filter(Boolean);
        setLocationName(parts.slice(0, 2).join(", ") || "Unknown location");
      }
    } catch {
      setLocationName("Unknown location");
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Use device location as initial region where possible
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setInitialRegion(FALLBACK_REGION);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const userRegion: Region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setInitialRegion(userRegion);
        setCenterCoordinates({
          latitude: userRegion.latitude,
          longitude: userRegion.longitude,
        });
        reverseGeocode(userRegion.latitude, userRegion.longitude);
      } catch {
        setInitialRegion(FALLBACK_REGION);
      }
    })();
  }, [reverseGeocode]);

  // Listen to saved locations in real time so bookmark icon stays in sync
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "savedLocations"),
      orderBy("savedAt", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setSavedLocations(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SavedLocation),
      );
    });

    return unsub;
  }, []);

  // When map tab is focused, check if Locations tab sent us a destination
  useFocusEffect(
    useCallback(() => {
      if (pendingMapTarget.pending) {
        pendingMapTarget.pending = false;
        mapRef.current?.animateToRegion(
          {
            latitude: pendingMapTarget.latitude,
            longitude: pendingMapTarget.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          },
          800,
        );
      }
    }, []),
  );

  // Check if current map center is already saved (within ~100m)
  const currentlySaved = savedLocations.find(
    (loc) =>
      Math.abs(loc.latitude - centerCoordinates.latitude) < 0.001 &&
      Math.abs(loc.longitude - centerCoordinates.longitude) < 0.001,
  );

  const handleRegionChange = useCallback(() => {
    setIsMoving(true);
  }, []);

  const handleRegionChangeComplete = useCallback<
    NonNullable<MapViewProps["onRegionChangeComplete"]>
  >(
    (newRegion) => {
      setIsMoving(false);
      setCenterCoordinates({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      geocodeTimer.current = setTimeout(() => {
        reverseGeocode(newRegion.latitude, newRegion.longitude);
      }, 600);
    },
    [reverseGeocode],
  );

  const handleToggleSave = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert(
        "Not signed in",
        "You need to be signed in to save locations.",
      );
      return;
    }

    if (currentlySaved) {
      // Unsave immediately
      setIsSaving(true);
      try {
        await deleteDoc(
          doc(db, "users", user.uid, "savedLocations", currentlySaved.id),
        );
      } catch {
        Alert.alert("Error", "Could not remove location. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Prompt user to name the spot before saving
      Alert.prompt(
        "Name this location",
        "Give this spot a name, or keep the default.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: async (customName: string | undefined) => {
              const nameToSave = customName?.trim() || locationName;
              setIsSaving(true);
              try {
                await addDoc(
                  collection(db, "users", user.uid, "savedLocations"),
                  {
                    name: nameToSave,
                    latitude: centerCoordinates.latitude,
                    longitude: centerCoordinates.longitude,
                    savedAt: serverTimestamp(),
                  },
                );
              } catch {
                Alert.alert(
                  "Error",
                  "Could not save location. Please try again.",
                );
              } finally {
                setIsSaving(false);
              }
            },
          },
        ],
        "plain-text",
        locationName, // pre-fills with the geocoded name
      );
    }
  }, [centerCoordinates, locationName, currentlySaved]);

  const handleFetchMarineWeather = useCallback(async () => {
    setMarineLoading(true);
    try {
      router.push({
        pathname: "/marine" as Href,
        params: {
          lat: String(centerCoordinates.latitude),
          lng: String(centerCoordinates.longitude),
          name: locationName,
        },
      } as Href);
    } catch (err) {
      console.error("Marine weather error:", err);
      Alert.alert("Marine Weather", "Failed to fetch marine data. Try again.");
    } finally {
      setMarineLoading(false);
    }
  }, [
    centerCoordinates.latitude,
    centerCoordinates.longitude,
    locationName,
    router,
  ]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await Location.geocodeAsync(text);
        const named: SearchResult[] = [];
        for (const r of results.slice(0, 4)) {
          const rev = await Location.reverseGeocodeAsync({
            latitude: r.latitude,
            longitude: r.longitude,
          });
          if (rev.length > 0) {
            const place = rev[0];
            const parts = [
              place.name,
              place.city ?? place.region,
              place.isoCountryCode,
            ].filter(Boolean);
            named.push({
              name: parts.join(", "),
              latitude: r.latitude,
              longitude: r.longitude,
            });
          }
        }
        setSearchResults(named);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 700);
  }, []);

  const handleSelectResult = useCallback((result: SearchResult) => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchFocused(false);
    mapRef.current?.animateToRegion(
      {
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      800,
    );
  }, []);

  return (
    <View style={styles.container}>
      {initialRegion && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          mapType={mapType}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          showsScale
          showsBuildings
          showsTraffic={false}
        />
      )}

      {/* Crosshair */}
      <View style={styles.crosshairOverlay} pointerEvents="none">
        <View style={styles.crosshair}>
          <View
            style={
              mapType === "satellite" || mapType === "hybrid"
                ? styles.crosshairLineVerticalLight
                : styles.crosshairLineVertical
            }
          />
          <View
            style={
              mapType === "satellite" || mapType === "hybrid"
                ? styles.crosshairLineHorizontalLight
                : styles.crosshairLineHorizontal
            }
          />
          <View
            style={
              mapType === "satellite" || mapType === "hybrid"
                ? styles.crosshairDotLight
                : styles.crosshairDot
            }
          />
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#d8b372" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a place..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            returnKeyType="search"
          />
          {isSearching && <ActivityIndicator size="small" color="#d8b372" />}
          {searchQuery.length > 0 && !isSearching && (
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <Ionicons name="close-circle" size={18} color="#475569" />
            </Pressable>
          )}
        </View>

        {searchFocused && searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((result, i) => (
              <Pressable
                key={i}
                style={[
                  styles.searchResultItem,
                  i < searchResults.length - 1 && styles.searchResultBorder,
                ]}
                onPress={() => handleSelectResult(result)}
              >
                <Ionicons name="location-outline" size={15} color="#d8b372" />
                <Text style={styles.searchResultText} numberOfLines={1}>
                  {result.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Map type toggle */}
      <View style={styles.mapTypeContainer}>
        {MAP_TYPES.map((type) => (
          <Pressable
            key={type.value}
            onPress={() => setMapType(type.value)}
            style={[
              styles.mapTypeBtn,
              mapType === type.value && styles.mapTypeBtnActive,
            ]}
          >
            <Text
              style={[
                styles.mapTypeBtnText,
                mapType === type.value && styles.mapTypeBtnTextActive,
              ]}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#d8b372" />
          <View style={{ flex: 1 }}>
            {isGeocoding ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <ActivityIndicator size="small" color="#d8b372" />
                <Text style={styles.locationNameLoading}>
                  Finding location...
                </Text>
              </View>
            ) : (
              <Text style={styles.locationName} numberOfLines={1}>
                {locationName}
              </Text>
            )}
            <Text style={styles.coordinates}>
              {centerCoordinates.latitude.toFixed(5)},{" "}
              {centerCoordinates.longitude.toFixed(5)}
            </Text>
          </View>

          {/* Bookmark toggle button */}
          <Pressable
            onPress={handleToggleSave}
            disabled={isSaving || isGeocoding}
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.saveBtnPressed,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#d8b372" />
            ) : (
              <Ionicons
                name={currentlySaved ? "bookmark" : "bookmark-outline"}
                size={22}
                color="#d8b372"
              />
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={handleFetchMarineWeather}
          disabled={marineLoading}
          style={styles.marineButton}
        >
          {marineLoading ? (
            <ActivityIndicator size="small" color="#0f1f3d" />
          ) : (
            <Text style={styles.marineButtonText}>See Safety Information</Text>
          )}
        </Pressable>

        {savedCoordinates && (
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#d8b372" />
            <Text style={styles.savedText}>
              Analysis saved · {savedCoordinates.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, width: "100%" },

  crosshairOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshair: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairMoving: { transform: [{ translateY: -6 }] },
  crosshairLineVertical: {
    position: "absolute",
    width: 2,
    height: 32,
    backgroundColor: "#0f1f3d",
    borderRadius: 1,
    opacity: 0.9,
  },
  crosshairLineHorizontal: {
    position: "absolute",
    width: 32,
    height: 2,
    backgroundColor: "#0f1f3d",
    borderRadius: 1,
    opacity: 0.9,
  },
  crosshairDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0f1f3d",
  },
  crosshairShadow: {
    width: 12,
    height: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginTop: 4,
  },
  crosshairLineVerticalLight: {
    position: "absolute",
    width: 2,
    height: 32,
    backgroundColor: "#d8b372",
    borderRadius: 1,
    opacity: 0.9,
  },
  crosshairLineHorizontalLight: {
    position: "absolute",
    width: 32,
    height: 2,
    backgroundColor: "#d8b372",
    borderRadius: 1,
    opacity: 0.9,
  },
  crosshairDotLight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d8b372",
  },
  searchContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f1f3d",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#d8b37240",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 15,
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
    marginTop: 0,
  },
  searchResults: {
    backgroundColor: "#0f1f3d",
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: "#d8b37240",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  searchResultBorder: { borderBottomWidth: 1, borderBottomColor: "#1e3a5f" },
  searchResultText: { color: "#e2e8f0", fontSize: 14, flex: 1 },

  mapTypeContainer: {
    position: "absolute",
    top: 76,
    right: 16,
    flexDirection: "column",
    gap: 4,
    zIndex: 9,
  },
  mapTypeBtn: {
    backgroundColor: "#0f1f3d",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1e3a5f",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  mapTypeBtnActive: { backgroundColor: "#d8b372", borderColor: "#d8b372" },
  mapTypeBtnText: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  mapTypeBtnTextActive: { color: "#0f1f3d" },

  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f1f3d",
    borderTopColor: "#1e3a5f",
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 10,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  locationName: { color: "#e2e8f0", fontSize: 16, fontWeight: "600" },
  locationNameLoading: { color: "#64748b", fontSize: 14 },
  coordinates: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1e3a5f",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d8b37240",
  },
  saveBtnPressed: { opacity: 0.6 },
  marineButton: {
    backgroundColor: "#d8b372",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d8b37240",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  marineButtonText: { color: "#1e3a5f", fontSize: 16, fontWeight: "900" },
  button: {
    backgroundColor: "#d8b372",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 2,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: {
    color: "#0f1f3d",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
  savedBadge: {
    backgroundColor: "#1e3a5f",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  savedText: { color: "#d8b372", fontSize: 12 },
});
