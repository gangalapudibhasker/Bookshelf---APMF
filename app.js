/* ==========================================================================
   APMF BOOKSHELF BUSINESS LOGIC - app.js
   ========================================================================== */

// 1. Initial State & Setup
const DEFAULT_PASSCODE = "APMF2026"; // Default passcode for admin panel
let books = [];
let activeClassFilter = "all";
let currentSearchQuery = "";
let editingBookId = null;
let isAdminAuthenticated = false;

// Supabase Connection Configurations
const SUPABASE_URL = "https://uelnmcbwicwheancmgcu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG5tY2J3aWN3aGVhbmNtZ2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDA4ODgsImV4cCI6MjA5NDM3Njg4OH0.IQ8YFiofOeW0Vs_FI_w01pKf56YNe8qorJXa__7RR4I";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let coverInputMethod = "upload"; // EITHER "upload" OR "url"
// Realistic Andhra Pradesh Math textbooks data loaded if LocalStorage is empty
const INITIAL_BOOKS = [
    {
        id: "book-1",
        title: "Class 6 Mathematics SCERT (English Medium)",
        gradeClass: "6",
        medium: "English",
        coverUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21102&authkey=AHx39NmsB6W8u1I"
    },
    {
        id: "book-2",
        title: "Class 6 Ganitham SCERT (Telugu Medium)",
        gradeClass: "6",
        medium: "Telugu",
        coverUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21103&authkey=AIp9_KmsC8X9u2J"
    },
    {
        id: "book-3",
        title: "Class 7 Mathematics SCERT (English Medium)",
        gradeClass: "7",
        medium: "English",
        coverUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21104&authkey=AJz09NmsD9W0u3K"
    },
    {
        id: "book-4",
        title: "Class 7 Ganitham SCERT (Telugu Medium)",
        gradeClass: "7",
        medium: "Telugu",
        coverUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21105&authkey=AKq0_LmsE0Y0u4L"
    },
    {
        id: "book-5",
        title: "Class 8 Mathematics SCERT (English Medium)",
        gradeClass: "8",
        medium: "English",
        coverUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21106&authkey=ALr1_MmsF1Z1u5M"
    },
    {
        id: "book-6",
        title: "Class 8 Ganitham SCERT (Telugu Medium)",
        gradeClass: "8",
        medium: "Telugu",
        coverUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21107&authkey=AMs2_NmsG2a2u6N"
    },
    {
        id: "book-7",
        title: "Class 9 Mathematics SCERT (English Medium)",
        gradeClass: "9",
        medium: "English",
        coverUrl: "https://images.unsplash.com/photo-1453733190148-c44698c265f8?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21108&authkey=ANt3_OmsH3b3u7O"
    },
    {
        id: "book-8",
        title: "Class 9 Ganitham SCERT (Telugu Medium)",
        gradeClass: "9",
        medium: "Telugu",
        coverUrl: "https://images.unsplash.com/photo-1453733190148-c44698c265f8?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21109&authkey=AOu4_PmsI4c4u8P"
    },
    {
        id: "book-9",
        title: "Class 10 SCERT Mathematics Textbook (English Medium)",
        gradeClass: "10",
        medium: "English",
        coverUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21110&authkey=APv5_QmsJ5d5u9Q"
    },
    {
        id: "book-10",
        title: "Class 10 SCERT Ganitham Padhyapusthakam (Telugu Medium)",
        gradeClass: "10",
        medium: "Telugu",
        coverUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21111&authkey=AQw6_RmsK6e6u0R"
    },
    {
        id: "book-11",
        title: "Intermediate Math Class 11 - Paper IA (Algebra & Trigonometry)",
        gradeClass: "11",
        medium: "English",
        coverUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21112&authkey=ARx7_SmsL7f7u1S"
    },
    {
        id: "book-12",
        title: "Intermediate Math Class 11 - Paper IB (Calculus & Coordinate Geometry)",
        gradeClass: "11",
        medium: "English",
        coverUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21113&authkey=ASy8_TmsM8g8u2T"
    },
    {
        id: "book-13",
        title: "Intermediate Math Class 12 - Paper IIA (Complex Numbers & Probability)",
        gradeClass: "12",
        medium: "English",
        coverUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848c?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21114&authkey=ATz9_UmsN9h9u3U"
    },
    {
        id: "book-14",
        title: "Intermediate Math Class 12 - Paper IIB (Integration & Coordinate Geometry II)",
        gradeClass: "12",
        medium: "English",
        coverUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848c?auto=format&fit=crop&q=80&w=400",
        bookUrl: "https://onedrive.live.com/embed?cid=9C6E1E4F98E2A7CD&resid=9C6E1E4F98E2A7CD%21115&authkey=AUa0_VmsO0i0u4V"
    }
];

