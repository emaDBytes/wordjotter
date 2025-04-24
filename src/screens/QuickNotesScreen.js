/**
 * QuickNoteScreen Component
 *
 * Displays and manages notes that user has jotted down.
 * Allows filtering, searching, and processing notes by
 * looking them up in the dictionary or deleting them.
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

  // Load notes when screen comse into focus
  useFocusEffect(
    React.useCallback(() => {
      loadNotes();
    }, [showProcessed])
  );

  // load notes from database
  const loadNotes = async () => {
    setLoading(true);
    try {
      const quickNotes = await getQuickNotes(showProcessed);
      setNotes(quickNotes);
    } catch (error) {
      console.error("Error in loading notes: ", error);
      setSnackbarMessage("Couldn't load your notes. Please try agin.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to search screen with selected word
  const handleLookup = (note) => {
    navigation.navigate("Search", {
      prefilledWord: note.word,
      prefilledLanguage: note.language,
      quickNoteId: note.id,
    });
  };

  // Deleting a quick note
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
      <Searchbar
        placeholder="Search notes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filterContainer}>
        <Chip
          selected={showProcessed}
          onPress={() => setShowProcessed(!showProcessed)}
          style={styles.filerChip}
        >
          {showProcessed ? "Show Unprocessed Only" : "Show All Notes"}
        </Chip>
      </View>

      {filteredNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No quick note yet!</Text>
          <Text style={styles.hint}>
            Use the + button to jot down words on the go
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium">{item.word}</Text>
                  <Chip compact>
                    {item.language === "en" ? "English" : "Finnish"}
                  </Chip>
                </View>

                {item.notes ? (
                  <Text style={styles.notes}>{item.notes}</Text>
                ) : null}

                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>

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

      <Searchbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      ></Searchbar>
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
