import { useEffect, useRef } from "react";
import { Box, Heading, Text } from "grommet";
import cytoscape from "cytoscape";

// Color palette for different cluster categories
const categoryColors = {
  emotions: "#FF6B9D", // Pink
  people: "#4ECDC4", // Teal
  places: "#45B7D1", // Blue
  actions: "#96CEB4", // Green
  animals: "#FFEAA7", // Yellow
  objects: "#DDA0DD", // Plum
  nature: "#98D8C8", // Mint
  supernatural: "#A29BFE", // Purple
  general: "#7E4CDB", // Default purple
};

export default function PostInsightsGraph({
  insights,
  title = "Dream Word Analysis",
}) {
  const cyRef = useRef(null);

  useEffect(() => {
    if (!insights || !cyRef.current) return;

    const { words, similarities, clusters } = insights;

    if (words.length === 0) return;

    // Create cluster lookup for coloring nodes
    const nodeClusterMap = {};
    const clusterCategoryMap = {};

    if (clusters) {
      clusters.forEach((cluster) => {
        cluster.nodes.forEach((nodeIndex) => {
          nodeClusterMap[nodeIndex] = cluster.id;
          clusterCategoryMap[cluster.id] = cluster.category;
        });
      });
    }

    // Create Cytoscape elements
    const elements = [
      // Add nodes with enhanced styling
      ...words.map((word, index) => {
        const clusterId = nodeClusterMap[index];
        const category = clusterId ? clusterCategoryMap[clusterId] : "general";
        const size = Math.max(30, Math.min(80, word.frequency * 8));

        return {
          data: {
            id: `word-${index}`,
            label: word.word,
            frequency: word.frequency,
            size: size,
            category: category,
            clusterId: clusterId || "isolated",
            stem: word.stem || word.word,
          },
        };
      }),
      // Add edges with type-based styling
      ...similarities.map((sim, index) => ({
        data: {
          id: `edge-${index}`,
          source: `word-${sim.source}`,
          target: `word-${sim.target}`,
          weight: sim.similarity || 0.5,
          type: sim.type || "cosine",
          similarity: sim.similarity,
          sourceWord: sim.sourceWord,
          targetWord: sim.targetWord,
        },
      })),
    ];

    // Initialize Cytoscape with enhanced styling
    const cy = cytoscape({
      container: cyRef.current,
      elements: elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": (ele) => {
              const category = ele.data("category");
              return categoryColors[category] || categoryColors.general;
            },
            label: "data(label)",
            color: "white",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": (ele) =>
              Math.max(10, Math.min(16, ele.data("frequency") * 2)),
            "font-weight": "bold",
            width: "data(size)",
            height: "data(size)",
            "border-width": 3,
            "border-color": (ele) => {
              const category = ele.data("category");
              const color = categoryColors[category] || categoryColors.general;
              // Darken the border color
              return color.replace(/[0-9A-F]{2}/g, (match) => {
                const val = parseInt(match, 16);
                return Math.max(0, val - 40)
                  .toString(16)
                  .padStart(2, "0");
              });
            },
            "text-wrap": "wrap",
            "text-max-width": "100px",
            "text-outline-width": 2,
            "text-outline-color": "#000",
            "min-zoomed-font-size": 8,
            "box-shadow": "0 4px 8px rgba(0,0,0,0.3)",
          },
        },
        {
          selector: "node:hover",
          style: {
            "border-width": 5,
            "box-shadow": "0 6px 12px rgba(0,0,0,0.5)",
            "z-index": 10,
          },
        },
        {
          selector: "edge",
          style: {
            width: (ele) => Math.max(2, ele.data("weight") * 6),
            "line-color": "rgba(126, 76, 219, 0.6)",
            "target-arrow-color": "rgba(126, 76, 219, 0.7)",
            "curve-style": "bezier",
            opacity: 0.7,
          },
        },
        {
          selector: "edge:hover",
          style: {
            width: (ele) => Math.max(4, ele.data("weight") * 8),
            opacity: 1,
            "z-index": 5,
            "line-color": "rgba(126, 76, 219, 0.9)",
            "target-arrow-color": "rgba(126, 76, 219, 0.9)",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#FF4757",
            "border-width": 6,
            "box-shadow": "0 8px 16px rgba(255,71,87,0.4)",
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#FF6B9D",
            "target-arrow-color": "#FF6B9D",
            opacity: 1,
            "z-index": 10,
          },
        },
        {
          selector: ".highlighted",
          style: {
            "border-color": "#FFD700",
            "border-width": 6,
            "box-shadow": "0 8px 16px rgba(255,215,0,0.6)",
          },
        },
        {
          selector: "edge.highlighted",
          style: {
            "line-color": "#FFD700",
            "target-arrow-color": "#FFD700",
            opacity: 1,
            width: (ele) => Math.max(5, ele.data("weight") * 10),
          },
        },
      ],
      layout: {
        name: clusters && clusters.length > 0 ? "cose" : "circle",
        // Enhanced layout options for better clustering visualization
        idealEdgeLength: 80,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 8000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
        animate: true,
        animationDuration: 2000,
        animationEasing: "ease-out-cubic",
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      wheelSensitivity: 0.3,
      minZoom: 0.3,
      maxZoom: 3,
    });

    // Enhanced interaction handlers
    cy.on("tap", "node", function (evt) {
      const node = evt.target;
      const nodeData = node.data();
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();

      // Clear previous highlights
      cy.elements().removeClass("highlighted");

      // Highlight the selected node and its connections
      node.addClass("highlighted");
      connectedEdges.addClass("highlighted");
      connectedNodes.addClass("highlighted");

      // Show simplified information (optional - can be removed for production)
      console.log(
        `Selected: "${nodeData.label}" (${nodeData.frequency} times, ${connectedNodes.length} connections)`
      );
    });

    cy.on("tap", "edge", function (evt) {
      const edge = evt.target;
      const edgeData = edge.data();

      cy.elements().removeClass("highlighted");
      edge.addClass("highlighted");
      edge.source().addClass("highlighted");
      edge.target().addClass("highlighted");

      console.log(
        `Connection between "${edgeData.sourceWord}" and "${edgeData.targetWord}"`
      );
    });

    cy.on("tap", function (evt) {
      if (evt.target === cy) {
        cy.elements().removeClass("highlighted");
      }
    });

    // Add cluster highlighting on double-click
    cy.on("dblclick", "node", function (evt) {
      const node = evt.target;
      const clusterId = node.data("clusterId");

      cy.elements().removeClass("highlighted");

      if (clusterId !== "isolated") {
        // Highlight all nodes in the same cluster
        cy.nodes().forEach((n) => {
          if (n.data("clusterId") === clusterId) {
            n.addClass("highlighted");
            n.connectedEdges().addClass("highlighted");
          }
        });
      }
    });

    // Cleanup function
    return () => {
      if (cy) {
        cy.destroy();
      }
    };
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
        <div
          ref={cyRef}
          style={{
            width: "100%",
            height: "800px",
            maxWidth: "100%",
            border: "2px solid #e1e1e1",
            borderRadius: "12px",
            backgroundColor: "#fafafa",
          }}
        />

        {/* Enhanced statistics */}
        <Box direction="row" gap="large" justify="center" wrap>
          <Text size="small">
            <strong>Words:</strong> {insights.words.length}
          </Text>
          <Text size="small">
            <strong>Connections:</strong> {insights.similarities.length}
          </Text>
          <Text size="small">
            <strong>Characters:</strong> {insights.characterCount}
          </Text>
          <Text size="small">
            <strong>Dreams:</strong> {insights.dreamCount}
          </Text>
        </Box>

        {/* Category legend - Dream themes */}
        <Box
          direction="row"
          gap="small"
          justify="center"
          wrap
          margin={{ top: "small" }}
        >
          {Object.entries(categoryColors).map(([category, color]) => (
            <Box key={category} direction="row" align="center" gap="xsmall">
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: color,
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
              <Text size="xsmall" style={{ textTransform: "capitalize" }}>
                {category}
              </Text>
            </Box>
          ))}
        </Box>

        <Text
          size="xsmall"
          textAlign="center"
          color="dark-4"
          margin={{ top: "small" }}
        >
          Shows related words from your dreams grouped by meaning and context.
          <br />
          Click words to see connections • Double-click to highlight themes •
          Drag to explore • Scroll to zoom
        </Text>
      </Box>
    </Box>
  );
}