// 2. DOM Elements Cache
const DOM = {
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    quickAdminBtn: document.getElementById('quick-admin-btn'),
    footerAdminLink: document.getElementById('footer-admin-link'),

    // Search
    bookSearchInput: document.getElementById('book-search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),

    // Displays
    booksGridContainer: document.getElementById('books-grid-container'),
    currentSectionTitle: document.getElementById('current-section-title'),
    resultsIndicator: document.getElementById('results-indicator'),
    noBooksEmptyState: document.getElementById('no-books-empty-state'),

    // Admin Login Modal
    adminLoginModal: document.getElementById('admin-login-modal'),
    adminLoginForm: document.getElementById('admin-login-form'),
    adminPasscode: document.getElementById('admin-passcode'),
    togglePasscodeVisibility: document.getElementById('toggle-passcode-visibility'),
    loginErrorMsg: document.getElementById('login-error-msg'),

    // Admin Dashboard Modal
    adminDashboardModal: document.getElementById('admin-dashboard-modal'),
    adminLogoutBtn: document.getElementById('admin-logout-btn'),
    bookEntryForm: document.getElementById('book-entry-form'),
    editBookId: document.getElementById('edit-book-id'),
    bookTitleInput: document.getElementById('book-title-input'),
    bookClassSelect: document.getElementById('book-class-select'),
    bookMediumSelect: document.getElementById('book-medium-select'),
    bookCoverUrl: document.getElementById('book-cover-url'),
    btnChoiceUpload: document.getElementById('btn-choice-upload'),
    btnChoiceUrl: document.getElementById('btn-choice-url'),
    coverUploadWrapper: document.getElementById('cover-upload-wrapper'),
    coverUrlWrapper: document.getElementById('cover-url-wrapper'),
    bookCoverFile: document.getElementById('book-cover-file'),
    selectedFileBanner: document.getElementById('selected-file-banner'),
    selectedFileName: document.getElementById('selected-file-name'),
    bookOneDriveUrl: document.getElementById('book-onedrive-url'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    saveBookBtn: document.getElementById('save-book-btn'),
    formActionTitle: document.getElementById('form-action-title'),

    // Live Preview
    liveCoverPreview: document.getElementById('live-cover-preview'),
    previewImageContainer: document.getElementById('preview-image-container'),
    previewTitleText: document.getElementById('preview-title-text'),
    previewClassBadge: document.getElementById('preview-class-badge'),

    // Admin List
    adminSearchInput: document.getElementById('admin-search-input'),
    adminBooksListRows: document.getElementById('admin-books-list-rows'),
    adminNoRecords: document.getElementById('admin-no-records'),

    // Toast Notification
    toastNotification: document.getElementById('toast-notification'),
    toastIconHolder: document.getElementById('toast-icon-holder'),
    toastTitle: document.getElementById('toast-title'),
    toastMessage: document.getElementById('toast-message'),

    // Tabs container
    classTabs: document.querySelectorAll('.class-tab')
};

// 3. Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadBooksDatabase();
    setupTheme();
    initializeEventListeners();
    updateUi();
});

