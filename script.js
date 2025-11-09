// Storage key
const STORAGE_KEY = 'codeSnippets';

// Current snippet being viewed
let currentSnippet = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadSnippets();
    updateNavigation();
    initializeTheme();
    updateSnippetCount();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeText(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeText(newTheme);
}

function updateThemeText(theme) {
    const themeText = document.getElementById('themeText');
    if (themeText) {
        themeText.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    }
}

// Update snippet count in hero
function updateSnippetCount() {
    const snippets = getSnippets();
    const countElement = document.getElementById('snippetCount');
    if (countElement) {
        countElement.textContent = snippets.length;
    }
}

// Navigation
function navigateTo(section) {
    // Hide all sections
    document.querySelectorAll('.hero, .section').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show selected section
    if (section === 'home') {
        document.querySelector('.hero').style.display = 'block';
    } else {
        document.getElementById(section).style.display = 'block';
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`a[href="#${section}"]`).classList.add('active');
    
    // Load snippets if navigating to snippets section
    if (section === 'snippets') {
        displaySnippets();
    }
}

// Handle nav link clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('href').substring(1);
        navigateTo(section);
    });
});

// Update navigation based on URL hash
function updateNavigation() {
    const hash = window.location.hash.substring(1) || 'home';
    navigateTo(hash);
}

window.addEventListener('hashchange', updateNavigation);

