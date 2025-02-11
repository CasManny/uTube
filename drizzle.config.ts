import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// import dotenv from 'dotenv'
// dotenv.config({path: ".env.local"}) 
// if you are using .env.local

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
