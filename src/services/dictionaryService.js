import * as WebBrowser from "expo-web-browser";

// Fetch word definition fo English or
// handle Finnish lookup
export const fetchWordDefinition = async (word, language = "en") => {
  try {
    if (language === "en") {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/${language}/${word}`
      );

      if (!response.ok) {
        throw new Error("Whoops, that word ghosted us!");
      }

      return await response.json();
    } else if (language === "fi") {
      // For Finnish, open the browser instead of showing results
      return {
        type: "external",
        word: word,
        language: "fi",
      };
    } else {
      throw new Error("Unsupported language");
    }
  } catch (error) {
    throw error;
  }
};

// Open Finnish dictionary in browser
export const openFinnishDictionary = async (word) => {
  try {
    // Use REdFox dectionary for Finnish lookup
    const url = `https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng/${encodeURIComponent(
      word
    )}`;
    const result = await WebBrowser.openBrowserAsync(url);
    return result;
  } catch (error) {
    console.error("Error in opening browser: ", error);
    throw error;
  }
};
