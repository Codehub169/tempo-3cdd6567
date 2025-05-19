#!/bin/bash

# QuickNotes Application Startup Script
# This script attempts to open the QuickNotes application in your default web browser.

# Indicate script execution
echo "🚀 Starting QuickNotes Application..."

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found in the current directory."
    echo "Please ensure you are in the root directory of the QuickNotes project."
    exit 1
fi

# Provide instructions to the user
echo "📝 QuickNotes is a client-side application."
echo "It runs directly in your web browser using HTML, CSS, and JavaScript."
echo "No server or build process is required."
echo ""
echo "✨ Attempting to open index.html in your default browser..."

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
    echo "⚠️ Could not determine a command to automatically open the browser."
fi

if [ ! -z "$OPEN_COMMAND" ]; then
    if $OPEN_COMMAND index.html; then
        echo "✅ Successfully launched (or attempted to launch) index.html."
        echo "If the application did not open, please open 'index.html' manually in your browser."
    else
        echo "❌ Failed to automatically open index.html using '$OPEN_COMMAND'."
        echo "Please open 'index.html' manually in your web browser."
    fi
else
    echo "👉 Please open 'index.html' manually in your web browser to use QuickNotes."
fi

echo ""
echo "📌 If you encounter any issues, ensure your browser has JavaScript enabled and supports Local Storage."
echo "🎉 Enjoy using QuickNotes!"

exit 0
