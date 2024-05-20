import { hasCommentedOnPost } from "./reads";

// TODO: Replace all dream-specific scheme by post-specific scheme
export * from "./posts/reads";
export * from "./users/reads";
export * from "./comments/reads";
export * from "./stars/reads";
export * from "./inbox/reads";

// All methods below this line shouldn't be ported to any package.

/**
 * Checks if the AI has commented on a post
 *
 * @param {string} postId The post id
 * @returns {Promise<boolean>}
 */
export async function hasAiCommentedOnPost(postId) {
  const [hasCommented, legacyHasCommented] = await Promise.all([
    hasCommentedOnPost("Sonia", postId),
    hasCommentedOnPost("Sonio", postId),
  ]);

  return hasCommented || legacyHasCommented;
}
