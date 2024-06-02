/**
 * Function to calculate the dot product of two vectors
 *
 * @link https://en.wikipedia.org/wiki/Dot_product
 * @param {object} vecA first vector
 * @param {object} vecB second vector
 * @returns {number} dot product of the two vectors
 */
function dotProduct(vecA, vecB) {
  let product = 0;
  for (let key in vecA) {
    if (vecB.hasOwnProperty(key)) {
      product += vecA[key] * vecB[key];
    }
  }
  return product;
}

/**
 * Function to calculate the magnitude of a vector
 *
 * @link https://en.wikipedia.org/wiki/Magnitude_(mathematics)
 * @param {object} vec vector
 * @returns {number} magnitude of the vector
 */
function magnitude(vec) {
  let sumOfSquares = 0;
  for (let key in vec) {
    if (vec.hasOwnProperty(key)) {
      sumOfSquares += Math.pow(vec[key], 2);
    }
  }
  return Math.sqrt(sumOfSquares);
}

/**
 * Function to calculate cosine similarity between two vectors
 *
 * @link https://en.wikipedia.org/wiki/Cosine_similarity
 * @param {object} vecA first vector
 * @param {object} vecB second vector
 * @returns {number} cosine similarity between the two vectors
 */
function cosineSimilarity(vecA, vecB) {
  const dotProd = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);

  return dotProd / (magA * magB);
}

/**
 * Function to convert text to a frequency map
 * @param {string} text text to be converted
 * @returns {object} frequency map of the text
 */
function textToFreqMap(text) {
  const freqMap = {};
  const words = text.split(/\W+/).filter(Boolean);

  words.forEach((word) => {
    word = word.toLowerCase();
    freqMap[word] = (freqMap[word] || 0) + 1;
  });

  return freqMap;
}

/**
 * Function to calculate cosine similarity score between two strings
 *
 * @param {string} seq1 first sequence
 * @param {string} seq2 second sequence
 * @returns {number} cosine similarity score
 */
export function cosineSimilarityScore(seq1, seq2) {
  const vecA = textToFreqMap(seq1);
  const vecB = textToFreqMap(seq2);

  return cosineSimilarity(vecA, vecB);
}
