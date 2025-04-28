/**
 * QuickNotesScreen Component
 *
 * Displays and manages the "Quick Jot" notes that users have captured during their vocabulary learning.
 * This screen serves as the management interface for quickly captured words, allowing users to:
 * - View all jotted words that haven't been fully processed yet
 * - Filter and search through their quick notes
 * - Process notes by looking them up in the dictionary
 * - Delete notes that are no longer needed
 * - Toggle between showing all notes or only unprocessed ones
 *
 * This component is part of the "Quick Jot" workflow that enables users to rapidly
 * capture vocabulary items they encounter for later processing.
 */

import React, { useState } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  Text,
  Card,
  Button,
  Chip,
  Divider,
  Searchbar,
  IconButton,
  Snackbar,
} from "react-native-paper";

import {
  getQuickNotes,
  deleteQuickNote,
  markNoteProcessed,
} from "../services/databaseService";

export default function QuickNotesScreen() {
  const navigation = useNavigation();

  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProcessed, setShowProcessed] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /**
   * Loads quick notes when the screen comes into focus
   * Ensures the notes list stays up-to-date when returning from other screens
   * Re-fetches notes when the showProcessed filter changes
   */
  useFocusEffect(
    React.useCallback(() => {
      loadNotes();
    }, [showProcessed])
  );

  /**
   * Fetches quick notes from the database based on current filter settings
   * Updates the notes state with the retrieved data
   * Handles loading state and potential errors during data fetching
   *
   * @returns {Promise<void>}
   */
  const loadNotes = async () => {
    setLoading(true);
    try {
      const quickNotes = await getQuickNotes(showProcessed);
      setNotes(quickNotes);
    } catch (error) {
      console.error("Error in loading notes: ", error);
      setSnackbarMessage("Couldn't load your notes. Please try again.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigates to the Search screen with the selected note's data
   * Pre-fills the search form with the note's word and language
   * Passes the note ID to allow automatic processing after lookup
   *
   * @param {Object} note - The quick note object to look up
   * @param {number} note.id - Database ID of the note
   * @param {string} note.word - The word text to search
   * @param {string} note.language - Language code of the word ("en" or "fi")
   */
  const handleLookup = (note) => {
    navigation.navigate("Search", {
      prefilledWord: note.word,
      prefilledLanguage: note.language,
      quickNoteId: note.id,
    });
  };

  /**
   * Deletes a quick note from the database
   * Provides user feedback via snackbar and refreshes the notes list
   *
   * @param {number} id - Database ID of the note to delete
   */
  const handleDelete = async (id) => {
    try {
      const success = await deleteQuickNote(id);
      if (success) {
        setSnackbarMessage("Note deleted successfully");
      } else {
        setSnackbarMessage("Failed to delete note!");
      }
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error occurred while deleting!");
      setSnackbarVisible(true);
    }
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) =>
    note.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search input for filtering notes by word text */}
      <Searchbar
        placeholder="Search notes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Filter toggle for showing all notes or only unprocessed ones */}
      <View style={styles.filterContainer}>
        <Chip
          selected={showProcessed}
          onPress={() => setShowProcessed(!showProcessed)}
          style={styles.filerChip}
        >
          {showProcessed ? "Show Unprocessed Only" : "Show All Notes"}
        </Chip>
      </View>

      {/* Empty state display when no notes match the current filters */}
      {filteredNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No quick note yet!</Text>
          <Text style={styles.hint}>
            Use the + button to jot down words on the go
          </Text>
        </View>
      ) : (
        /* List of quick notes with their details and action buttons */
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                {/* Card header with word and language indicator */}
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium">{item.word}</Text>
                  <Chip compact>
                    {item.language === "en" ? "English" : "Finnish"}
                  </Chip>
                </View>

                {/* Optional notes section - only shown if notes exist */}
                {item.notes ? (
                  <Text style={styles.notes}>{item.notes}</Text>
                ) : null}

                {/* Creation date display */}
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>

                {/* Conditional rendering based on processed status */}
                {item.processed ? (
                  <Chip icon="check" style={styles.processedChip}>
                    Processed
                  </Chip>
                ) : (
                  <View style={styles.actions}>
                    <Button
                      mode="contained"
                      onPress={() => handleLookup(item)}
                      style={styles.lookupButton}
                    >
                      Look Up Now
                    </Button>
                    <IconButton
                      icon="delete"
                      onPress={() => handleDelete(item.id)}
                    />
                  </View>
                )}
              </Card.Content>
            </Card>
          )}
          ItemSeparatorComponent={() => <Divider />}
        />
      )}

      {/* Feedback snackbar for user actions */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      ></Snackbar>
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
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  card: {
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  notes: {
    fontStyle: "italic",
    marginTop: 4,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lookupButton: {
    flex: 1,
  },
  processedChip: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f7fa",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  hint: {
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
  },
});
