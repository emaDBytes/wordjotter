/**
 * SearchScreen Component
 *
 * Provides a comprehensive dictionary search interface for both English and Finnish words.
 * This screen serves as the main vocabulary lookup tool, enabling users to:
 * - Search for words in both English and Finnish languages
 * - View detailed definitions, examples, and pronunciations
 * - Save words to their personal vocabulary collection
 * - Process words that were previously captured using Quick Jot feature
 *
 * The component adapts its behavior based on the selected language:
 * - English words are looked up directly using the Free Dictionary API
 * - Finnish words open an external browser with RedFox Dictionary, then allow
 *   manual entry of definitions after lookup
 */

// React and React Native imports
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";

// UI component imports
import {
  Text,
  TextInput,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
  Snackbar,
  Card,
} from "react-native-paper";

// Service and component imports
import SpeakButton from "../components/SpeakButton";
import { markNoteProcessed, saveWord } from "../services/databaseService";
import {
  fetchWordDefinition,
  openFinnishDictionary,
} from "../services/dictionaryService";

export default function SearchScreen({ route }) {
  // Search and language state
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState("en"); // 'en' for English and 'fi' for Finnish.

  // API and loading state
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // UI feedback state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Finnish word input form state
  const [finnishWordInput, setFinnishWordInput] = useState({
    word: "",
    definition: "",
    notes: "",
  });
  const [showFinnishInput, setShowFinnishInput] = useState(false);

  // Navigation parameters - used for Quick Jot integration
  const prefilledWord = route.params?.prefilledWord || "";
  const prefilledLanguage = route.params?.prefilledLanguage || "en";
  const quickNoteId = route.params?.quickNoteId;

  /**
   * Handles initial setup when screen receives navigation parameters
   * Sets up search form with prefilled values from navigation params
   * Automatically triggers search when navigating from QuickNotesScreen
   */
  useEffect(() => {
    if (prefilledWord) {
      setSearchTerm(prefilledWord);
      setLanguage(prefilledLanguage);

      // Automatically trigger search if word is provided
      if (prefilledWord.trim()) {
        searchWord();
      }
    }
  }, [prefilledWord, prefilledLanguage]);

  /**
   * Saves an English word definition to the personal vocabulary database
   * Updates quick note processing status if applicable
   * Provides user feedback via snackbar
   *
   * @param {Object} entry - The full word entry from API results
   * @param {number} meaningIndex - Index of the selected meaning in entry.meanings array
   * @param {number} definitionIndex - Index of the selected definition in meaning.definitions array
   * @returns {Promise<void>}
   */
  const handleSaveWord = async (entry, meaningIndex, definitionIndex) => {
    const meaning = entry.meanings[meaningIndex];
    const definition = meaning.definitions[definitionIndex];

    const wordData = {
      word: entry.word,
      language,
      definition: definition.definition,
      phonetic: entry.phonetic || "",
      example: definition.example || "",
      category: meaning.partOfSpeech,
    };

    const success = await saveWord(wordData);

    // If saving was successful and we have a quickNoteId, mark it as processed
    if (success && quickNoteId) {
      await markNoteProcessed(quickNoteId);
    }

    if (success) {
      setSnackbarMessage(`"${entry.word}" is now safe and sound!`);
    } else {
      setSnackbarMessage("Uh-oh, save failed—give it another go!");
    }

    setSnackbarVisible(true);
  };

  /**
   * Saves a Finnish word with user-provided definition to the vocabulary database
   * Updates quick note processing status if applicable
   * Validates input and provides user feedback
   *
   * @returns {Promise<void>}
   */
  const handleSaveFinnishWord = async () => {
    if (!finnishWordInput.word.trim()) {
      setSnackbarMessage("Enter a word!");
      setSnackbarVisible(true);
      return;
    }

    const wordData = {
      word: finnishWordInput.word,
      language: "fi",
      definition: finnishWordInput.definition,
      phonetic: "",
      example: "",
      notes: finnishWordInput.notes,
      category: "default",
    };

    const success = await saveWord(wordData);

    // If saving was successful and we have a quickNoteId, mark it as processed
    if (success && quickNoteId) {
      await markNoteProcessed(quickNoteId);
    }

    if (success) {
      setSnackbarMessage(`"${finnishWordInput.word}" is now safe and sound!`);

      // Reset the form
      setFinnishWordInput({
        word: "",
        definition: "",
        notes: "",
      });
      setShowFinnishInput(false);
    } else {
      setSnackbarMessage("Uh-oh, save failed—give it another go!");
    }
    setSnackbarVisible(true);
  };

  /**
   * Performs dictionary lookup based on the selected language
   * Handles both direct API lookup (English) and external browser lookup (Finnish)
   * Manages loading states and error handling
   */
  const searchWord = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setShowFinnishInput(false); // Hide Finnish input form, if it was open

    try {
      const data = await fetchWordDefinition(searchTerm.trim(), language);

      // Check if there's a flag for external lookup
      if (data.type === "external" && data.language === "fi") {
        // Open Finnish dictionary in browser
        await openFinnishDictionary(searchTerm.trim());

        // After browser is closed, show the input form for Finnish word
        setFinnishWordInput({
          ...finnishWordInput,
          word: searchTerm.trim(),
        });
        setShowFinnishInput(true);
        setResults(null); // Clear any previous results
      } else {
        // Regular English dictionary results
        setResults(data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen header */}
      <Text variant="headlineMedium" style={styles.title}>
        Search Words
      </Text>

      {/* Language selection toggle */}
      <View style={styles.languageSelector}>
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

      {/* Search input field with button */}
      <View style={styles.searchContainer}>
        <TextInput
          label="Enter a word"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
          right={<TextInput.Icon icon="magnify" onPress={searchWord} />}
          onSubmitEditing={searchWord}
        />

        <Button
          mode="contained"
          onPress={searchWord}
          style={styles.button}
          disabled={isLoading || !searchTerm.trim()}
        >
          Let's dive in!
        </Button>
      </View>

      {/* Loading indicator - conditionally rendered during API requests */}
      {isLoading && (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.loader}
        />
      )}

      {/* Error message display - conditionally rendered when API errors occur */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Finnish word input form - conditionally rendered after browser lookup */}
      {showFinnishInput && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <Card style={styles.finnishInoutCard}>
                <Card.Title
                  title="Add Finnish Word"
                  subtitle="Enter details after looking it up"
                />
                <Card.Content>
                  <TextInput
                    label="Word"
                    value={finnishWordInput.word}
                    onChangeText={(text) =>
                      setFinnishWordInput({ ...finnishWordInput, word: text })
                    }
                    style={styles.finnishInput}
                  />
                  <TextInput
                    label="Definition/Meaning"
                    value={finnishWordInput.definition}
                    onChangeText={(text) =>
                      setFinnishWordInput({
                        ...finnishWordInput,
                        definition: text,
                      })
                    }
                    style={styles.finnishInput}
                    multiline
                  />
                  <TextInput
                    label="Notes (optional)"
                    value={finnishWordInput.notes}
                    onChangeText={(text) =>
                      setFinnishWordInput({ ...finnishWordInput, notes: text })
                    }
                    style={styles.finnishInput}
                    multiline
                  />
                  <Button
                    mode="contained"
                    onPress={handleSaveFinnishWord}
                    style={styles.saveButton}
                  >
                    Pidä tuon kiinni
                  </Button>
                </Card.Content>
              </Card>
              {/* Add extra padding at the bottom to ensure scrollability */}
              <View style={{ height: 150 }} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      )}

      {/* Dictionary results display - conditionally rendered for English words */}
      {results && (
        <ScrollView style={styles.resultsContainer}>
          {results.map((entry, index) => (
            <View key={index} style={styles.resultsCard}>
              {/* Word header with pronunciation button */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text variant="headlineSmall" style={styles.word}>
                  {entry.word}
                </Text>
                <SpeakButton text={entry.word} language={language} />
              </View>
              <Text variant="bodyMedium" style={styles.phonetic}>
                {entry.phonetic}
              </Text>

              {/* Word meanings section with part of speech grouping */}
              {entry.meanings.map((meaning, mIndex) => (
                <View key={mIndex} style={styles.meaningContainer}>
                  <Text variant="titleMedium" style={styles.partOfSpeech}>
                    {meaning.partOfSpeech}
                  </Text>

                  {/* Individual definitions with examples and save buttons */}
                  {meaning.definitions.map((def, dIndex) => (
                    <View key={dIndex} style={styles.definitionContainer}>
                      <Text variant="bodyMedium">
                        {dIndex + 1}. {def.definition}
                      </Text>
                      {def.example && (
                        <Text variant="bodySmall" style={styles.example}>
                          "{def.example}"
                        </Text>
                      )}

                      <Button
                        icon="bookmark-outline"
                        mode="text"
                        compact
                        onPress={() => handleSaveWord(entry, mIndex, dIndex)}
                      >
                        Lock It In
                      </Button>
                    </View>
                  ))}

                  {mIndex < entry.meanings.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Feedback snackbar for user actions */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "Close",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
    padding: 20,
    width: "100%",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  languageSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  chip: {
    marginHorizontal: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  button: {
    justifyContent: "center",
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    padding: 15,
    backgroundColor: "#ffd8d8",
    borderRadius: 5,
    marginVertical: 10,
  },
  errorText: {
    color: "#d32f2f",
    boarderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  resultsContainer: {
    flex: 1,
    width: "100%",
  },
  resultsCard: {
    backgroundColor: "#f0f0f0",
    boarderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  word: {
    fontWeight: "bold",
  },
  phonetic: {
    fontStyle: "italic",
    marginBottom: 10,
    color: "#555",
  },
  meaningContainer: {
    marginVertical: 5,
  },
  partOfSpeech: {
    fontWeight: "bold",
    color: "#620033",
    marginVertical: 5,
  },
  definitionContainer: {
    marginLeft: 10,
    marginBottom: 8,
  },
  example: {
    fontStyle: "italic",
    color: "#666",
    marginLeft: 15,
    marginTop: 3,
  },
  divider: {
    marginVertical: 10,
  },
  finnishInputCard: {
    width: "100%",
    marginBottom: 20,
    marginHorizontal: 0,
    alignSelf: "stretch",
  },
  finnishInput: {
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 10,
  },
});
