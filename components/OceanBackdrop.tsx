import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export function OceanBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#020611", "#06132d", "#0c2150", "#183a73"]}
        end={{ x: 0.5, y: 0 }}
        locations={[0, 0.3, 0.68, 1]}
        start={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          "rgba(3, 7, 18, 0.08)",
          "rgba(7, 17, 38, 0.03)",
          "rgba(28, 58, 115, 0.18)",
        ]}
        end={{ x: 0.95, y: 0.9 }}
        locations={[0, 0.45, 1]}
        start={{ x: 0.05, y: 0.1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.swirl, styles.swirlOne]} />
      <View style={[styles.swirl, styles.swirlTwo]} />
      <View style={[styles.swirl, styles.swirlThree]} />
      <View style={[styles.swirl, styles.swirlFour]} />
      <View style={[styles.swirl, styles.swirlFive]} />
    </View>
  );
}

const styles = StyleSheet.create({
  swirl: {
    backgroundColor: "transparent",
    borderColor: "rgba(216, 179, 114, 0.22)",
    borderRadius: 9999,
    borderWidth: 1,
    position: "absolute",
  },
  swirlOne: {
    borderBottomColor: "rgba(216, 179, 114, 0.06)",
    borderRightColor: "transparent",
    height: 310,
    left: -230,
    top: 36,
    transform: [{ rotate: "-10deg" }],
    width: 520,
  },
  swirlTwo: {
    borderBottomColor: "rgba(216, 179, 114, 0.08)",
    borderLeftColor: "transparent",
    height: 360,
    left: -170,
    opacity: 0.85,
    top: 132,
    transform: [{ rotate: "-5deg" }],
    width: 560,
  },
  swirlThree: {
    borderRightColor: "transparent",
    borderTopColor: "rgba(216, 179, 114, 0.28)",
    height: 410,
    left: -215,
    opacity: 0.7,
    top: 252,
    transform: [{ rotate: "-3deg" }],
    width: 620,
  },
  swirlFour: {
    borderLeftColor: "transparent",
    borderTopColor: "rgba(216, 179, 114, 0.24)",
    height: 350,
    left: -145,
    opacity: 0.55,
    top: 382,
    transform: [{ rotate: "-2deg" }],
    width: 540,
  },
  swirlFive: {
    borderRightColor: "transparent",
    borderTopColor: "rgba(216, 179, 114, 0.2)",
    height: 430,
    left: -260,
    opacity: 0.45,
    top: 496,
    transform: [{ rotate: "-4deg" }],
    width: 660,
  },
});