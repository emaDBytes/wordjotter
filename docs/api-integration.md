# WordJotter API Integration Documentation

## Overview

WordJotter integrates with external services to provide comprehensive dictionary functionality across multiple languages. This document outlines the APIs used, integration approaches, and implementation details.

## Dictionary APIs

### 1. Free Dictionary API (English)

**Purpose:** Provides English word definitions, phonetics, examples, and parts of speech.

**Base URL:** `https://api.dictionaryapi.dev/api/v2/entries`

**Integration Type:** Direct RESTful API calls

**Implementation:**

- Located in `src/services/dictionaryService.js`
- Uses fetch API for HTTP requests
- Endpoint: `GET /{language}/{word}`
- No authentication required (open API)

**Response Handling:**

- JSON parsing with error handling
- Data extraction for definitions, examples, phonetics
- Custom error messages for user-friendly feedback

**Sample Request:**

```
fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/hello`);
```

**Sample Response Structure:**

```
[
  {
    "word": "hello",
    "phonetic": "həˈləʊ",
    "phonetics": [...],
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "An utterance of 'hello'",
            "example": "she was met with a chorus of hellos"
          }
        ]
      }
    ]
  }
]
```

**Error Handling:**

- 404: Word not found
- Network failures
- Malformed responses

### 2. RedFox Dictionary (Finnish)

**Purpose:** Provides Finnish word translations and definitions.

**Integration Type:** External browser-based lookup

**Implementation:**

- Located in `src/services/dictionaryService.js`
- Uses `expo-web-browser` for external access
- Redirects to RedFox Dictionary website
- Returns to app for manual entry of definitions

**URL Pattern:** `https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng/{word}`

**Workflow:**

1. User selects Finnish language and enters search term
2. App opens RedFox Dictionary in external browser
3. User reviews definitions in browser
4. User returns to app
5. App presents form for manual entry of word details
6. Data is saved to local database

## Environment Configuration

API endpoints are configured via environment variables to support different environments (development, testing, production):

```
EXPO_PUBLIC_API_URL=https://api.dictionaryapi.dev/api/v2/entries
EXPO_PUBLIC_FINNISH_DICTIONARY_URL=https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng
```

## Future API Enhancements

Potential future API integrations:

1. **Cambridge Dictionary API** - Alternative source for English definitions
2. **Text-to-Speech API Improvements** - Enhanced pronunciation capabilities
3. **Authentication** - User account synchronization across devices
4. **Wiktionary API** - Alternative source for multilingual definitions

## Handling API Rate Limits

The Free Dictionary API does not explicitly document rate limits, but the application implements best practices:

- Caching of results in local database
- Error handling for potential 429 responses
- Throttling of rapid consecutive requests
- Offline-first approach to minimize API calls

## API Response Mapping

Dictionary API responses are mapped to the application's internal data model:

```
// Internal word storage structure
{
  word: string,          // The word text
  language: string,      // 'en' or 'fi'
  definition: string,    // Primary meaning
  phonetic: string,      // Pronunciation guide
  example: string,       // Usage example
  notes: string,         // User's personal notes
  category: string       // Word category/context
}
```

## Testing API Integration

The API integration can be tested using:

1. Manual testing via the app's search interface
2. Using the Expo development tools
3. Monitoring network requests in browser DevTools
4. Testing offline functionality by enabling airplane mode

## References

- [Free Dictionary API Documentation](https://dictionaryapi.dev/)
- [RedFox Dictionary](https://redfoxsanakirja.fi/)
- [Expo WebBrowser Documentation](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