// 4. Load Data from LocalStorage
function loadBooksDatabase() {
    const savedBooks = localStorage.getItem('apmf_bookshelf_db');
    if (savedBooks) {
        try {
            books = JSON.parse(savedBooks);
        } catch (e) {
            console.error("Failed to parse local storage book records. Loading defaults.", e);
            books = [...INITIAL_BOOKS];
            saveBooksDatabase();
        }
    } else {
        // First run initialization
        books = [...INITIAL_BOOKS];
        saveBooksDatabase();
    }
}

function saveBooksDatabase() {
    localStorage.setItem('apmf_bookshelf_db', JSON.stringify(books));
}

// 5. Theme Settings (Light/Dark mode)
function setupTheme() {
    const savedTheme = localStorage.getItem('apmf_theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        DOM.themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        DOM.themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        DOM.themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('apmf_theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        DOM.themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('apmf_theme', 'dark');
    }
}

// 6. OneDrive Link Redirection Logic
/**
 * Advanced Link Converter: Automatically converts OneDrive share links to high-performance direct streaming URLs
 * e.g., converts "https://1drv.ms/b/s!AnL2..." or "https://onedrive.live.com/redir?resid=..."
 * into raw direct resource links or clean embeds.
 */
function formatOneDriveUrl(url) {
    if (!url) return '';
    url = url.trim();

    // If it's already structured as direct, embed, or download link, return it as is
    if (url.includes('api.onedrive.com') || url.includes('/embed') || url.includes('download=1')) {
        return url;
    }

    try {
        // Case 1: Short OneDrive links (e.g., https://1drv.ms/b/s!AnL2...)
        if (url.includes('1drv.ms')) {
            // Short share URLs are encoded using Base64
            // Formula: Take the URL -> convert to safe base64 -> prepend u! -> request root content from api.onedrive.com
            let cleanUrl = url.split('?')[0]; // Remove query strings
            let encodedStr = btoa(unescape(encodeURIComponent(cleanUrl)));
            let safeBase64 = encodedStr
                .replace(/=/g, '')
                .replace(/\//g, '_')
                .replace(/\+/g, '-');
            return `https://api.onedrive.com/v1.0/shares/u!${safeBase64}/root/content`;
        }

        // Case 2: Standard personal OneDrive sharing URL
        // e.g., https://onedrive.live.com/redir?resid=XXX&authkey=YYY
        if (url.includes('onedrive.live.com')) {
            if (url.includes('resid=')) {
                // Check if it is a view link, replace "/redir" or "/embed" with "/download"
                let directUrl = url.replace('/redir', '/download').replace('/embed', '/download');
                if (!directUrl.includes('download=1')) {
                    directUrl += directUrl.includes('?') ? '&download=1' : '?download=1';
                }
                return directUrl;
            }
        }
    } catch (e) {
        console.error("OneDrive URL converter failed: ", e);
    }

    return url;
}

// 7. Event Listeners Initializer
function initializeEventListeners() {
    // Theme Switcher
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Search Bar input with debouncing to prevent UI freeze on very slow machines
    let searchTimeout;
    DOM.bookSearchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim().toLowerCase();

        if (currentSearchQuery) {
            DOM.clearSearchBtn.style.display = 'block';
        } else {
            DOM.clearSearchBtn.style.display = 'none';
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateUi();
        }, 150); // Fast 150ms debounce
    });

    // Clear search
    DOM.clearSearchBtn.addEventListener('click', () => {
        DOM.bookSearchInput.value = '';
        currentSearchQuery = '';
        DOM.clearSearchBtn.style.display = 'none';
        updateUi();
        DOM.bookSearchInput.focus();
    });

    // Reset Filters from Empty state
    DOM.resetFiltersBtn.addEventListener('click', () => {
        DOM.bookSearchInput.value = '';
        currentSearchQuery = '';
        DOM.clearSearchBtn.style.display = 'none';
        activeClassFilter = 'all';
        DOM.classTabs.forEach(tab => {
            if (tab.dataset.class === 'all') tab.classList.add('active');
            else tab.classList.remove('active');
        });
        updateUi();
    });

    // Tab Navigation
    DOM.classTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Find class-tab element even if child span is clicked
            const tabBtn = e.target.closest('.class-tab');
            DOM.classTabs.forEach(t => t.classList.remove('active'));
            tabBtn.classList.add('active');
            activeClassFilter = tabBtn.dataset.class;
            updateUi();
        });
    });

    // Admin access modal buttons
    if (DOM.quickAdminBtn) {
        DOM.quickAdminBtn.addEventListener('click', openAdminLoginModal);
    }
    if (DOM.footerAdminLink) {
        DOM.footerAdminLink.addEventListener('click', (e) => {
            e.preventDefault();
            openAdminLoginModal();
        });
    }

    // Passcode visibility button
    DOM.togglePasscodeVisibility.addEventListener('click', () => {
        const type = DOM.adminPasscode.getAttribute('type') === 'password' ? 'text' : 'password';
        DOM.adminPasscode.setAttribute('type', type);
        DOM.togglePasscodeVisibility.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    });

    // Admin Login submission
    DOM.adminLoginForm.addEventListener('submit', handleAdminLogin);

    // Admin Logout
    DOM.adminLogoutBtn.addEventListener('click', logoutAdmin);

    // Premium Cover image input method toggles
    DOM.btnChoiceUpload.addEventListener('click', () => {
        coverInputMethod = 'upload';
        DOM.btnChoiceUpload.classList.add('active');
        DOM.btnChoiceUrl.classList.remove('active');
        DOM.coverUploadWrapper.style.display = 'block';
        DOM.coverUrlWrapper.style.display = 'none';
        DOM.bookCoverUrl.required = false;
        handleFormPreviewUpdate();
    });

    DOM.btnChoiceUrl.addEventListener('click', () => {
        coverInputMethod = 'url';
        DOM.btnChoiceUrl.classList.add('active');
        DOM.btnChoiceUpload.classList.remove('active');
        DOM.coverUrlWrapper.style.display = 'block';
        DOM.coverUploadWrapper.style.display = 'none';
        DOM.bookCoverUrl.required = true;
        handleFormPreviewUpdate();
    });

    // File change reader preview selection
    DOM.bookCoverFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            DOM.selectedFileName.textContent = file.name;
            DOM.selectedFileBanner.style.display = 'flex';
            
            // Render local reader file preview
            const reader = new FileReader();
            reader.onload = (event) => {
                DOM.liveCoverPreview.src = event.target.result;
                DOM.liveCoverPreview.style.display = 'block';
                
                const placeholder = DOM.previewImageContainer.querySelector('.preview-placeholder');
                if (placeholder) placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            DOM.selectedFileBanner.style.display = 'none';
            handlePreviewError();
        }
    });

    // Live Previews for form additions
    DOM.bookCoverUrl.addEventListener('input', handleFormPreviewUpdate);
    DOM.bookTitleInput.addEventListener('input', handleFormPreviewUpdate);
    DOM.bookClassSelect.addEventListener('change', handleFormPreviewUpdate);

    // CRUD Book Form Submit
    DOM.bookEntryForm.addEventListener('submit', handleBookFormSubmit);

    // Cancel Edit Mode
    DOM.cancelEditBtn.addEventListener('click', resetBookForm);

    // Admin search list search box
    DOM.adminSearchInput.addEventListener('input', (e) => {
        renderAdminBooksList(e.target.value.trim().toLowerCase());
    });

    // Listen to hash router for /admin direct access
    window.addEventListener('hashchange', checkHashRouter);
    checkHashRouter(); // Check on init
}

