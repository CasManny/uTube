import { drizzle } from 'drizzle-orm/neon-http';
import 'dotenv/config';
import { categories } from "@/db/schema";

const db = drizzle(process.env.DATABASE_URL!);

const categoryNames = [
  "Cars and vechiles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and animation",
  "How-to and style",
  "Music",
  "News and politics",
  "People and blogs",
  "Pets and animals",
  "Science and Technology",
  "Sports",
  "Travel and events",
];

async function main() {
  console.log("seeding categories");
  try {
    const Catvalues = categoryNames.map((cat) => ({
      name: cat,
      description: `Videos related to ${cat.toLowerCase()}`,
    }));
    await db.insert(categories).values(Catvalues);
    console.log("seeding categories successfully done!");
  } catch (error) {
    console.log("something happened while seeding database", error);
    process.exit(1);
  }
}

main();
