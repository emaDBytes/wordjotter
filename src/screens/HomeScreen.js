import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";
import { Text, Card, Button, List, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import { getSavedWords } from "../services/databaseService";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [recentWords, setRecentWords] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    english: 0,
    finnish: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const words = await getSavedWords();

    // Get 5 most recent words
    setRecentWords(words.slice(0, 5));

    // Calculate what we have
    setStats({
      total: words.length,
      english: words.filter((word) => word.language === "en").length,
      finnish: words.filter((word) => word.language === "fi").length,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          WordJotter
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          The Coolest Dual-Language Word Stash
        </Text>
      </View>
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
    color: "#666",
  },
});
