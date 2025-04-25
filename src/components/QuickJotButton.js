/**
 * QuickButton Component
 *
 * A floating action button that appears on all screens to provide quick access
 * to the Quick Jot feature. When user presses, it opens the Quick Jot modal.
 */

import React from "react";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

const QuickJotButton = ({ onPress }) => {
  return (
    <FAB
      style={styles.fab}
      icon="pencil-plus"
      onPress={onPress}
      color="#ffffff"
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 75, // Positioned above tab bar to prevent overlap with navigation buttons
    backgroundColor: "#6200ee",
  },
});

export default QuickJotButton;