// 8. Hash routing router helper
function checkHashRouter() {
    if (window.location.hash === '#admin') {
        // Trigger admin login
        openAdminLoginModal();
    }
}

// 9. Main Render Logic
function updateUi() {
    // 1. Filter books based on active tab class AND search query
    let filteredBooks = books.filter(book => {
        const matchesClass = activeClassFilter === 'all' || book.gradeClass === activeClassFilter;

        const titleMatch = book.title.toLowerCase().includes(currentSearchQuery);
        const mediumMatch = book.medium.toLowerCase().includes(currentSearchQuery);
        const classMatch = `class ${book.gradeClass}`.includes(currentSearchQuery);
        const matchesSearch = titleMatch || mediumMatch || classMatch;

        return matchesClass && matchesSearch;
    });

    // 2. Render main cards grid
    renderBooksGrid(filteredBooks);

    // 3. Update tab count numbers dynamically
    updateClassTabsCount();

    // 4. Update Header Indicator
    const sectionName = activeClassFilter === 'all' ? 'All Classes' : `Class ${activeClassFilter}`;
    DOM.currentSectionTitle.textContent = `${sectionName} Mathematics Textbooks`;

    if (currentSearchQuery) {
        DOM.resultsIndicator.textContent = `Found ${filteredBooks.length} result(s) for "${currentSearchQuery}"`;
    } else {
        DOM.resultsIndicator.textContent = `Displaying ${filteredBooks.length} textbooks`;
    }
}

