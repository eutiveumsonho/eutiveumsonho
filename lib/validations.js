export async function isPostOwner(dream, user) {
  return dream.userId === user._id;
}
