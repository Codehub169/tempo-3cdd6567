document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.getElementById('note-form');
    const noteIdInput = document.getElementById('note-id');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const notesListContainer = document.getElementById('notes-list-container');
    const noNotesMessage = document.getElementById('no-notes-message');
    const searchBar = document.getElementById('search-bar');

    let notes = [];
    let editingNoteId = null;

    // Load notes from Local Storage
    function loadNotes() {
        const storedNotes = localStorage.getItem('quicknotes-notes');
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
        }
        renderNotes();
    }

    // Save notes to Local Storage
    function saveNotes() {
        localStorage.setItem('quicknotes-notes', JSON.stringify(notes));
    }

    // Render notes to the DOM
    function renderNotes(searchTerm = '') {
        notesListContainer.innerHTML = ''; // Clear existing notes
        
        const filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredNotes.length === 0) {
            noNotesMessage.style.display = notes.length === 0 ? 'block' : 'none'; // Show 'no notes yet' only if truly no notes
            if (notes.length > 0 && searchTerm) { // If notes exist but search yields no results
                notesListContainer.innerHTML = '<p id="no-notes-message">No notes match your search.</p>';
            }
            return;
        }
        noNotesMessage.style.display = 'none';

        filteredNotes.sort((a, b) => b.id - a.id); // Show newest first

        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note-item');
            noteElement.dataset.id = note.id;

            const title = note.title ? `<h3>${escapeHTML(note.title)}</h3>` : '';
            const content = `<p>${escapeHTML(note.content).replace(/\n/g, '<br>')}</p>`;
            const timestamp = `<span class="timestamp">${new Date(note.id).toLocaleString()}</span>`;

            noteElement.innerHTML = `
                ${title}
                ${content}
                ${timestamp}
                <div class="note-actions">
                    <button class="btn-icon btn-edit" title="Edit Note"><span class="material-icons">edit</span></button>
                    <button class="btn-icon btn-delete" title="Delete Note"><span class="material-icons">delete</span></button>
                </div>
            `;

            // Add event listeners for edit and delete buttons
            noteElement.querySelector('.btn-edit').addEventListener('click', () => startEditNote(note.id));
            noteElement.querySelector('.btn-delete').addEventListener('click', () => deleteNote(note.id));

            notesListContainer.appendChild(noteElement);
        });
    }

    // Handle form submission (Add/Update Note)
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (!content) {
            alert('Note content cannot be empty.');
            return;
        }

        if (editingNoteId) {
            // Update existing note
            const noteIndex = notes.findIndex(note => note.id === editingNoteId);
            if (noteIndex > -1) {
                notes[noteIndex].title = title;
                notes[noteIndex].content = content;
            }
        } else {
            // Add new note
            const newNote = {
                id: Date.now(), // Using timestamp as unique ID
                title: title,
                content: content
            };
            notes.push(newNote);
        }

        saveNotes();
        renderNotes(searchBar.value);
        resetForm();
    });

    // Start editing a note
    function startEditNote(id) {
        const noteToEdit = notes.find(note => note.id === id);
        if (noteToEdit) {
            editingNoteId = id;
            noteIdInput.value = id;
            noteTitleInput.value = noteToEdit.title;
            noteContentInput.value = noteToEdit.content;
            saveNoteBtn.innerHTML = '<span class="material-icons">save_as</span>Update Note';
            cancelEditBtn.style.display = 'inline-flex';
            document.getElementById('note-editor-section').scrollIntoView({ behavior: 'smooth' });
            noteTitleInput.focus();
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
            renderNotes(searchBar.value);
            if (editingNoteId === id) { // If deleting the note being edited
                resetForm();
            }
        }
    }

    // Reset form fields and state
    function resetForm() {
        editingNoteId = null;
        noteIdInput.value = '';
        noteTitleInput.value = '';
        noteContentInput.value = '';
        saveNoteBtn.innerHTML = '<span class="material-icons">save</span>Save Note';
        cancelEditBtn.style.display = 'none';
    }

    // Search/Filter notes
    searchBar.addEventListener('input', (e) => {
        renderNotes(e.target.value);
    });

    // Utility to escape HTML to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Initial load
    loadNotes();
});