// Draw dynamic grid cards
function renderBooksGrid(booksToRender) {
    DOM.booksGridContainer.innerHTML = '';

    if (booksToRender.length === 0) {
        DOM.booksGridContainer.style.display = 'none';
        DOM.noBooksEmptyState.style.display = 'block';
        return;
    }

    DOM.booksGridContainer.style.display = 'grid';
    DOM.noBooksEmptyState.style.display = 'none';

    booksToRender.forEach(book => {
        const card = document.createElement('article');
        card.className = 'book-card';
        card.id = `book-card-${book.id}`;

        // Convert the OneDrive link to direct/embed dynamic link
        const rawOneDriveLink = book.bookUrl;
        const formattedOneDriveLink = formatOneDriveUrl(rawOneDriveLink);

        // Math character symbol fallback selector based on class number
        const symbols = ['∑', '√', 'π', '∞', '∫', '∆', 'θ'];
        const classIndex = (parseInt(book.gradeClass) || 6) - 6;
        const mathSymbol = symbols[classIndex % symbols.length];

        card.innerHTML = `
            <div class="card-cover-wrapper">
                <span class="card-math-accent" title="Grade Mathematical Accent">${mathSymbol}</span>
                <img src="${book.coverUrl}" alt="Cover of ${book.title}" loading="lazy" onerror="handleCoverLoadError(this, '${mathSymbol}')">
            </div>
            <div class="card-details">
                <div class="card-meta">
                    <span class="badge badge-class">Class ${book.gradeClass}</span>
                    <span class="badge badge-medium">${book.medium} Medium</span>
                </div>
                <h4 class="card-title" title="${book.title}">${book.title}</h4>
                <div class="card-actions">
                    <a href="${formattedOneDriveLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-open-book">
                        <i class="fa-solid fa-book-open-reader"></i> Open Book
                    </a>
                </div>
            </div>
        `;

        DOM.booksGridContainer.appendChild(card);
    });
}

// Cover image error handler: automatically generates a beautiful math geometric gradient fallback
function handleCoverLoadError(imgEl, mathSymbol) {
    const parent = imgEl.parentElement;
    parent.innerHTML = `
        <span class="card-math-accent">${mathSymbol}</span>
        <div class="cover-img-placeholder" style="
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            color: #ffffff;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
        ">
            <span style="font-size: 3rem; font-weight: 700; opacity: 0.15; position: absolute;">${mathSymbol}</span>
            <i class="fa-solid fa-calculator" style="font-size: 2.2rem; color: #a5b4fc; margin-bottom: 8px;"></i>
            <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">APMF Math</span>
            <span style="font-size: 0.6rem; opacity: 0.7; margin-top: 4px;">Direct Cover Link Offline</span>
        </div>
    `;
}

// Calculate textbook totals per class dynamically
function updateClassTabsCount() {
    // 1. Total Count
    document.getElementById('count-all').textContent = books.length;

    // 2. Class-specific counts
    for (let c = 6; c <= 12; c++) {
        const classCount = books.filter(book => book.gradeClass === c.toString()).length;
        document.getElementById(`count-${c}`).textContent = classCount;
    }
}

