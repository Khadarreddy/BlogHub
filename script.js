// Initialize Quill editor
let quill;
let currentUser = null;

// DOM Elements
const mainContent = document.getElementById('main-content');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');

// Page Elements
const homePage = document.getElementById('home-page');
const blogDetailsPage = document.getElementById('blog-details');
const writePage = document.getElementById('write-page');
const dashboardPage = document.getElementById('dashboard-page');

// Event Listeners
document.getElementById('show-write').addEventListener('click', showWritePage);
document.getElementById('show-dashboard').addEventListener('click', showDashboard);
document.getElementById('show-home').addEventListener('click', showHomePage);

// Simple logout functionality
function handleLogout(e) {
    if (e) e.preventDefault();
    console.log('Logout function called'); // Debug log
    
    // Only clear user-related storage, not blogs
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    console.log('User storage cleared'); // Debug log
    
    // Reset user state
    currentUser = null;
    console.log('User state reset'); // Debug log
    
    // Reset UI
    loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    document.getElementById('show-write').style.display = 'none';
    document.getElementById('show-dashboard').style.display = 'none';
    console.log('UI reset complete'); // Debug log
    
    // Clear any search input
    searchInput.value = '';
    
    // Show home page with all blogs
    showHomePage();
    console.log('Logout process completed successfully'); // Debug log
}

// Add event listener to logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
    console.log('Logout event listener attached'); // Debug log
}

// Also make handleLogout available globally
window.handleLogout = handleLogout;

// Add login button click handler
loginBtn.addEventListener('click', () => {
    console.log('Login button clicked'); // Debug log
    loginModal.style.display = 'block';
});

showRegisterLink.addEventListener('click', showRegister);
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

// Authentication
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        console.log('Login successful for:', username); // Debug log
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        loginModal.style.display = 'none';
        updateAuthUI();
        showHomePage();
    } else {
        console.log('Login failed for:', username); // Debug log
        alert('Invalid credentials!');
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }
    
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
});

function showRegister() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
}

function updateAuthUI() {
    console.log('Updating UI, currentUser:', currentUser); // Debug log
    if (currentUser) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.username}`;
        logoutBtn.style.display = 'inline-block';
        document.getElementById('show-write').style.display = 'flex';
        document.getElementById('show-dashboard').style.display = 'flex';
    } else {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        document.getElementById('show-write').style.display = 'none';
        document.getElementById('show-dashboard').style.display = 'none';
    }
}

// Page Navigation
function showPage(page) {
    [homePage, blogDetailsPage, writePage, dashboardPage].forEach(p => {
        p.classList.remove('active');
    });
    page.classList.add('active');
}

// Blog Functions
function showHomePage() {
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const blogsContainer = homePage.querySelector('.blogs-container');
    blogsContainer.innerHTML = blogs.map(blog => createBlogCard(blog)).join('');
    
    // Add click event listeners to blog cards
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', () => {
            const blogId = card.dataset.id;
            showBlogDetails(blogId);
        });
    });
    
    showPage(homePage);
}

function showBlogDetails(blogId) {
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const blog = blogs.find(b => b.id === blogId);
    
    if (!blog) return;
    
    // Increment view count
    blog.views = (blog.views || 0) + 1;
    localStorage.setItem('blogs', JSON.stringify(blogs));
    
    const detailsContent = blogDetailsPage.querySelector('.blog-details-content');
    detailsContent.innerHTML = `
        <div class="blog-details-header">
            <h1 class="blog-details-title">${blog.title}</h1>
            <div class="blog-details-meta">
                <span><i class="fas fa-user"></i> ${blog.author}</span>
                <span><i class="fas fa-calendar"></i> ${new Date(blog.date).toLocaleDateString()}</span>
                <span><i class="fas fa-eye"></i> ${blog.views}</span>
            </div>
        </div>
        <div class="blog-details-body">
            ${blog.content}
        </div>
        <div class="blog-details-tags">
            ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;
    
    showPage(blogDetailsPage);
}

function showWritePage() {
    if (!currentUser) {
        alert('Please login to write a blog!');
        return;
    }
    
    writePage.innerHTML = `
        <div class="write-container">
            <h2>Write a New Blog</h2>
            <form id="blog-form">
                <input type="text" id="blog-title" placeholder="Blog Title" required>
                <div id="editor"></div>
                <div class="tags-container">
                    <input type="text" id="tag-input" placeholder="Add tags (comma separated)">
                </div>
                <button type="submit">Publish</button>
            </form>
        </div>
    `;
    
    // Initialize Quill
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean'],
                ['link', 'image']
            ]
        }
    });
    
    document.getElementById('blog-form').addEventListener('submit', publishBlog);
    showPage(writePage);
}

