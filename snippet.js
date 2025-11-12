// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    updatePreview();
    updatePreviewTitle();
    
    // Auto-update preview on input
    document.getElementById('codeEditor').addEventListener('input', updatePreview);
    document.getElementById('snippetTitle').addEventListener('input', updatePreviewTitle);
    document.getElementById('languageSelect').addEventListener('change', () => {
        updatePreview();
        updatePreviewTitle();
    });
    
    // Theme and style controls
    document.getElementById('themeSelect').addEventListener('change', applyTheme);
    document.getElementById('bgSelect').addEventListener('change', applyBackground);
    document.getElementById('paddingSelect').addEventListener('change', applyPadding);
    document.getElementById('fontSizeSelect').addEventListener('change', applyFontSize);
    document.getElementById('watermarkInput').addEventListener('input', updateWatermark);
});

// Update Preview
function updatePreview() {
    const code = document.getElementById('codeEditor').value || '// Paste or write your code here...';
    const language = document.getElementById('languageSelect').value;
    const codePreview = document.getElementById('codePreview');
    
    codePreview.textContent = code;
    codePreview.className = `hljs language-${language}`;
    
    // Apply syntax highlighting
    if (typeof hljs !== 'undefined') {
        hljs.highlightElement(codePreview);
    }
}

// Update Preview Title
function updatePreviewTitle() {
    const title = document.getElementById('snippetTitle').value;
    const language = document.getElementById('languageSelect').value;
    const previewTitle = document.getElementById('previewTitle');
    
    if (title) {
        const fileName = title.toLowerCase().replace(/\s+/g, '_');
        const extension = getFileExtension(language);
        previewTitle.textContent = `${fileName}${extension}`;
    } else {
        const extension = getFileExtension(language);
        previewTitle.textContent = `snippet${extension}`;
    }
}

// Get file extension based on language
function getFileExtension(language) {
    const extensions = {
        javascript: '.js',
        typescript: '.ts',
        python: '.py',
        java: '.java',
        cpp: '.cpp',
        csharp: '.cs',
        html: '.html',
        css: '.css',
        ruby: '.rb',
        go: '.go',
        rust: '.rs',
        php: '.php',
        sql: '.sql'
    };
    return extensions[language] || '.txt';
}

// Copy Code
function copyCode() {
    const code = document.getElementById('codeEditor').value;
    
    if (!code.trim()) {
        showToast('No code to copy', 'error');
        return;
    }
    
    navigator.clipboard.writeText(code).then(() => {
        showToast('Code copied to clipboard! 📋');
    }).catch(() => {
        showToast('Failed to copy code', 'error');
    });
}

// Download Snippet as PNG
async function downloadSnippet(format = 'png') {
    const code = document.getElementById('codeEditor').value;
    const title = document.getElementById('snippetTitle').value;
    
    if (!code.trim()) {
        showToast('Please add some code first', 'error');
        return;
    }
    
    try {
        showToast('Generating image...');
        
        const snippetPreview = document.getElementById('snippetPreview');
        const bgSelect = document.getElementById('bgSelect').value;
        
        // Determine background color based on theme and background
        let backgroundColor = '#1e1e1e';
        if (bgSelect !== 'none') {
            backgroundColor = null; // Let gradient show
        } else {
            const themeSelect = document.getElementById('themeSelect').value;
            if (themeSelect === 'github-light') backgroundColor = '#ffffff';
            else if (themeSelect === 'dracula') backgroundColor = '#282a36';
            else if (themeSelect === 'monokai') backgroundColor = '#272822';
            else if (themeSelect === 'nord') backgroundColor = '#2e3440';
        }
        
        // Use html2canvas to capture the preview
        const canvas = await html2canvas(snippetPreview, {
            backgroundColor: backgroundColor,
            scale: 2,
            logging: false,
            onclone: (clonedDoc) => {
                const clonedPreview = clonedDoc.getElementById('snippetPreview');
                if (clonedPreview) {
                    clonedPreview.style.minHeight = 'auto';
                }
            }
        });
        
        // Convert canvas to blob and download
        if (format === 'png') {
            canvas.toBlob((blob) => {
                downloadBlob(blob, title, 'png');
            });
        } else if (format === 'jpg') {
            canvas.toBlob((blob) => {
                downloadBlob(blob, title, 'jpg');
            }, 'image/jpeg', 0.95);
        }
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('Failed to download snippet', 'error');
    }
}