// 10. Admin Authentication Modal Controls
function openAdminLoginModal() {
    DOM.adminPasscode.value = '';
    DOM.loginErrorMsg.style.display = 'none';
    DOM.adminLoginModal.style.display = 'flex';
    DOM.adminPasscode.focus();
}

function closeAdminLoginModal() {
    DOM.adminLoginModal.style.display = 'none';
    // Clear URL hashes safely
    if (window.location.hash === '#admin') {
        history.replaceState(null, null, ' ');
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const enteredPass = DOM.adminPasscode.value;

    if (enteredPass === DEFAULT_PASSCODE) {
        closeAdminLoginModal();
        openAdminDashboard();
        showToast("Success", "Authenticated successfully! Opened Admin Dashboard.", "success");
    } else {
        DOM.loginErrorMsg.style.display = 'flex';
        DOM.adminPasscode.value = '';
        DOM.adminPasscode.focus();
        showToast("Access Denied", "Incorrect admin security credentials entered.", "error");
    }
}

// 11. Admin Panel Dashboard Controls
function openAdminDashboard() {
    DOM.adminDashboardModal.style.display = 'flex';
    resetBookForm();
    renderAdminBooksList();
}

function closeAdminDashboard() {
    DOM.adminDashboardModal.style.display = 'none';
}

function logoutAdmin() {
    closeAdminDashboard();
    showToast("Session Ended", "Logged out of admin panel successfully.", "success");
}

// Form dynamic preview updates
function handleFormPreviewUpdate() {
    const titleVal = DOM.bookTitleInput.value.trim();
    const classVal = DOM.bookClassSelect.value;
    const coverUrlVal = DOM.bookCoverUrl.value.trim();

    // Update preview title
    DOM.previewTitleText.textContent = titleVal || "Book Title Preview";

    // Update class badge
    if (classVal) {
        DOM.previewClassBadge.textContent = `Class ${classVal}`;
        DOM.previewClassBadge.className = "badge badge-class";
    } else {
        DOM.previewClassBadge.textContent = "Class -";
        DOM.previewClassBadge.className = "badge";
    }

    // Cover Image update preview
    if (coverUrlVal && coverUrlVal.startsWith("http")) {
        DOM.liveCoverPreview.src = coverUrlVal;
        DOM.liveCoverPreview.style.display = 'block';

        // Hide form placeholder frame
        const placeholder = DOM.previewImageContainer.querySelector('.preview-placeholder');
        if (placeholder) placeholder.style.display = 'none';
    } else {
        handlePreviewError();
    }
}

function handlePreviewError() {
    DOM.liveCoverPreview.style.display = 'none';

    // Check if placeholder exists already
    let placeholder = DOM.previewImageContainer.querySelector('.preview-placeholder');
    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.className = 'preview-placeholder';
        placeholder.innerHTML = `
            <i class="fa-solid fa-image"></i>
            <span>Waiting for valid URL...</span>
        `;
        DOM.previewImageContainer.appendChild(placeholder);
    }
    placeholder.style.display = 'flex';
}

// Reset admin fields
function resetBookForm() {
    editingBookId = null;
    DOM.bookEntryForm.reset();
    DOM.editBookId.value = '';
    DOM.formActionTitle.textContent = "Add New Textbook Entry";
    DOM.saveBookBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Book Entry';
    DOM.cancelEditBtn.style.display = 'none';
    DOM.selectedFileBanner.style.display = 'none';
    
    // Default back to file upload mode
    coverInputMethod = 'upload';
    DOM.btnChoiceUpload.classList.add('active');
    DOM.btnChoiceUrl.classList.remove('active');
    DOM.coverUploadWrapper.style.display = 'block';
    DOM.coverUrlWrapper.style.display = 'none';
    DOM.bookCoverUrl.required = false;

    handlePreviewError();
    DOM.previewTitleText.textContent = "Book Title Preview";
    DOM.previewClassBadge.textContent = "Class -";
    DOM.previewClassBadge.className = "badge";
}

