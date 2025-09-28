#!/bin/bash
# Firebase emulator wrapper script
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
cd backend
firebase emulators:start --only firestore
