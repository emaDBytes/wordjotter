/**
 * HomeScreen Component
 *
 * The main dashboard of the application that displays vocabulary statistics,
 * learning progress, recently saved words, and educational tips. Serves as
 * the central hub for users to monitor their learning progress and access
 * primary app functions.
 */

import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Card, Button, List, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import { getSavedWords, getLearningStats } from "../services/databaseService";

/**
 * HomeScreen displays vocabulary statistics, learning progress, and access
 * to key app features
 *
 * @returns {React.Component} Dashboard interface with statistics and navigation options
 */
export default function HomeScreen() {
  const navigation = useNavigation();
  const [recentWords, setRecentWords] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    english: 0,
    finnish: 0,
  });

  /**
   * Load user data on component mount
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Fetches saved words and learning statistics from the database
   * and updates component state
   *
   * @returns {Promise<void>}
   */
  const loadData = async () => {
    try {
      const words = await getSavedWords();

      // Get 5 most recent words
      setRecentWords(words.slice(0, 5));

      // Get learning statistics for progress display
      const learningStats = await getLearningStats();
      console.log("Learning stats: ", learningStats);

      // Update statistics state with calculated values
      setStats({
        total: words.length,
        english: words.filter((word) => word.language === "en").length,
        finnish: words.filter((word) => word.language === "fi").length,
        knownWords: learningStats.knownWords,
        needPractice: learningStats.needPractice,
        learningLevels: learningStats.learningLevels,
      });
    } catch (error) {
      console.error("Error in loading data: ", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          WordJotter
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          Your Epic Bilingual Word Vault
        </Text>
      </View>

      {/* Language Statistics Card */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium">You Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="displaySmall">{stats.english}</Text>
              <Text variant="bodySmall">English</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="displaySmall">{stats.finnish}</Text>
              <Text variant="bodySmall">Finnish</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Learning Progress Card */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <Text variant="titleMedium">Learning Progress</Text>

          <View style={styles.progressContainer}>
            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `S{stats.total > 0 ? (stats.knownWords / stats.total) * 100 : 0}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text variant="titleLarge">{stats.needPractice}</Text>
                <Text variant="bodySmall">Need Practice</Text>
              </View>
            </View>

            {stats.total > 0 ? (
              <Text style={styles.progressText}>
                Ypu've mastered{" "}
                {Math.round((stats.knownWords / stats.total) * 100)}% of your
                vocabulary!
              </Text>
            ) : (
              <Text style={styles.progressText}>
                Start adding words to track your learning progress
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions Section */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          icon="magnify"
          style={styles.actionButton}
          onPress={() => navigation.navigate("Search")}
        >
          Hunt Words
        </Button>
        <Button
          mode="outlined"
          icon="book"
          style={styles.actionButton}
          onPress={() => navigation.navigate("My Words")}
        >
          Saved Gems
        </Button>
      </View>

      {/* Recently Added Words Card */}
      <Card style={styles.recentCard}>
        <Card.Content>
          <Text variant="titleMedium">Freshly Snagged Words</Text>
          {recentWords.length === 0 ? (
            <Text style={styles.emptyText}>
              No treasures yet—go hunt some words!
            </Text>
          ) : (
            <List.Section>
              {recentWords.map((word, index) => (
                <React.Fragment key={word.id}>
                  <List.Item
                    title={word.word}
                    description={word.definition}
                    left={(props) => (
                      <Text {...props} style={styles.languageTag}>
                        {word.language === "en" ? "EN" : "FI"}
                      </Text>
                    )}
                  />
                  {index < recentWords.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List.Section>
          )}
        </Card.Content>
        {recentWords.length > 0 && (
          <Card.Actions>
            <Button onPress={() => navigation.navigate("My Words")}>
              See the Full Stash
            </Button>
          </Card.Actions>
        )}
      </Card>

      {/* Learning Tips Card */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Text variant="titleMedium">Word Wizardry Hacks</Text>
          <List.Section>
            <List.Item
              title="Regular Review"
              description="Spend a few minutes every day reviewing your saved words"
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
            />
            <Divider />
            <List.Item
              title="Context is Key"
              description="Try to use new words in sentences to remember them better"
              left={(props) => <List.Icon {...props} icon="text-box-outline" />}
            />
            <Divider />
            <List.Item
              title="Categorize Words"
              description="Group related words together to build vocabulary efficiently"
              left={(props) => <List.Icon {...props} icon="tag-outline" />}
            />
          </List.Section>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontWeight: "bold",
    color: "#6200ee",
  },
  subtitle: {
    color: "#666",
  },
  statsCard: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  recentCard: {
    marginBottom: 16,
  },
  tipsCard: {
    marginBottom: 24,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    color: "#666",
    fontStyle: "italic",
  },
  languageTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    fontSize: 12,
    alignSelf: "center",
  },
  progressCard: {
    marginTop: 16,
  },
  progressBarContainer: {
    marginTop: 12,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginVertical: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6200ee",
    borderRadius: 5,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressStat: {
    alignItems: "center",
    flex: 1,
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
    color: "#666",
  },
});
