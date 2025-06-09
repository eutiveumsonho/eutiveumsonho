import { getInsights } from "../../lib/data-analysis/word-frequency";
import { getEnhancedSemanticClusters } from "../../lib/data-analysis/semantic-clustering";
import { getLatestPublicPosts } from "../../lib/db/reads";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const posts = await getLatestPublicPosts();

    // Extract text from all posts
    const allText = posts.map((post) => post.dream?.text || "").join(" ");

    // Get word frequency insights
    const dreamInsights = getInsights(allText);

    // Get top 100 most frequent words for enhanced visualization
    const topWords = dreamInsights.wordFrequency.slice(0, 100);

    // Enhanced semantic clustering algorithm
    const { clusters, similarities } = getEnhancedSemanticClusters(topWords);

    const insights = {
      words: topWords,
      similarities: similarities,
      clusters: clusters,
      characterCount: dreamInsights.characterCount,
      dreamCount: posts.length,
    };

    res.status(200).json(insights);
  } catch (error) {
    console.error("Error processing dream insights:", error);
    res.status(500).json({ message: "Error processing dream insights" });
  }
}
