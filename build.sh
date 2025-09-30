#!/bin/bash
# Build script for Rehab Hub

echo "Building Rehab Hub..."

# Change to config directory where node_modules is located
cd config

# Run TypeScript compiler
./node_modules/.bin/tsc -p ./tsconfig.json

echo "Build complete!"
