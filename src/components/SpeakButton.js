/**
 * SpeakButton Component
 *
 * A reusable button component that provides text-to-speech functionality.
 * When pressed, it speaks the provided text using the device's speech synthesis.
 * Supports both English and Finnish languages.
 */

import React from "react";
import { IconButton } from "react-native-paper";
import * as Speech from "expo-speech";

/**
 * SpeakButton renders a button that speaks text when pressed
 *
 * @param {Object} props - Component props
 * @param {string} props.text - The text to be spoken
 * @param {string} props.language - Language code ("en" or "fi"), defaults to "en-us"
 * @returns {React.Component} An IconButton that triggers speech synthesis
 */
const SpeakButton = ({ text, language = "en-US" }) => {
  /**
   * Speaks the provided text using the device's speech synthesis
   * Maps the language code to the appropriate locale for speech
   */
  const speak = () => {
    const options = {
      language: language === "en" ? "en-US" : "fi-FI",
      pitch: 1.0, // Normal pitch
      rate: 0.9, // Slightly slower than normal for better clarity
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
