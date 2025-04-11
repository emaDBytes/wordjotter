import React from "react";
import { IconButton } from "react-native-paper";
import * as Speech from "expo-speech";

const SpeakButton = ({ text, language = "en-US" }) => {
  const speak = () => {
    const options = {
      language: language === "en" ? "en-US" : "fi-FI",
      pitch: 1.0,
      rate: 0.9,
    };

    Speech.speak(text, options);
  };

  return (
    <IconButton
      icon="volume-high"
      size={20}
      onPress={speak}
      accessibilityLabel={`Pronounce ${text}`}
    />
  );
};

export default SpeakButton;
