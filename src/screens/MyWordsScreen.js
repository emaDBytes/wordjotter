import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function MyWordsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">My Words</Text>
      <Text>saves ocabulary</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    padding: 20,
  },
});
