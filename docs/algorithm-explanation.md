# WordJotter Spaced Repetition Algorithm

## Overview

WordJotter implements a spaced repetition system (SRS) to help users memorize vocabulary more effectively. This algorithm schedules words for review at increasing intervals, showing words more frequently when users are still learning them and less frequently once they're well-known.

## How It Works

### Learning Levels

Each word in WordJotter has a learning level (0-5) that represents how well the user knows the word:

| Level | Description  | Next Review Interval |
| ----- | ------------ | -------------------- |
| 0     | Just started | 1 day                |
| 1     | Learning     | 3 days               |
| 2     | Familiar     | 7 days               |
| 3     | Almost known | 14 days              |
| 4     | Well known   | 30 days              |
| 5     | Mastered     | 90 days              |

### Core Principles

1. **Expanding Intervals**: As a user successfully recalls a word, its review interval expands, showing it less frequently
2. **Reset on Difficulty**: If a user marks a word as "Still Tricky", the word returns to level 0 for more frequent practice
3. **Prioritized Practice**: Words are shown in order of learning need, with those due for review appearing first

## Technical Implementation

The algorithm is implemented in `learningService.js` with two primary functions:

### Review Scheduling

```javascript
// Defined intervals in days for each learning level
const INTERVALS = [1, 3, 7, 14, 30, 90];
```

When a user reviews a word, the system updates its learning level and next review date:

1. If the user correctly recalls the word (marks it as "Known"):

   - The learning level increases by 1 (up to maximum of 5)
   - The next review date is set based on the new level's interval

2. If the user struggles with the word (marks as "Needs Practice"):
   - The learning level resets to 0
   - The next review date is set to tomorrow (1-day interval)

### Review Selection

The system automatically selects words for review based on:

1. Words that have no learning level yet (new words)
2. Words whose next review date is today or earlier
3. Words are randomly shuffled to provide variety in practice sessions

## Memory Research Foundation

This algorithm is based on research in memory and learning:

- **Ebbinghaus Forgetting Curve**: Memory retention declines over time, but each successful review strengthens retention
- **Spacing Effect**: Information is better retained when study sessions are spaced out over time
- **Testing Effect**: Active recall testing enhances learning more than passive review

## Benefits of the Approach

1. **Efficiency**: Users spend more time on difficult words and less time reviewing words they already know
2. **Personalization**: The system adapts to each user's learning pace and word difficulty
3. **Long-term Retention**: The expanding interval schedule is optimized for transferring vocabulary to long-term memory
4. **Motivation**: Users see progress as words move to higher learning levels

## Future Enhancements

Potential improvements to the algorithm might include:

1. **Difficulty Adjustments**: Modify intervals based on word complexity
2. **Context-Based Learning**: Group words by theme or context for more effective learning
3. **Automated Level Decay**: Gradually decrease learning levels for words not reviewed in a long time
4. **Performance Analytics**: Track learning rate across different word types and languages

## Code Implementation

The core of the algorithm is in the `updateWordAfterReview` function:

```javascript
export const updateWordAfterReview = async (wordId, isCorrect) => {
  try {
    // Get the current word to check its learning level
    const words = await getSavedWords();
    const word = words.find((w) => w.id === wordId);

    if (!word) {
      return false;
    }

    // Current learning level (zero, if not set yet)
    let learningLevel = word.learning_level || 0;

    // Adjust learning level based on answer
    if (isCorrect) {
      // Move to next level if correct (max at INTERVALS.length - 1)
      learningLevel = Math.min(learningLevel + 1, INTERVALS.length - 1);
    } else {
      // Move back to first level if incorrect
      learningLevel = 0;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + INTERVALS[learningLevel]);

    // Update the word in the database
    const success = await updateWordLearningStatus(
      wordId,
      learningLevel,
      nextReviewDate.toISOString()
    );

    return success;
  } catch (error) {
    console.error("Error in updating word learning status: ", error);
    return false;
  }
};
```
