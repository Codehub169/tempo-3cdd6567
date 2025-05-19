document.addEventListener('DOMContentLoaded', () => {
    'use strict'; // Enforce stricter parsing and error handling

    const noteForm = document.getElementById('note-form');
    const noteIdInput = document.getElementById('note-id'); // Hidden input for note ID being edited
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const notesListContainer = document.getElementById('notes-list-container');
    const noNotesMessage = document.getElementById('no-notes-message'); // Message for empty states
    const searchBar = document.getElementById('search-bar');

    let notes = [];
    let editingNoteId = null; // null if creating new, or ID of note being edited

    // Load notes from Local Storage
    function loadNotes() {
        try {
            const storedNotes = localStorage.getItem('169notes-notes');
            if (storedNotes) {
                notes = JSON.parse(storedNotes);
            }
        } catch (e) {
            console.error("Error loading notes from localStorage:", e);
            notes = []; // Initialize with empty array on error
            // Optionally, inform user: alert("Could not load saved notes. LocalStorage might be corrupted or inaccessible.");
        }
        renderNotes(); // Render notes after loading
    }

    // Save notes to Local Storage
    function saveNotes() {
        try {
            localStorage.setItem('169notes-notes', JSON.stringify(notes));
        } catch (e) {
            console.error("Error saving notes to localStorage:", e);
            alert("Could not save notes. LocalStorage might be full or disabled.");
        }
    }

    // Render notes to the DOM
    function renderNotes(searchTerm = '') {
        notesListContainer.innerHTML = ''; // Clear existing notes from container

        const normalizedSearchTerm = (searchTerm || '').trim().toLowerCase();

        const filteredNotes = notes.filter(note =>
            (note.title || '').toLowerCase().includes(normalizedSearchTerm) ||
            (note.content || '').toLowerCase().includes(normalizedSearchTerm) // Content is required, but check for safety
        );

        if (filteredNotes.length === 0) {
            if (notes.length === 0) {
                noNotesMessage.textContent = 'No notes yet. Create one!';
                noNotesMessage.style.display = 'block';
            } else if (normalizedSearchTerm) { // Notes exist, but search yielded no results
                noNotesMessage.textContent = 'No notes match your search.';
                noNotesMessage.style.display = 'block';
            } else {
                // Notes exist, no search term, but all notes are effectively empty or filtered out.
                // This case implies all existing notes have content that doesn't match an empty search string (e.g. all are empty or whitespace).
                noNotesMessage.style.display = 'none'; 
            }
            return;
        }
        noNotesMessage.style.display = 'none'; // Hide message if there are notes to display

        // Sort newest first by ID (timestamp)
        filteredNotes.sort((a, b) => b.id - a.id);

        const fragment = document.createDocumentFragment(); // Use DocumentFragment for performance
        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note-item');
            noteElement.dataset.id = note.id;

            const titleHTML = note.title ? `<h3>${escapeHTML(note.title)}</h3>` : '';
            const contentHTML = `<p>${escapeHTML(String(note.content)).replace(/\n/g, '<br>')}</p>`;
            const timestampHTML = `<span class="timestamp">${new Date(note.id).toLocaleString()}</span>`;

            noteElement.innerHTML = `
                ${titleHTML}
                ${contentHTML}
                ${timestampHTML}
                <div class="note-actions">
                    <button class="btn-icon btn-edit" title="Edit Note"><span class="material-icons">edit</span></button>
                    <button class="btn-icon btn-delete" title="Delete Note"><span class="material-icons">delete</span></button>
                </div>
            `;

            noteElement.querySelector('.btn-edit').addEventListener('click', () => startEditNote(note.id));
            noteElement.querySelector('.btn-delete').addEventListener('click', () => deleteNote(note.id));

            fragment.appendChild(noteElement);
        });
        notesListContainer.appendChild(fragment); // Append all notes at once
    }

    // Handle form submission (Add/Update Note)
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (!content) {
            alert('Note content cannot be empty.');
            noteContentInput.focus(); // Focus on content field for user correction
            return;
        }

        if (editingNoteId) {
            // Update existing note
            const noteIndex = notes.findIndex(note => note.id === editingNoteId);
            if (noteIndex > -1) {
                notes[noteIndex].title = title;
                notes[noteIndex].content = content;
                // notes[noteIndex].lastModified = Date.now(); // Optional: track modification time
            }
        } else {
            // Add new note
            const newNote = {
                id: Date.now(), // Using timestamp as unique ID
                title: title,
                content: content
                // createdAt: Date.now() // Optional: track creation time
            };
            notes.push(newNote);
        }

        saveNotes();
        renderNotes(searchBar.value.trim()); // Re-render with current search term
        resetForm();
    });

    // Start editing a note
    function startEditNote(id) {
        const noteToEdit = notes.find(note => note.id === id);
        if (noteToEdit) {
            editingNoteId = id;
            noteIdInput.value = id; // Set hidden ID field
            noteTitleInput.value = noteToEdit.title;
            noteContentInput.value = noteToEdit.content;
            saveNoteBtn.innerHTML = '<span class="material-icons">save_as</span>Update Note';
            cancelEditBtn.style.display = 'inline-flex'; // Show cancel button
            document.getElementById('note-editor-section').scrollIntoView({ behavior: 'smooth' });
            noteContentInput.focus(); // Focus on content for editing (title is optional)
        }
    }

    // Cancel editing
    cancelEditBtn.addEventListener('click', () => {
        resetForm();
    });

    // Delete a note
    function deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== id);
            saveNotes();
            renderNotes(searchBar.value.trim()); // Re-render with current search term
            if (editingNoteId === id) { // If deleting the note currently being edited
                resetForm();
            }
        }
    }

    // Reset form fields and state
    function resetForm() {
        editingNoteId = null;
        noteForm.reset(); // Efficiently resets all form fields to initial values
        saveNoteBtn.innerHTML = '<span class="material-icons">save</span>Save Note';
        cancelEditBtn.style.display = 'none';
    }

    // Search/Filter notes (debounced for performance)
    let searchTimeout;
    searchBar.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderNotes(e.target.value.trim());
        }, 250); // 250ms delay
    });

    // Utility to escape HTML to prevent XSS
    function escapeHTML(str) {
        const element = document.createElement('p'); // Using 'p' or 'div'
        element.textContent = str; // textContent automatically escapes HTML special characters
        return element.innerHTML;
    }

    // Initial load of notes when the DOM is ready
    loadNotes();
});
