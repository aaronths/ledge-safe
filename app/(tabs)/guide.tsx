import { Text, View } from "react-native";

export default function GuideScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg text-gray-900">Guide</Text>
      <Text className="mt-2 text-gray-500">Guide content goes here</Text>
    </View>
  );
}
