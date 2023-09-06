function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let magnitudeA = 0.0;
  let magnitudeB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to calculate the dot product of two vectors
function dotProduct(vecA, vecB) {
  let product = 0;
  for (let key in vecA) {
    if (vecB.hasOwnProperty(key)) {
      product += vecA[key] * vecB[key];
    }
  }
  return product;
}

// Function to calculate the magnitude of a vector
function magnitude(vec) {
  let sumOfSquares = 0;
  for (let key in vec) {
    if (vec.hasOwnProperty(key)) {
      sumOfSquares += Math.pow(vec[key], 2);
    }
  }
  return Math.sqrt(sumOfSquares);
}

// Function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProd = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);

  return dotProd / (magA * magB);
}

// Function to convert text to a frequency map
function textToFreqMap(text) {
  const freqMap = {};
  const words = text.split(/\W+/).filter(Boolean);

  words.forEach((word) => {
    word = word.toLowerCase();
    freqMap[word] = (freqMap[word] || 0) + 1;
  });

  return freqMap;
}

function cosineSimilarityScore(seq1, seq2) {
  const vecA = textToFreqMap(seq1);
  const vecB = textToFreqMap(seq2);

  return cosineSimilarity(vecA, vecB);
}
