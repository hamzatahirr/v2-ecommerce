#!/bin/bash

# Copy static files to standalone directory for production deployment
echo "Copying static files to standalone directory..."

# Create static directory in standalone if it doesn't exist
mkdir -p .next/standalone/.next/static

# Copy all static files
cp -r .next/static/* .next/standalone/.next/static/

# Copy public directory
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/

echo "Static files copied successfully!"