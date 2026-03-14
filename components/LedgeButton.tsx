import type { ReactNode } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    type PressableProps,
    type StyleProp,
    type ViewStyle,
} from "react-native";

type LedgeButtonProps = PressableProps & {
  children: ReactNode;
  variant?: "primary" | "ghost";
  style?: StyleProp<ViewStyle>;
};

export function LedgeButton({
  children,
  variant = "primary",
  style,
  ...props
}: LedgeButtonProps) {
  if (variant === "ghost") {
    return (
      <Pressable
        className="w-full py-2"
        style={({ pressed }) => [pressed ? styles.ghostPressed : undefined, style]}
        {...props}
      >
        {typeof children === "string" ? (
          <Text className="text-center text-base font-medium text-sand-200/65">
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      className="w-full rounded-2xl bg-sand-300 py-4"
      style={({ pressed }) => [
        styles.primaryShadow,
        pressed ? styles.primaryPressed : undefined,
        style,
      ]}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-center text-lg font-bold text-midnight-950">
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ghostPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  primaryPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  primaryShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});