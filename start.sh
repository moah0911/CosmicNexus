#!/bin/bash

echo "=== Resonance Map Setup ==="
echo "Installing dependencies..."
npm install

echo ""
echo "Setting up database tables..."
npm run setup-db

echo ""
echo "Starting development server..."
npm run dev