function downloadBlob(blob, title, extension) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    const fileName = title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'snippet';
    link.download = `${fileName}_${timestamp}.${extension}`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast(`Snippet downloaded as ${extension.toUpperCase()}! 🎉`);
}

// Clear Editor
function clearEditor() {
    if (!confirm('Are you sure you want to clear all fields?')) {
        return;
    }
    
    document.getElementById('snippetTitle').value = '';
    document.getElementById('codeEditor').value = '';
    document.getElementById('languageSelect').value = 'javascript';
    document.getElementById('snippetTags').value = '';
    document.getElementById('themeSelect').value = 'vscode-dark';
    document.getElementById('bgSelect').value = 'none';
    document.getElementById('paddingSelect').value = '48';
    document.getElementById('fontSizeSelect').value = '14';
    document.getElementById('watermarkInput').value = '';
    
    // Reset preview
    updatePreview();
    updatePreviewTitle();
    applyTheme();
    applyBackground();
    applyPadding();
    applyFontSize();
    updateWatermark();
    
    showToast('Editor cleared');
}

// Show Toast Notification
function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
    }
    
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

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to download
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadSnippet('png');
    }
    
    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearEditor();
    }
});

// Apply Theme
function applyTheme() {
    const theme = document.getElementById('themeSelect').value;
    const preview = document.getElementById('snippetPreview');
    const bgSelect = document.getElementById('bgSelect').value;
    
    // Remove all theme classes
    preview.classList.remove('theme-vscode-dark', 'theme-dracula', 'theme-monokai', 'theme-github-light', 'theme-nord');
    
    // Add selected theme
    preview.classList.add(`theme-${theme}`);
    
    // If no gradient is selected, set the default theme background
    if (bgSelect === 'none') {
        // Remove inline background to let theme CSS take over
        preview.style.background = '';
    }
    
    // Re-apply syntax highlighting
    updatePreview();
}

// Apply Background
function applyBackground() {
    const bg = document.getElementById('bgSelect').value;
    const preview = document.getElementById('snippetPreview');
    
    // Remove all gradient classes
    preview.classList.remove('gradient1', 'gradient2', 'gradient3', 'gradient4', 'gradient5',
                             'gradient6', 'gradient7', 'gradient8', 'gradient9', 'gradient10',
                             'gradient11', 'gradient12', 'gradient13', 'gradient14', 'gradient15');
    
    // Add selected gradient
    if (bg !== 'none') {
        preview.classList.add(bg);
    } else {
        // Reset to theme default
        preview.style.background = '';
    }
}

// Apply Padding
function applyPadding() {
    const padding = document.getElementById('paddingSelect').value;
    const snippetPreview = document.getElementById('snippetPreview');
    const codePreview = snippetPreview.querySelector('pre');
    
    if (codePreview) {
        codePreview.style.padding = `${padding}px`;
    }
}

// Apply Font Size
function applyFontSize() {
    const fontSize = document.getElementById('fontSizeSelect').value;
    const codePreview = document.getElementById('codePreview');
    
    codePreview.style.fontSize = `${fontSize}px`;
}

// Update Watermark
function updateWatermark() {
    const watermarkText = document.getElementById('watermarkInput').value;
    const watermark = document.getElementById('watermark');
    
    if (watermarkText.trim()) {
        watermark.textContent = watermarkText;
        watermark.style.display = 'block';
    } else {
        watermark.style.display = 'none';
    }
}
