#!/bin/bash

# Get list of changed files in php_api/ from the last commit
FILES=$(git diff-tree --no-commit-id --name-only -r HEAD | grep ^php_api/)

HOST="50.6.108.166"
USER="rriczdte"
PASS="Ramir751!!0102"
REMOTE_ROOT="/public_html/catering_app"

echo "Deploying changed files to $HOST..."

for FILE in $FILES; do
  # Remove php_api/ prefix for remote path
  REMOTE_FILE="${FILE#php_api/}"
  
  echo "Uploading $FILE to $REMOTE_ROOT/$REMOTE_FILE..."
  
  # Upload using curl
  curl -s -S -u "$USER:$PASS" -T "$FILE" "ftp://$HOST$REMOTE_ROOT/$REMOTE_FILE" --ftp-create-dirs
  
  if [ $? -eq 0 ]; then
    echo "✅ $FILE uploaded successfully."
  else
    echo "❌ Failed to upload $FILE"
    exit 1
  fi
done

echo "🎉 Deployment complete."
