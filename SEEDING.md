# Database Seeding Commands

## Overview
The application now has dedicated seeding commands that are separate from the normal server startup. This allows you to control when the database is seeded and prevents automatic seeding on every server restart.

## Commands

### From Project Root
```bash
npm run seed
```
This runs the seeding script from the project root directory.

### From Backend Directory
```bash
cd backend
npm run seed
```
This runs the seeding script directly from the backend directory.

## What Gets Seeded

The seeding process creates:
- **Labs** - Quest Diagnostics, LabCorp
- **Test Patient** - John Doe (test@readyrx.com)
- **Metrics** - Glucose, Sodium, Potassium, etc.
- **Lab Tests** - CMP, CBC with LOINC codes
- **Lab Orders** - 20+ completed orders with results
- **API Tokens** - Development tokens for testing
- **Audit Logs** - Sample audit entries
- **Requests** - Sample lab request files

## Smart Seeding

The seeding script includes intelligent checks:
- ✅ **Checks for existing data** before seeding
- ✅ **Skips seeding** if data already exists
- ✅ **Prevents duplicate data** creation
- ✅ **Faster startup** on subsequent runs

## Console Output

### First Run (Empty Database)
```
🌱 ReadyRx Database Seeding Script
==================================

🌱 Starting database seeding...
📊 Database is empty, proceeding with seeding...
📋 Seeding labs...
📋 Seeding test patient...
📋 Seeding metrics...
📋 Seeding lab tests...
📋 Seeding lab orders...
📋 Seeding requests...
📋 Seeding audit logs...
📋 Seeding API tokens...
✅ Database seeding completed successfully!

🎉 Seeding completed successfully!
```

### Subsequent Runs (Database Has Data)
```
🌱 ReadyRx Database Seeding Script
==================================

🌱 Starting database seeding...
📋 Found existing data in patients collection
✅ Database already contains data, skipping seeding

🎉 Seeding completed successfully!
```

## When to Use

### Initial Setup
```bash
# First time setup
npm run install-all
npm run seed
npm run dev
```

### Reset Database
```bash
# Clear Firebase emulator data and reseed
npm run clean
npm run seed
npm run dev
```

### Development
```bash
# Normal development (no seeding)
npm run dev
```

## Benefits

- ✅ **Faster server startup** - no automatic seeding delay
- ✅ **Control over seeding** - run only when needed
- ✅ **Prevents duplicates** - smart checks prevent data conflicts
- ✅ **Clean separation** - seeding logic separate from server logic
- ✅ **Easy reset** - simple command to reseed database

## Environment Requirements

Make sure you have:
- ✅ **Firebase emulator running** (`npm run emulator`)
- ✅ **Environment variables set** (`.env` file)
- ✅ **Encryption key configured** (`ENCRYPTION_KEY`)
- ✅ **Firebase credentials** (service account or emulator)