function showDashboard() {
    if (!currentUser) {
        alert('Please login to view dashboard!');
        return;
    }
    
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const userBlogs = blogs.filter(blog => blog.author === currentUser.username);
    
    dashboardPage.innerHTML = `
        <div class="dashboard">
            <h2>Dashboard</h2>
            <div class="dashboard-stats">
                <div class="stat-card">
                    <h3>Total Posts</h3>
                    <p>${userBlogs.length}</p>
                </div>
                <div class="stat-card">
                    <h3>Total Views</h3>
                    <p>${userBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0)}</p>
                </div>
            </div>
            <h3>Your Posts</h3>
            <div class="blogs-container">
                ${userBlogs.map(blog => createBlogCard(blog, true)).join('')}
            </div>
        </div>
    `;
    
    // Add click event listeners to blog cards
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', () => {
            const blogId = card.dataset.id;
            showBlogDetails(blogId);
        });
    });
    
    showPage(dashboardPage);
}

function createBlogCard(blog, isDashboard = false) {
    return `
        <div class="blog-card" data-id="${blog.id}">
            ${currentUser && currentUser.username === blog.author ? `
                <button class="delete-btn" onclick="handleDelete(event, '${blog.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
            <div class="blog-header">
                <h3>${blog.title}</h3>
                <div class="blog-meta">
                    <span><i class="fas fa-user"></i> ${blog.author}</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(blog.date).toLocaleDateString()}</span>
                    <span><i class="fas fa-eye"></i> ${blog.views || 0}</span>
                </div>
            </div>
            <div class="blog-content">${blog.content.substring(0, 200)}...</div>
            <div class="blog-tags">
                ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            ${isDashboard ? `
                <div class="blog-actions">
                    <button onclick="event.stopPropagation(); editBlog('${blog.id}')"><i class="fas fa-edit"></i> Edit</button>
                </div>
            ` : ''}
        </div>
    `;
}

function handleDelete(event, id) {
    event.preventDefault();
    event.stopPropagation();
    deleteBlog(id);
}

function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const updatedBlogs = blogs.filter(blog => blog.id !== id);
    localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
    
    // Refresh the current view
    if (document.getElementById('dashboard-page').classList.contains('active')) {
        showDashboard();
    } else {
        showHomePage();
    }
}

function publishBlog(e) {
    e.preventDefault();
    
    const title = document.getElementById('blog-title').value;
    const content = quill.root.innerHTML;
    const tags = document.getElementById('tag-input').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    const blog = {
        id: Date.now().toString(),
        title,
        content,
        author: currentUser.username,
        date: new Date().toISOString(),
        tags,
        views: 0
    };
    
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    blogs.unshift(blog);
    localStorage.setItem('blogs', JSON.stringify(blogs));
    
    showHomePage();
}

function editBlog(id) {
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const blog = blogs.find(b => b.id === id);
    
    if (!blog) return;
    
    writePage.innerHTML = `
        <div class="write-container">
            <h2>Edit Blog</h2>
            <form id="blog-form">
                <input type="text" id="blog-title" value="${blog.title}" required>
                <div id="editor"></div>
                <div class="tags-container">
                    <input type="text" id="tag-input" value="${blog.tags.join(', ')}" placeholder="Add tags (comma separated)">
                </div>
                <button type="submit">Update</button>
            </form>
        </div>
    `;
    
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean'],
                ['link', 'image']
            ]
        }
    });
    
    quill.root.innerHTML = blog.content;
    
    document.getElementById('blog-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('blog-title').value;
        const content = quill.root.innerHTML;
        const tags = document.getElementById('tag-input').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        blog.title = title;
        blog.content = content;
        blog.tags = tags;
        
        localStorage.setItem('blogs', JSON.stringify(blogs));
        showDashboard();
    });
    
    showPage(writePage);
}

// Search Functionality
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

function performSearch() {
    const query = searchInput.value.toLowerCase();
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    
    const filteredBlogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(query) ||
        blog.content.toLowerCase().includes(query) ||
        blog.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    const blogsContainer = homePage.querySelector('.blogs-container');
    blogsContainer.innerHTML = filteredBlogs.map(blog => createBlogCard(blog)).join('');
    
    // Add click event listeners to filtered blog cards
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', () => {
            const blogId = card.dataset.id;
            showBlogDetails(blogId);
        });
    });
    
    showPage(homePage);
}

// Initialize
showHomePage();
// Check for existing session
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateAuthUI();
} else {
    currentUser = null;
    updateAuthUI();
} 