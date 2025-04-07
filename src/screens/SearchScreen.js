import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
} from "react-native-paper";

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState("en"); // 'en' for English and 'fi' for Finnish.
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const searchWord = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      if (language === "en") {
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/${language}/${searchTerm.trim()}`
        );

        if (!response.ok) {
          throw new Error("Word not found");
        }

        const data = await response.json();
        setResults(data);
      } else {
        // I will implement finnish dict. later....
        throw new Error("P;ease wait for the Finnish dict's implementation");
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
                <View key={index} style={styles.meaningContainer}>
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
});
