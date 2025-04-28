/**
 * FlashcardScreen Component
 *
 * Implements interactive flashcard functionality for vocabulary learning using
 * a spaced repetition algorithm. User can flip cards to see word definitions,
 * navigate between cards, and mark words as known or needing practice.
 */

// React and React Native imports
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Animated, TouchableOpacity } from "react-native";

// React and React Native imports
import { Text, Button, Snackbar } from "react-native-paper";

// Custom component imports
import SpeakButton from "../components/SpeakButton";

// Service imports
import {
  getWordsForReview,
  updateWordAfterReview,
} from "../services/learningService";

/**
 * FlashcardScreen displays interactive flashcards for vocabulary learning
 * with spaced repetition support
 *
 * @returns {React.Component} Flashcard learning interface
 */
export default function FlashcardScreen() {
  // Flashcard data state
  const [cards, setCards] = useState([]); // Array of vocabulary cards for review
  const [currentIndex, setCurrentIndex] = useState(0); // Index of current card being shown

  // Card flip animation state
  const [isFlipped, setIsFlipped] = useState(false); // Track if card is showing front or back
  const [flipAnim] = useState(new Animated.Value(0)); // Animation value for card flip

  // Feedback notification state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Load cards for review when component mounts
  useEffect(() => {
    loadCards();
  }, []);

  /**
   * Loads words due for review and shuffles them for practice
   * Implements Fisher-Yates shuffle algorithm for randomized presentation
   */
  const loadCards = async () => {
    try {
      const words = await getWordsForReview();

      if (words && words.length > 0) {
        // Create a copy of the array
        const shuffled = [...words];

        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
          // Generate random index from 0 to i
          let j = Math.floor(Math.random() * (i + 1));

          // Swap elements at i and j
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setCurrentIndex(0); // Reset to the first card when loading new cards
        setCards(shuffled);
      } else {
        setCards([]);
      }
    } catch (error) {
      console.error("Error loading cards: ", error);
      setCards([]);
    }
  };

  /**
   * Handles card flip animation
   * Toggles between front (word) and back (definition) of flashcard
   */
  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Navigates to the next card in the deck
   * Ensures card is face-down before proceeding
   */
  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      // Make sure card is faced down before moving to next
      if (isFlipped) {
        flipCard();
      }

      // Slight delay to ensure animation completes
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 100);
    }
  };

  /**
   * Navigates to the previous card in the deck
   */
  const prevCard = () => {
    if (currentIndex > 0) {
      // Make sure card os face down before moving to previous
      if (isFlipped) {
        flipCard();
      }

      // Slight delay to ensure animation completes
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
      }, 100);
    }
  };

  // Interpolate rotation values for the flip animation
  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["180deg", "360deg"],
        }),
      },
    ],
  };

  // Empty state when no cards are available
  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWordsText}>
          You haven't saved any words yet. Add some words to start the flashcard
          practice!
        </Text>
        <Button mode="contained" onPress={loadCards} style={styles.button}>
          Refresh
        </Button>
      </View>
    );
  }

  // Safety check for invalid index
  if (currentIndex >= cards.length || !cards[currentIndex]) {
    // Reset to the first card if the current index is invalid
    return (
      <View style={styles.container}>
        <Text>Loading cards...</Text>
      </View>
    );
  }

  const currentCard = cards[currentIndex];

  /**
   * Updates word's learning progress when marked as known
   * Advances to next learning level and updates next review date
   */
  const handleKnownWord = async () => {
    try {
      if (cards.length > 0 && currentIndex < cards.length) {
        const currentWord = cards[currentIndex];
        await updateWordAfterReview(currentWord.id, true);

        // Show feedback
        setSnackbarMessage(`Sweet! "${currentWord.word}" leveled up!`);
        setSnackbarVisible(true);

        // Move to next card
        nextCard();
      }
    } catch (error) {
      console.error("Error in handling known words: ", error);
    }
  };

  /**
   * Updates word's learning progress when marked as needing practice
   * Resets to initial learning level for reinforced practice
   */
  const handleNeedsPractice = async () => {
    try {
      if (cards.length > 0 && currentIndex < cards.length) {
        const currentWord = cards[currentIndex];
        await updateWordAfterReview(currentWord.id, false);

        // Show feedback
        setSnackbarMessage(
          `"${currentWord.word}" will bounce back for another round!`
        );
        setSnackbarVisible(true);

        // Move to next card
        nextCard();
      }
    } catch (error) {
      console.error("Problem in evaluating need to practice: ", error);
    }
  };

  /**
   * Formats the next review date into a user-friendly string
   *
   * @param {string} dateString - ISO date string from database
   * @returns {string} Human-readable date representation ("Today", "Tomorrow", or formatted date)
   */
  const formatNextReviewDate = (dateString) => {
    try {
      if (!dateString) {
        return "Not Scheduled";
      }

      const date = new Date(dateString);
      const today = new Date();

      // Check if next review is today
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }

      // Check if next review is tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      }

      // Otherwise format as MM/DD/YYYY
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Error in showing next review: ", error);
    }
  };

  /**
   * Converts numerical learning level to descriptive text
   *
   * @param {number} level - Learning level (0-5)
   * @returns {string} Human-readable description of learning level
   */
  const getLearningLevelText = (level) => {
    try {
      if (level === undefined || level === null) {
        return "New word";
      }

      const levels = [
        "Just started",
        "Learning",
        "Familiar",
        "Almost known",
        "Well known",
        "Mastered",
      ];

      return levels[Math.min(level, levels.length - 1)];
    } catch (error) {
      console.log("Error in verbalizing the learning level: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.flashcardContainer}>
        {/* Front side of flashcard */}
        <Animated.View
          style={[
            styles.card,
            frontAnimatedStyle,
            { opacity: isFlipped ? 0 : 1 },
          ]}
        >
          <TouchableOpacity onPress={flipCard} style={styles.cardTouchable}>
            <Text style={styles.cardTitle}>{currentCard.word}</Text>
            <View style={styles.cardMetadata}>
              <Text>
                {currentCard.language === "en" ? "English" : "Finnish"}
              </Text>
              <SpeakButton
                text={currentCard.word}
                language={currentCard.language}
              />
            </View>

            <View style={styles.learningStatus}>
              <Text style={styles.learningStatusText}>
                {getLearningLevelText(currentCard.learning_level)}
              </Text>
              <Text style={styles.nextReviewText}>
                Next review:{" "}
                {formatNextReviewDate(currentCard.next_review_date)}
              </Text>
            </View>

            <Text style={styles.cardInstructions}>
              Tap to see the definition
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Back side of flashcard */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            { opacity: isFlipped ? 1 : 0 },
          ]}
        >
          <TouchableOpacity onPress={flipCard} style={styles.cardTouchable}>
            <Text style={styles.definitionText}>{currentCard.definition}</Text>
            {currentCard.example && (
              <Text style={styles.exampleText}>"{currentCard.example}"</Text>
            )}
            <Text style={styles.cardInstructions}>Tab to see the word</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Navigation controls */}
      <View style={styles.controls}>
        <Button
          mode="outlined"
          onPress={prevCard}
          disabled={currentIndex === 0}
          style={styles.navButton}
        >
          Previous
        </Button>
        <Text style={styles.counter}>
          {currentIndex + 1} / {cards.length}
        </Text>
        <Button
          mode="outlined"
          onPress={nextCard}
          disabled={currentIndex === cards.length - 1}
          style={styles.navButton}
        >
          Next
        </Button>
      </View>

      {/* Learning progress controls */}
      <View style={styles.reviewControls}>
        <Button
          mode="contained"
          onPress={handleNeedsPractice}
          style={styles.needPracticeButton}
          icon="brain"
        >
          Still Tricky
        </Button>
        <Button
          mode="contained"
          onPress={handleKnownWord}
          style={styles.knownButton}
          icon="check-circle"
        >
          Nailed It!
        </Button>
      </View>

      <Button mode="contained" onPress={loadCards} style={styles.shuffleButton}>
        Shuffle Cards
      </Button>

      {/* Feedback snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
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
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  flashcardContainer: {
    width: "100%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  card: {
    width: "90%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    position: "absolute",
    backfaceVisibility: "hidden",
  },
  cardBack: {
    backgroundColor: "#f0f0ff",
  },
  cardTouchable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  cardMetadata: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  definitionText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 15,
  },
  exampleText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#555",
    marginBottom: 15,
  },
  cardInstructions: {
    position: "absolute",
    bottom: 15,
    color: "#888",
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  navButton: {
    width: 100,
  },
  counter: {
    fontSize: 16,
  },
  shuffleButton: {
    marginTop: 10,
  },
  noWordsText: {
    textAlign: "center",
    marginBottom: 20,
    padding: 20,
  },
  button: {
    marginTop: 10,
  },
  reviewControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  needPracticeButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#ff6b6b",
  },
  knownButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#51cf66",
  },
  learningStatus: {
    marginTop: 15,
    alignItems: "center",
  },
  learningStatusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200ee",
  },
  nextReviewText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  snackbar: {
    bottom: 20,
  },
});
