#!/bin/bash
npm install && npm run server:build && EXPO_PUBLIC_DOMAIN=figma-importer.replit.app npx expo export --platform web
