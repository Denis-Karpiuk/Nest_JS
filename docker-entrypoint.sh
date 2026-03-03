#!/bin/sh
set -e

# Run migrations (uses DATABASE_URL / POSTGRES_* env)
yarn migration:run

# Start the application
exec node dist/main
