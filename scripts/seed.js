// scripts/seed.js
// Fills the development MongoDB with sample data for development
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://root:example@localhost:27017";
const dbName = process.env.MONGODB_DB || "eutiveumsonho_dev";

async function seed() {
  const client = new MongoClient(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  await client.connect();
  const db = client.db(dbName);

  // Sample users (including a loginable user)
  const users = [
    { email: "alice@example.com", name: "Alice", createdAt: new Date() },
    { email: "bob@example.com", name: "Bob", createdAt: new Date() },
    {
      email: "marcelo@example.com",
      name: "Marcelo",
      createdAt: new Date(),
    },
    { email: "charlie@example.com", name: "Charlie", createdAt: new Date() },
    { email: "dana@example.com", name: "Dana", createdAt: new Date() },
  ];
  await db.collection("users").deleteMany({});
  const userResult = await db.collection("users").insertMany(users);

  // Sample dreams (posts)
  const posts = [
    {
      dream: { text: "I dreamed I was flying over a city." },
      userId: userResult.insertedIds["0"],
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      visibility: "public",
      commentCount: 2,
    },
    {
      dream: { text: "I was swimming with dolphins." },
      userId: userResult.insertedIds["1"],
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      visibility: "private",
      commentCount: 1,
    },
    {
      dream: { text: "I found a secret door in my house." },
      userId: userResult.insertedIds["2"],
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      visibility: "public",
      commentCount: 0,
    },
    {
      dream: { text: "I was on stage giving a talk." },
      userId: userResult.insertedIds["3"],
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      visibility: "public",
      commentCount: 1,
    },
    {
      dream: { text: "I was lost in a maze." },
      userId: userResult.insertedIds["4"],
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      visibility: "private",
      commentCount: 0,
    },
  ];
  await db.collection("dreams").deleteMany({});
  const postResult = await db.collection("dreams").insertMany(posts);

  // Sample comments
  const comments = [
    {
      comment: "Amazing dream!",
      dreamId: postResult.insertedIds["0"],
      userId: userResult.insertedIds["1"],
      createdAt: new Date(),
    },
    {
      comment: "I wish I could fly too.",
      dreamId: postResult.insertedIds["0"],
      userId: userResult.insertedIds["2"],
      createdAt: new Date(),
    },
    {
      comment: "Dolphins are so smart!",
      dreamId: postResult.insertedIds["1"],
      userId: userResult.insertedIds["0"],
      createdAt: new Date(),
    },
    {
      comment: "Congrats on the talk!",
      dreamId: postResult.insertedIds["3"],
      userId: userResult.insertedIds["4"],
      createdAt: new Date(),
    },
  ];
  await db.collection("comments").deleteMany({});
  await db.collection("comments").insertMany(comments);

  // Sample stars
  const stars = [
    {
      dreamId: postResult.insertedIds["0"],
      userId: userResult.insertedIds["2"],
      createdAt: new Date(),
    },
    {
      dreamId: postResult.insertedIds["0"],
      userId: userResult.insertedIds["3"],
      createdAt: new Date(),
    },
    {
      dreamId: postResult.insertedIds["1"],
      userId: userResult.insertedIds["0"],
      createdAt: new Date(),
    },
    {
      dreamId: postResult.insertedIds["2"],
      userId: userResult.insertedIds["1"],
      createdAt: new Date(),
    },
  ];
  await db.collection("stars").deleteMany({});
  await db.collection("stars").insertMany(stars);

  console.log(
    "Seeded development database with users, dreams, comments, and stars."
  );
  await client.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
