# MongoDB Setup Guide

This guide covers setting up a free MongoDB database for the ROPE system, configuring your environment, and accessing/exporting your data.

## Table of Contents
- [1. Create a MongoDB Account](#1-create-a-mongodb-atlas-account)
- [2. Create a Free Cluster](#2-create-a-free-cluster)
- [3. Set Up Database Access](#3-set-up-database-access-usernamepassword)
- [4. Set Up Network Access](#4-set-up-network-access)
- [5. Get Your Connection String](#5-get-your-connection-string)
- [6. Configure Your .env File](#6-configure-your-env-file)
- [7. Examining Data](#7-examining-data)
- [8. Downloading Data Locally](#8-downloading-data-locally)

---

## 1. Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up (you can use Google/GitHub)

## 2. Create a Free Cluster

1. After signing in, click **"Build a Database"**
2. Select **M0 FREE** tier (Shared)


## 3. Set Up Database Access (Username/Password)

1. Go to **Security → Database Access**
2. Click **"Add New Database User"**
3. Create a username (e.g., `ropeuser`)
4. Set privileges to **"Read and write to any database"**


## 4. Set Up Network Access

1. Go to **Security → Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`) for development (localhost)

> **Note:** For production, you should restrict access to specific IP addresses.

## 5. Get Your Connection String

1. Go to **Database → Clusters**
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string, which looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## 6. Configure Your .env File

Now locally, create or update your `.env` file in the project root:

```env
MONGODB_URI=mongodb+srv://ropeuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
APP_PASSWORD=123456 (or anything you want)
OPENAI_API_KEY=sk-...
```

After updating `.env`, restart your dev server:
```bash
npm run dev
```

---

## 7. Examining Data

### Option A: MongoDB Atlas Web UI

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Database → Browse Collections**
3. Select your database (e.g., `multipleGame`)
4. Click on a collection (e.g., `conversation`, `data`)
5. Use the query bar to filter documents:
   ```javascript
   { username: "test" }
   ```

### Option B: MongoDB Shell (mongosh)

#### Install mongosh
```bash
# macOS
brew install mongosh

# Or download from https://www.mongodb.com/try/download/shell
```

#### Connect to your database
```bash
mongosh "mongodb+srv://your-cluster.mongodb.net/" --username your_username
```

You'll be prompted for your `<password>` as you used in the MONGODB_URI.

#### Common commands
```javascript
// List all databases
show dbs

// Switch to a database
use multipleGame

// List collections
show collections

// Find all documents in a collection
db.conversation.find({}).pretty()

// To see all unique usernames in collection
db.conversation.distinct("username")
```

---

## 8. Downloading Data Locally

### From mongosh

While connected in mongosh:

```javascript
// Switch to your database
use multipleGame

// Export to JSON file
fs.writeFileSync('/path/conversation.json', EJSON.stringify(db.conversation.find({}).toArray(), null, 2))

// Export with a filter
fs.writeFileSync('/path/filtered_data.json', EJSON.stringify(db.conversation.find({ username: "\"test\"" }).toArray(), null, 2))
```

### Other options
* MongoDB Compass UI: https://www.mongodb.com/docs/compass/import-export/
* mongoexport: https://www.mongodb.com/docs/database-tools/mongoexport/#mongodb-binary-bin.mongoexport
