#!/bin/bash

# Bash
if [ -z "$1" ]
then
  echo "Error: No argument supplied for migration name"
  exit 1
fi

TIMESTAMP=$(date +%s)
FILENAME="backend/infra/database/migrations/${TIMESTAMP}_$1.ts"

cat << EOF > $FILENAME
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Migration code
}

export async function down(db: Kysely<any>): Promise<void> {
  // Migration code
}
EOF

echo "Migration $1 created at $FILENAME !"
