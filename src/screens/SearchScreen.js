import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
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

import {
  fetchWordDefinition,
  openFinnishDictionary,
} from "../services/dictionaryService";
import { saveWord } from "../services/databaseService";

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState("en"); // 'en' for English and 'fi' for Finnish.
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [finnishWordInput, setFinnishWordInput] = useState({
    word: "",
    definition: "",
    notes: "",
  });
  const [showFinnishInput, setShowFinnishInput] = useState(false);

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

    if (success) {
      setSnackbarMessage(`"${entry.word}" is now safe and sound!`);
    } else {
      setSnackbarMessage("Uh-oh, save failed—give it another go!");
    }

    setSnackbarVisible(true);
  };

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

  const searchWord = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setShowFinnishInput(false); // Hide Finnish input form, if it was open

    try {
      const data = await fetchWordDefinition(searchTerm.trim(), language);

      // Checl if there;s a flag for external lookup
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
      <Text variant="headlineMedium" style={styles.title}>
        Search Words
      </Text>

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

      {isLoading && (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.loader}
        />
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Finnish word's input form */}
      {showFinnishInput && (
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
                setFinnishWordInput({ ...finnishWordInput, definition: text })
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
      )}

      {results && (
        <ScrollView style={styles.resultsContainer}>
          {results.map((entry, index) => (
            <View key={index} style={styles.resultsCard}>
              <Text variant="headlineSmall" style={styles.word}>
                {entry.word}
              </Text>
              <Text variant="bodyMedium" style={styles.phonetic}>
                {entry.phonetic}
              </Text>

              {entry.meanings.map((meaning, mIndex) => (
                <View key={mIndex} style={styles.meaningContainer}>
                  <Text variant="titleMedium" style={styles.partOfSpeech}>
                    {meaning.partOfSpeech}
                  </Text>

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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
  },
  finnishInput: {
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 10,
  },
});
