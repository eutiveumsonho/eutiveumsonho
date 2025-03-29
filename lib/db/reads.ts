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
 */
export async function hasAiCommentedOnPost(postId: string): Promise<boolean> {
  const [hasCommented, legacyHasCommented] = await Promise.all([
    hasCommentedOnPost("Sonia", postId),
    hasCommentedOnPost("Sonio", postId),
  ]);

  return hasCommented || legacyHasCommented;
}
