/**
 * MyWordsScreen Component
 *
 * Displays and manages the user's saved vocabulary collection. This screen serves
 * as the central vocabulary management interface, allowing users to:
 * - View all saved words with their definitions and metadata
 * - Filter words by category using horizontal chip navigation
 * - Search within their vocabulary collection
 * - Delete words they no longer wish to review
 * - Access pronunciation through the integrated speech synthesis
 *
 * The component connects directly to the database service to retrieve and
 * manipulate the user's personal vocabulary collection, and automatically
 * refreshes when the screen comes into focus using React Navigation's hooks.
 *
 * This screen represents the "collection" aspect of the vocabulary learning
 * workflow, complementing the discovery (SearchScreen) and practice (FlashcardScreen)
 * components of the application.
 */

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
import SpeakButton from "../components/SpeakButton";

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

  // Apply filters based on search query and selected category
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
      <Searchbar
        placeholder="Search words..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
        icon="magnify" // Explicitly set the search icon
        clearButtonMode="while-editing" // Let the system handle the clear button
        onClear={() => {
          setSearchQuery("");
          onChangeSearch(""); // Ensure filters are updated
        }}
      />

      {categories.length > 0 && (
        <View style={styles.chipContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
            bounces={false}
          >
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => handleCategorySelect(category)}
                style={styles.categoryChip}
                mode="outlined"
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </View>
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
                Show All My Loot
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
                  <View style={{ flexDirection: "row" }}>
                    <SpeakButton text={word.word} language={word.language} />
                    <IconButton
                      {...props}
                      icon="delete"
                      onPress={() => handleDeleteWord(word.id)}
                    />
                  </View>
                )}
              />
              <Card.Content>
                <Text variant="bodyMedium">{word.definition}</Text>
                {word.phonetic && (
                  <Text variant="bodySmall" style={styles.phonetic}>
                    {word.phonetic}
                  </Text>
                )}
                {word.notes && (
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
    backgroundColor: "#f8f8f8",
  },
  searchbar: {
    marginBottom: 16,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: 16,
    maxHeight: "100%",
  },
  categoriesContent: {
    paddingRight: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  wordsContainer: {
    flex: 1,
  },
  wordCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
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
