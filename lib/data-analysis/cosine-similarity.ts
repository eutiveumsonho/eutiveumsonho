/**
 * Function to calculate the dot product of two vectors
 *
 * @link https://en.wikipedia.org/wiki/Dot_product
 * @param {Record<string, number>} vecA first vector
 * @param {Record<string, number>} vecB second vector
 * @returns {number} dot product of the two vectors
 */
function dotProduct(
  vecA: Record<string, number>,
  vecB: Record<string, number>
): number {
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
 * @param {Record<string, number>} vec vector
 * @returns {number} magnitude of the vector
 */
function magnitude(vec: Record<string, number>): number {
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
 * @param {Record<string, number>} vecA first vector
 * @param {Record<string, number>} vecB second vector
 * @returns {number} cosine similarity between the two vectors
 */
function cosineSimilarity(
  vecA: Record<string, number>,
  vecB: Record<string, number>
): number {
  const dotProd = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);

  return dotProd / (magA * magB);
}

/**
 * Function to convert text to a frequency map
 * @param {string} text text to be converted
 * @returns {Record<string, number>} frequency map of the text
 */
function textToFreqMap(text: string): Record<string, number> {
  const freqMap: Record<string, number> = {};
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
export function cosineSimilarityScore(seq1: string, seq2: string): number {
  const vecA = textToFreqMap(seq1);
  const vecB = textToFreqMap(seq2);

  return cosineSimilarity(vecA, vecB);
}
