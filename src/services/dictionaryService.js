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
    } else {
      throw new Error("Finnish Dictionary is yet to come");
    }
  } catch (error) {
    throw error;
  }
};
