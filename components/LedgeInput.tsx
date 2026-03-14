import { forwardRef } from "react";
import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

type LedgeInputProps = TextInputProps & {
  label: string;
};

export const LedgeInput = forwardRef<TextInput, LedgeInputProps>(
  ({ label, placeholderTextColor = "#9db1cf", style, ...props }, ref) => {
    return (
      <View className="gap-1.5">
        <Text
          className="ml-1 text-xs font-semibold uppercase text-sand-200/70"
          style={styles.label}
        >
          {label}
        </Text>

        <TextInput
          ref={ref}
          className="rounded-2xl border border-white/12 bg-midnight-900/95 px-5 py-4 text-lg text-sand-100"
          placeholderTextColor={placeholderTextColor}
          style={[styles.input, styles.inputShadow, style]}
          {...props}
        />
      </View>
    );
  }
);

LedgeInput.displayName = "LedgeInput";

const styles = StyleSheet.create({
  input: {
    minHeight: 60,
  },
  inputShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.26,
    shadowRadius: 8,
  },
  label: {
    letterSpacing: 1,
  },
});