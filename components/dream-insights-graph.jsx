import { useEffect, useState, useRef } from "react";
import { Box, Heading, Text } from "grommet";
import { cosineSimilarityScore } from "../lib/data-analysis/cosine-similarity";
import { getInsights } from "../lib/data-analysis/word-frequency";

export default function DreamInsightsGraph({ dreams, title = "Dream Insights" }) {
  const [insights, setInsights] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!dreams || dreams.length === 0) return;

    // Extract text from all dreams
    const allText = dreams
      .map(dream => dream.dream?.text || "")
      .join(" ");

    // Get word frequency insights
    const dreamInsights = getInsights(allText);
    
    // Get top 20 most frequent words for visualization
    const topWords = dreamInsights.wordFrequency.slice(0, 20);
    
    // Calculate similarities between words
    const similarities = [];
    for (let i = 0; i < topWords.length; i++) {
      for (let j = i + 1; j < topWords.length; j++) {
        const similarity = cosineSimilarityScore(topWords[i].word, topWords[j].word);
        if (similarity > 0.1) { // Only show meaningful connections
          similarities.push({
            source: i,
            target: j,
            similarity: similarity,
            sourceWord: topWords[i].word,
            targetWord: topWords[j].word
          });
        }
      }
    }

    setInsights({
      words: topWords,
      similarities: similarities,
      characterCount: dreamInsights.characterCount
    });
  }, [dreams]);

  useEffect(() => {
    if (!insights || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const { words, similarities } = insights;
    
    if (words.length === 0) return;

    // Calculate node positions in a circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const nodes = words.map((word, index) => ({
      x: centerX + radius * Math.cos((2 * Math.PI * index) / words.length),
      y: centerY + radius * Math.sin((2 * Math.PI * index) / words.length),
      word: word.word,
      frequency: word.frequency,
      size: Math.max(8, Math.min(24, word.frequency * 3))
    }));

    // Draw connections (edges)
    ctx.strokeStyle = "rgba(126, 76, 219, 0.3)";
    ctx.lineWidth = 1;
    
    similarities.forEach(sim => {
      const sourceNode = nodes[sim.source];
      const targetNode = nodes[sim.target];
      
      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      // Draw circle
      ctx.fillStyle = "rgb(126, 76, 219)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw text
      ctx.fillStyle = "white";
      ctx.font = `${Math.max(10, node.size - 4)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Truncate long words
      const displayWord = node.word.length > 8 ? node.word.substring(0, 8) + "..." : node.word;
      ctx.fillText(displayWord, node.x, node.y);
    });

  }, [insights]);

  if (!insights || insights.words.length === 0) {
    return (
      <Box pad="medium" align="center">
        <Text>No insights available</Text>
      </Box>
    );
  }

  return (
    <Box pad="medium">
      <Heading level={3} size="small" margin={{ bottom: "medium" }}>
        {title}
      </Heading>
      <Box align="center" gap="small">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            maxWidth: "100%",
            height: "auto"
          }}
        />
        <Box direction="row" gap="large" justify="center" wrap>
          <Text size="small">
            <strong>Words analyzed:</strong> {insights.words.length}
          </Text>
          <Text size="small">
            <strong>Characters:</strong> {insights.characterCount}
          </Text>
          <Text size="small">
            <strong>Connections:</strong> {insights.similarities.length}
          </Text>
        </Box>
        <Text size="xsmall" textAlign="center" color="dark-4">
          Graph shows most frequent words and their semantic relationships
        </Text>
      </Box>
    </Box>
  );
}