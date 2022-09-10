export async function isDreamOwner(dream, user) {
  return dream.userId === user._id;
}
