import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">WordJotter</Text>
      <Text>Vocabulary notebook</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
