#!/usr/bin/env node
/**
 * Drop legacy index 'user_token_1' on users collection if present.
 * Usage: node scripts/drop-user-token-index.js
 */

// Load environment variables from .env.local so the script uses your configured MONGODB_URI
try {
  // Prefer dotenv if available
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // Fallback: simple parser for .env.local to avoid adding dependencies
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const eq = line.indexOf('=');
      if (eq === -1) return;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      // Remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    });
  }
}
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackspot';

async function dropIndex() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: undefined });
    console.log('Connected to MongoDB at', MONGODB_URI);

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Connected but `mongoose.connection.db` is undefined');
      await mongoose.disconnect();
      process.exit(1);
    }

    const collection = db.collection('users');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    const target = indexes.find(i => i.name === 'user_token_1');
    if (!target) {
      console.log("Index 'user_token_1' not found. No action needed.");
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("Dropping index 'user_token_1'...");
    await collection.dropIndex('user_token_1');
    console.log("Index 'user_token_1' dropped successfully.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error dropping index:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

if (require.main === module) {
  dropIndex();
}