// Save snippet
function saveSnippet() {
    const title = document.getElementById('snippetTitle').value.trim();
    const code = document.getElementById('codeEditor').value.trim();
    const language = document.getElementById('languageSelect').value;
    const tags = document.getElementById('snippetTags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    // Validation
    if (!title) {
        showToast('Please add a title for your snippet', 'error');
        return;
    }
    
    if (!code) {
        showToast('Please write some code to create snippet', 'error');
        return;
    }
    
    // Create snippet object
    const snippet = {
        id: Date.now(),
        title,
        code,
        language,
        tags,
        createdAt: new Date().toISOString()
    };
    
    // Get existing snippets
    const snippets = getSnippets();
    snippets.unshift(snippet);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
    
    // Show success message
    showToast('Snippet created successfully! 🎉');
    
    // Update count
    updateSnippetCount();
    
    // Open the snippet in modal to allow download
    setTimeout(() => {
        currentSnippet = snippet;
        openSnippetForDownload(snippet);
        clearEditor();
    }, 500);
}

// Clear editor
function clearEditor() {
    document.getElementById('snippetTitle').value = '';
    document.getElementById('codeEditor').value = '';
    document.getElementById('languageSelect').value = 'javascript';
    document.getElementById('snippetTags').value = '';
}

// Get snippets from localStorage
function getSnippets() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Load snippets
function loadSnippets() {
    const snippets = getSnippets();
    
    // Add sample snippets if none exist
    if (snippets.length === 0) {
        const sampleSnippets = [
            {
                id: 1,
                title: 'React Custom Hook - useLocalStorage',
                code: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}`,
                language: 'javascript',
                tags: ['react', 'hooks', 'custom-hook', 'localstorage'],
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Python Decorator for Timing Functions',
                code: `import time
from functools import wraps

def timing_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f}s")
        return result
    return wrapper

@timing_decorator
def slow_function():
    time.sleep(2)
    return "Done!"`,
                language: 'python',
                tags: ['python', 'decorator', 'performance', 'timing'],
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 3,
                title: 'CSS Grid - Responsive Card Layout',
                code: `.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
}`,
                language: 'css',
                tags: ['css', 'grid', 'responsive', 'layout'],
                createdAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSnippets));
    }
}

// Display snippets
function displaySnippets() {
    const snippets = getSnippets();
    const container = document.getElementById('snippetsList');
    const emptyState = document.getElementById('emptyState');
    
    if (snippets.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = snippets.map(snippet => `
        <div class="snippet-card" onclick="openSnippet(${snippet.id})">
            <h3>${escapeHtml(snippet.title)}</h3>
            <div class="snippet-meta">
                <span class="language-badge">${escapeHtml(snippet.language)}</span>
                <span class="date">${formatDate(snippet.createdAt)}</span>
            </div>
            <div class="snippet-preview">
                <code>${escapeHtml(snippet.code.substring(0, 200))}${snippet.code.length > 200 ? '...' : ''}</code>
            </div>
            ${snippet.tags.length > 0 ? `
                <div class="tags-container">
                    ${snippet.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Filter snippets
function filterSnippets() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const snippets = getSnippets();
    
    const filtered = snippets.filter(snippet => 
        snippet.title.toLowerCase().includes(searchTerm) ||
        snippet.code.toLowerCase().includes(searchTerm) ||
        snippet.language.toLowerCase().includes(searchTerm) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    const container = document.getElementById('snippetsList');
    const emptyState = document.getElementById('emptyState');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><h3>No snippets found</h3><p>Try a different search term</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(snippet => `
        <div class="snippet-card" onclick="openSnippet(${snippet.id})">
            <h3>${escapeHtml(snippet.title)}</h3>
            <div class="snippet-meta">
                <span class="language-badge">${escapeHtml(snippet.language)}</span>
                <span class="date">${formatDate(snippet.createdAt)}</span>
            </div>
            <div class="snippet-preview">
                <code>${escapeHtml(snippet.code.substring(0, 200))}${snippet.code.length > 200 ? '...' : ''}</code>
            </div>
            ${snippet.tags.length > 0 ? `
                <div class="tags-container">
                    ${snippet.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Open snippet in modal
function openSnippet(id) {
    const snippets = getSnippets();
    const snippet = snippets.find(s => s.id === id);
    
    if (!snippet) return;
    
    currentSnippet = snippet;
    
    document.getElementById('modalTitle').textContent = snippet.title;
    document.getElementById('modalLanguage').textContent = snippet.language;
    document.getElementById('modalDate').textContent = formatDate(snippet.createdAt);
    
    const tagsContainer = document.getElementById('modalTags');
    if (snippet.tags.length > 0) {
        tagsContainer.innerHTML = snippet.tags.map(tag => 
            `<span class="tag">${escapeHtml(tag)}</span>`
        ).join('');
        tagsContainer.style.marginBottom = '16px';
    } else {
        tagsContainer.innerHTML = '';
        tagsContainer.style.marginBottom = '0';
    }
    
    const codeElement = document.getElementById('modalCode');
    codeElement.textContent = snippet.code;
    codeElement.className = `hljs language-${snippet.language}`;
    
    // Apply syntax highlighting
    if (window.hljs) {
        hljs.highlightElement(codeElement);
    }
    
    document.getElementById('snippetModal').classList.add('active');
}

// Open snippet for download after creation
function openSnippetForDownload(snippet) {
    currentSnippet = snippet;
    
    document.getElementById('modalTitle').textContent = snippet.title;
    document.getElementById('modalLanguage').textContent = snippet.language;
    document.getElementById('modalDate').textContent = formatDate(snippet.createdAt);
    
    const tagsContainer = document.getElementById('modalTags');
    if (snippet.tags.length > 0) {
        tagsContainer.innerHTML = snippet.tags.map(tag => 
            `<span class="tag">${escapeHtml(tag)}</span>`
        ).join('');
        tagsContainer.style.marginBottom = '16px';
    } else {
        tagsContainer.innerHTML = '';
        tagsContainer.style.marginBottom = '0';
    }
    
    const codeElement = document.getElementById('modalCode');
    codeElement.textContent = snippet.code;
    codeElement.className = `hljs language-${snippet.language}`;
    
    // Apply syntax highlighting
    if (window.hljs) {
        hljs.highlightElement(codeElement);
    }
    
    // Hide all sections first
    document.querySelectorAll('.hero, .section').forEach(el => {
        el.style.display = 'none';
    });
    
    document.getElementById('snippetModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('snippetModal').classList.remove('active');
    currentSnippet = null;
}

// Close modal when clicking outside
document.getElementById('snippetModal').addEventListener('click', (e) => {
    if (e.target.id === 'snippetModal') {
        closeModal();
    }
});

// Copy code
function copyCode() {
    if (!currentSnippet) return;
    
    navigator.clipboard.writeText(currentSnippet.code).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
            Copied!
        `;
        
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

// Download snippet as PNG
async function downloadSnippet() {
    if (!currentSnippet) return;
    
    try {
        // Show loading toast
        showToast('Generating image...', 'success');
        
        const codeContainer = document.getElementById('snippetCodeContainer');
        
        // Use html2canvas to capture the code snippet
        const canvas = await html2canvas(codeContainer, {
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
            scale: 2,
            logging: false,
            windowWidth: codeContainer.scrollWidth,
            windowHeight: codeContainer.scrollHeight
        });
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            const fileName = currentSnippet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${fileName}_${timestamp}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            showToast('Snippet downloaded! 🎉', 'success');
        });
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('Failed to download snippet', 'error');
    }
}

// Delete snippet
function deleteSnippet() {
    if (!currentSnippet) return;
    
    if (!confirm('Are you sure you want to delete this snippet?')) {
        return;
    }
    
    const snippets = getSnippets();
    const filtered = snippets.filter(s => s.id !== currentSnippet.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    closeModal();
    displaySnippets();
    updateSnippetCount();
    showToast('Snippet deleted successfully');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = type === 'error' ? '#EF4444' : '#10B981';
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            return minutes === 0 ? 'Just now' : `${minutes}m ago`;
        }
        return `${hours}h ago`;
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days}d ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close modal
    if (e.key === 'Escape' && document.getElementById('snippetModal').classList.contains('active')) {
        closeModal();
    }
    
    // Ctrl/Cmd + S to save snippet (when on create page)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        const createSection = document.getElementById('create');
        if (createSection && createSection.style.display !== 'none') {
            e.preventDefault();
            saveSnippet();
        }
    }
});