// CRUD: Add & Edit Book Entry Handler with Supabase Storage Integration
async function handleBookFormSubmit(e) {
    e.preventDefault();

    const titleVal = DOM.bookTitleInput.value.trim();
    const classVal = DOM.bookClassSelect.value;
    const mediumVal = DOM.bookMediumSelect.value;
    const onedriveUrlVal = DOM.bookOneDriveUrl.value.trim();

    // Form verification check
    if (!titleVal || !classVal || !onedriveUrlVal) {
        showToast("Invalid Form", "Please fill in all required book entry inputs.", "error");
        return;
    }

    let finalCoverUrl = "";

    if (coverInputMethod === "url") {
        finalCoverUrl = DOM.bookCoverUrl.value.trim();
        if (!finalCoverUrl) {
            showToast("Required Cover", "Please enter a valid Cover Image URL.", "error");
            return;
        }
    } else {
        // Upload File Choice
        const file = DOM.bookCoverFile.files[0];
        
        if (!file && !editingBookId) {
            showToast("Required Cover", "Please select a cover image file to upload.", "error");
            return;
        }

        if (file) {
            // Show dynamic upload status
            DOM.saveBookBtn.disabled = true;
            DOM.saveBookBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to Supabase...';
            
            try {
                // Extract file extension and clean book name
                const fileExtension = file.name.split('.').pop();
                // Folder: Class[GradeClass] -> filename: [BookName].[extension]
                const folderName = `Class${classVal}`;
                const sanitizedFileName = titleVal.replace(/[^a-zA-Z0-9\s-_()]/g, '');
                const storagePath = `${folderName}/${sanitizedFileName}.${fileExtension}`;
                
                // Upload direct to Supabase Storage bucket 'book-shelf'
                const { data, error } = await supabaseClient.storage
                    .from('book-shelf')
                    .upload(storagePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });
                    
                if (error) throw error;
                
                // Retrieve the uploaded public URL
                const { data: publicUrlData } = supabaseClient.storage
                    .from('book-shelf')
                    .getPublicUrl(storagePath);
                    
                finalCoverUrl = publicUrlData.publicUrl;
                showToast("Upload Success", "Cover image uploaded successfully to Supabase storage!", "success");
            } catch (err) {
                console.error("Supabase Upload Error:", err);
                showToast("Upload Failed", `Supabase upload failed: ${err.message}`, "error");
                DOM.saveBookBtn.disabled = false;
                DOM.saveBookBtn.innerHTML = editingBookId ? '<i class="fa-solid fa-pen-to-square"></i> Update Book Record' : '<i class="fa-solid fa-floppy-disk"></i> Save Book Entry';
                return;
            }
        } else if (editingBookId) {
            // Keep existing cover URL if editing and no new file was chosen
            const existingBook = books.find(b => b.id === editingBookId);
            if (existingBook) {
                finalCoverUrl = existingBook.coverUrl;
            }
        }
    }

    if (editingBookId) {
        // EDIT MODE UPDATE
        const idx = books.findIndex(b => b.id === editingBookId);
        if (idx !== -1) {
            books[idx] = {
                id: editingBookId,
                title: titleVal,
                gradeClass: classVal,
                medium: mediumVal,
                coverUrl: finalCoverUrl,
                bookUrl: onedriveUrlVal
            };
            showToast("Book Updated", `Successfully modified textbook: "${titleVal}"`, "success");
        }
    } else {
        // NEW BOOK ADDITION
        const newBook = {
            id: `book-${Date.now()}`,
            title: titleVal,
            gradeClass: classVal,
            medium: mediumVal,
            coverUrl: finalCoverUrl,
            bookUrl: onedriveUrlVal
        };
        books.unshift(newBook); // Prepend to beginning so it appears first
        showToast("Book Added", `Successfully added new textbook to bookshelf: "${titleVal}"`, "success");
    }

    // Save database and refresh
    saveBooksDatabase();
    updateUi();
    renderAdminBooksList();
    resetBookForm();
    DOM.saveBookBtn.disabled = false;
}

