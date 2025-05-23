/**
 * QuickJotModal Component
 *
 * A modal dialog that allows user to quickly enter a word, its language,
 * and optional notes. This is designed for rapid capture of vocabulary items
 * encountered during conversations or reading.
 */

// React and React Native imports
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

// UI component imports
import {
  Modal,
  Portal,
  TextInput,
  Button,
  Text,
  Chip,
} from "react-native-paper";

const QuickJotModal = ({ visible, onDismiss, onSave }) => {
  // Form state management
  const [word, setWord] = useState(""); // Stores the word text input
  const [notes, setNotes] = useState(""); // Stores optional context notes
  const [language, setLanguage] = useState("en"); // Tracks selected language (en/fi)

  /**
   * Validates and processes the form submission
   * Calls the parent component's save handler with form data
   * Resets form fields after successful submission
   */
  const handleSave = () => {
    if (word.trim()) {
      onSave({ word: word.trim(), language, notes });

      // Reset form after saving
      setWord("");
      setNotes("");
      setLanguage("en");
      onDismiss();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        {/* Modal title */}
        <Text variant="titleLarge" style={styles.title}>
          Quick Jot
        </Text>

        {/* Word input field */}
        <TextInput
          label="Word"
          value={word}
          onChangeText={setWord}
          autoFocus
          style={styles.input}
        />

        {/* Optional notes field */}
        <TextInput
          label="Context Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={styles.input}
        />

        {/* Language selection */}
        <View style={styles.languageSelector}>
          {/* Language toggle chips */}
          <Chip
            selected={language === "en"}
            onPress={() => setLanguage("en")}
            style={styles.chip}
          >
            English
          </Chip>
          <Chip
            selected={language === "fi"}
            onPress={() => setLanguage("fi")}
            style={styles.chip}
          >
            Finnish
          </Chip>
        </View>

        {/* Action buttons */}
        <View style={styles.buttons}>
          {/* Cancel and save buttons */}
          <Button onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!word.trim()} // Disable button when word field is empty
            style={styles.button}
          >
            Snag it for Later
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  languageSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  chip: {
    marginHorizontal: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default QuickJotModal;
