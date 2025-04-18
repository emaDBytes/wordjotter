import React, { useState, useEffect } from "react";
import { StyleSheet, View, Animated, TouchableOpacity } from "react-native";
import { Text, Card, Button, IconButton } from "react-native-paper";

import { getSavedWords } from "../services/databaseService";
import SpeakButton from "../components/SpeakButton";

export default function FlashcardScreen() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const words = await getSavedWords();

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
      console.error("Error loasing cards: ", error);
      setCards([]);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

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

  const prevCard = () => {
    if (currentIndex > 0) {
      // make sure card os face down before moving to previous
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

  if (currentIndex >= cards.length || !cards[currentIndex]) {
    // Reset to the first card if the current index is invalid
    return (
      <View style={styles.container}>
        <Text>Loading cards...</Text>
      </View>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.flashcardContainer}>
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
            <Text style={styles.cardInstructions}>
              Tap to see the definition
            </Text>
          </TouchableOpacity>
        </Animated.View>

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

      <Button mode="contained" onPress={loadCards} style={styles.shuffleButton}>
        Shuffle Cards
      </Button>
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
});