// Fill editor fields for updates
function triggerEditBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    editingBookId = book.id;
    DOM.editBookId.value = book.id;
    DOM.bookTitleInput.value = book.title;
    DOM.bookClassSelect.value = book.gradeClass;
    DOM.bookMediumSelect.value = book.medium;
    
    // Default edit mode to URL tab to display current URL
    coverInputMethod = 'url';
    DOM.btnChoiceUrl.classList.add('active');
    DOM.btnChoiceUpload.classList.remove('active');
    DOM.coverUrlWrapper.style.display = 'block';
    DOM.coverUploadWrapper.style.display = 'none';
    DOM.bookCoverUrl.required = false; // Allow upload tab override during edit
    DOM.bookCoverUrl.value = book.coverUrl;
    DOM.bookOneDriveUrl.value = book.bookUrl;

    DOM.formActionTitle.textContent = "Edit Book Entry";
    DOM.saveBookBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Update Book Record';
    DOM.cancelEditBtn.style.display = 'block';
    DOM.selectedFileBanner.style.display = 'none';

    // Update live previews
    handleFormPreviewUpdate();

    // Jump form scroll top for fast mobile edits
    document.querySelector('.admin-form-column').scrollIntoView({ behavior: 'smooth' });
}

// CRUD: DELETE Book Handler
function triggerDeleteBook(id, title) {
    if (confirm(`Are you absolutely sure you want to delete "${title}" textbook records?`)) {
        books = books.filter(b => b.id !== id);
        saveBooksDatabase();

        updateUi();
        renderAdminBooksList();

        // If we are currently editing the deleted book, reset form
        if (editingBookId === id) {
            resetBookForm();
        }

        showToast("Book Removed", `Successfully deleted textbook: "${title}"`, "success");
    }
}

// Render dynamic rows in admin dashboard book list table
function renderAdminBooksList(filterStr = "") {
    DOM.adminBooksListRows.innerHTML = '';

    let filteredRecords = books.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(filterStr);
        const classMatch = `class ${book.gradeClass}`.includes(filterStr);
        const mediumMatch = book.medium.toLowerCase().includes(filterStr);
        return titleMatch || classMatch || mediumMatch;
    });

    if (filteredRecords.length === 0) {
        DOM.adminNoRecords.style.display = 'block';
        return;
    }

    DOM.adminNoRecords.style.display = 'none';

    filteredRecords.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${book.coverUrl}" alt="Thumbnail" class="admin-table-thumb" onerror="this.src='https://via.placeholder.com/36x48?text=Math'"></td>
            <td>
                <div class="admin-book-title-cell" title="${book.title}">${book.title}</div>
            </td>
            <td><span class="badge badge-class">Class ${book.gradeClass}</span></td>
            <td><span class="badge badge-medium">${book.medium}</span></td>
            <td>
                <div class="admin-row-actions">
                    <button class="btn-row-action btn-row-action-edit" title="Edit book records" onclick="triggerEditBook('${book.id}')">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn-row-action btn-row-action-delete" title="Delete book records" onclick="triggerDeleteBook('${book.id}', '${book.title.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        DOM.adminBooksListRows.appendChild(row);
    });
}

// 12. Toast Alert Notification Helper
let toastTimeout;
function showToast(title, message, type = "success") {
    clearTimeout(toastTimeout);

    DOM.toastTitle.textContent = title;
    DOM.toastMessage.textContent = message;

    // Style toggle type classes
    if (type === "error") {
        DOM.toastNotification.classList.add('toast-error');
        DOM.toastIconHolder.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
    } else {
        DOM.toastNotification.classList.remove('toast-error');
        DOM.toastIconHolder.innerHTML = '<i class="fa-solid fa-check"></i>';
    }

    DOM.toastNotification.style.display = 'flex';

    toastTimeout = setTimeout(() => {
        DOM.toastNotification.style.display = 'none';
    }, 4500); // Closes automatically after 4.5 seconds
}
