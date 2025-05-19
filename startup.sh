#!/bin/bash

# 169 notes Application Startup Script
# This script attempts to open the 169 notes application in your default web browser.

# Indicate script execution
echo -e "\ud83d\ude80 Starting 169 notes Application..."

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo -e "\u274c Error: index.html not found in the current directory."
    echo "Please ensure you are in the root directory of the 169 notes project."
    exit 1
fi

# Provide instructions to the user
echo -e "\ud83d\udcdd 169 notes is a client-side application."
echo "It runs directly in your web browser using HTML, CSS, and JavaScript."
echo "No server or build process is required."
echo ""
echo -e "\u2728 Attempting to open index.html in your default browser..."

# Platform-independent way to open a file (tries common commands)
OPEN_COMMAND=""
if command -v xdg-open &> /dev/null; then
    OPEN_COMMAND="xdg-open"
elif command -v open &> /dev/null; then # macOS
    OPEN_COMMAND="open"
elif command -v start &> /dev/null; then # Windows (Git Bash, Cygwin)
    # 'start' might open in a new cmd window on Windows, which is fine.
    # For WSL, 'start' might not work as expected for host browser unless configured.
    # Using explorer.exe for WSL to open in host browser is more reliable.
    if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null; then
        OPEN_COMMAND="explorer.exe"
    else
        OPEN_COMMAND="start"
    fi
else
    echo -e "\u26a0\ufe0f Could not determine a command to automatically open the browser."
fi

if [ ! -z "$OPEN_COMMAND" ]; then
    # Attempt to open and suppress command output for a cleaner script experience
    if $OPEN_COMMAND index.html &> /dev/null; then
        echo -e "\u2705 Successfully launched (or attempted to launch) index.html."
        echo "If the application did not open, please open 'index.html' manually in your browser."
    else
        echo -e "\u274c Failed to automatically open index.html using '$OPEN_COMMAND'."
        echo "Please open 'index.html' manually in your web browser."
    fi
else
    echo -e "\ud83d\udc49 Please open 'index.html' manually in your web browser to use 169 notes."
fi

echo ""
echo -e "\ud83d\udccc If you encounter any issues, ensure your browser has JavaScript enabled and supports Local Storage."
echo -e "\ud83c\udf89 Enjoy using 169 notes!"

exit 0
