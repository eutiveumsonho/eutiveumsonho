export async function isDreamOwner(dream, userEmail) {
  return dream.userEmail === userEmail;
}
