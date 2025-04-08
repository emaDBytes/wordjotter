import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import {
  Text,
  Card,
  IconButton,
  Button,
  Chip,
  Searchbar,
  Divider,
} from "react-native-paper";

import { getSavedWords, deleteWord } from "../services/databaseService";

export default function MyWordsScreen() {
  const [savedWords, setSavedWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  const loadSavedWords = async () => {
    setLoading(true);
    const words = await getSavedWords();
    setSavedWords(words);

    // Extract unique categories
    const uniqueCategories = [...new Set(words.map((word) => word.category))];
    setCategories(uniqueCategories);

    applyFilters(words, searchQuery, selectedCategory);
    setLoading(false);
  };

  // Apply filters based on search query and selected vategory
  const applyFilters = (words, query, category) => {
    let filtered = words;

    if (query) {
      filtered = filtered.filter((word) =>
        word.word.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((word) => word.category === category);
    }

    setFilteredWords(filtered);
  };

  // Handle search query changes
  const onChangeSearch = (query) => {
    setSearchQuery(query);
    applyFilters(savedWords, query, selectedCategory);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    const newSelection = selectedCategory === category ? null : category;
    setSelectedCategory(newSelection);
    applyFilters(savedWords, searchQuery, newSelection);
  };

  // Handle word deletion
  const handleDeleteWord = async (id) => {
    const success = await deleteWord(id);
    if (success) {
      loadSavedWords();
    }
  };

  // Load words when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedWords();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        My Words
      </Text>

      <Searchbar
        placeholder="Seek Wordy Treasures"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => handleCategorySelect(category)}
              style={styles.categoryChip}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadSavedWords} />
        }
        style={styles.wordsContainer}
      >
        {filteredWords.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No Wordy Treasures Unearthed!
            </Text>
            {(searchQuery || selectedCategory) && (
              <Button
                mode="outlined"
                onPress={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setFilteredWords(savedWords);
                }}
              >
                Clear filters
              </Button>
            )}
          </View>
        ) : (
          filteredWords.map((word) => (
            <Card key={word.id} style={styles.wordCard}>
              <Card.Title
                title={word.word}
                subtitle={`${
                  word.language === "en" ? "English" : "Finnish"
                } . ${word.category}`}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="delete"
                    onPress={() => handleDeleteWord(word.id)}
                  />
                )}
              />
              <Card.Content>
                <Text variant="bodyMedium">{word.definition}</Text>
                {word.phonetic && (
                  <Text variant="bodySmall" style={styles.phonetic}>
                    {word.phonetic}
                  </Text>
                )}
                {word.example && (
                  <>
                    <Divider style={styles.divider} />
                    <Text>Notes: {word.notes}</Text>
                  </>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  wordsContainer: {
    flex: 1,
  },
  wordCard: {
    marginBottom: 12,
  },
  phonetic: {
    fontStyle: "italic",
    marginTop: 4,
    color: "#555",
  },
  example: {
    fontStyle: "italic",
    marginTop: 8,
    color: "#666",
  },
  notes: {
    marginTop: 4,
    color: "#666",
  },
  divider: {
    marginVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    marginBottom: 16,
    color: "#666",
  },
});
