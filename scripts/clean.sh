#!/bin/bash

root_entry="./"

# Delete node_modules folders
find "$root_entry" -type d -name "node_modules" -exec rm -rf {} +

# Delete dist folders
find "$root_entry" -type d -name "bun.lockb" -exec rm -rf {} +]

# Delete .next folders
find "$root_entry" -type d -name ".next" -exec rm -rf {} +

echo "Cleaned up project's cache and lockfiles! Running clean install..."