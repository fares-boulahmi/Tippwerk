// How many items make one typing session
export const WORDS_PER_SESSION = 15;
export const SENTENCES_PER_SESSION = 3;
export const CHUNK_SIZE = {
  words: WORDS_PER_SESSION,
  sentences: SENTENCES_PER_SESSION,
};

// Input limits for the admin forms
export const LIMITS = {
  maxWords: 2000,
  maxSentences: 1000,
  maxWordLength: 100,
  maxSentenceLength: 600,
};
