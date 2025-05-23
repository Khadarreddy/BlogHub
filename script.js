// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjv0lHoQOMIGSBxkf7pBA9U5woijUGHnM",
  authDomain: "bloghub-88c3c.firebaseapp.com",
  projectId: "bloghub-88c3c",
  storageBucket: "bloghub-88c3c.firebasestorage.app",
  messagingSenderId: "511891899084",
  appId: "1:511891899084:web:a4de09765c9b81e4ea3869"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
const backBtn = document.getElementById('back-btn');

// Page Elements
const homePage = document.getElementById('home-page');
const blogDetailsPage = document.getElementById('blog-details');
const writePage = document.getElementById('write-page');
const dashboardPage = document.getElementById('dashboard-page');

// Event Listeners
document.getElementById('show-write').addEventListener('click', showWritePage);
document.getElementById('show-dashboard').addEventListener('click', showDashboard);
document.getElementById('show-home').addEventListener('click', showHomePage);
backBtn.addEventListener('click', showHomePage);

// Simple logout functionality
async function handleLogout(e) {
    if (e) e.preventDefault();
    try {
        await signOut(auth);
        currentUser = null;
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        document.getElementById('show-write').style.display = 'none';
        document.getElementById('show-dashboard').style.display = 'none';
        searchInput.value = '';
        showHomePage();
    } catch (error) {
        console.error('Logout error:', error);
    }
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
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Fetch username from Firestore
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
            currentUser = {
                ...userCredential.user,
                username: userDoc.data().username
            };
        } else {
            currentUser = userCredential.user;
        }
        loginModal.style.display = 'none';
        updateAuthUI();
        showHomePage();
    } catch (error) {
        console.error('Login error:', error);
        alert('Invalid credentials!');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        // Save username in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            username: username,
            email: email
        });
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
        alert('Registration successful! Please login.');
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
});

function showRegister() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
}

function updateAuthUI() {
    console.log('Updating UI, currentUser:', currentUser); // Debug log
    if (currentUser) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.username || currentUser.email}`;
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
async function showHomePage() {
    try {
        const blogsSnapshot = await getDocs(collection(db, 'blogs'));
        const blogs = blogsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const blogsContainer = homePage.querySelector('.blogs-container');
        blogsContainer.innerHTML = blogs.map(blog => createBlogCard(blog)).join('');
        
        setupBlogCardEvents();
        showPage(homePage);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        alert('Error loading blogs');
    }
}

async function showBlogDetails(blogId) {
    try {
        const blogsSnapshot = await getDocs(collection(db, 'blogs'));
        const blogs = blogsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const blog = blogs.find(b => b.id === blogId);
        
        if (!blog) return;
        
        // Increment view count
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
            views: (blog.views || 0) + 1
        });
        
        const detailsContent = blogDetailsPage.querySelector('.blog-details-content');
        detailsContent.innerHTML = `
            <div class="blog-details-header">
                <h1 class="blog-details-title">${blog.title}</h1>
                <div class="blog-details-meta">
                    <span><i class="fas fa-user"></i> ${blog.author}</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(blog.date).toLocaleDateString()}</span>
                    <span><i class="fas fa-eye"></i> ${blog.views || 0}</span>
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
    } catch (error) {
        console.error('Error showing blog details:', error);
        alert('Error loading blog details');
    }
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

async function showDashboard() {
    if (!currentUser) {
        alert('Please login to view dashboard!');
        return;
    }
    
    try {
        const blogsQuery = query(
            collection(db, 'blogs'),
            where('author', '==', currentUser.email)
        );
        const blogsSnapshot = await getDocs(blogsQuery);
        const userBlogs = blogsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
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
        
        setupBlogCardEvents();
        showPage(dashboardPage);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard');
    }
}

function createBlogCard(blog, isDashboard = false) {
    return `
        <div class="blog-card" data-id="${blog.id}">
            ${currentUser && currentUser.email === blog.author ? `
                <button class="delete-btn" data-id="${blog.id}">
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
                    <button class="edit-btn" data-id="${blog.id}"><i class="fas fa-edit"></i> Edit</button>
                </div>
            ` : ''}
        </div>
    `;
}

// Add this function to handle blog card events
function setupBlogCardEvents() {
    // Setup delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const blogId = btn.dataset.id;
            if (confirm('Are you sure you want to delete this blog?')) {
                try {
                    await deleteDoc(doc(db, 'blogs', blogId));
                    if (document.getElementById('dashboard-page').classList.contains('active')) {
                        showDashboard();
                    } else {
                        showHomePage();
                    }
                } catch (error) {
                    console.error('Error deleting blog:', error);
                    alert('Error deleting blog');
                }
            }
        });
    });

    // Setup edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const blogId = btn.dataset.id;
            editBlog(blogId);
        });
    });

    // Setup blog card clicks
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', () => {
            const blogId = card.dataset.id;
            showBlogDetails(blogId);
        });
    });
}

async function publishBlog(e) {
    e.preventDefault();
    
    const title = document.getElementById('blog-title').value;
    const content = quill.root.innerHTML;
    const tags = document.getElementById('tag-input').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    const blog = {
        title,
        content,
        author: currentUser.email,
        date: new Date().toISOString(),
        tags,
        views: 0
    };
    
    try {
        await addDoc(collection(db, 'blogs'), blog);
        showHomePage();
    } catch (error) {
        console.error('Error publishing blog:', error);
        alert('Error publishing blog');
    }
}

async function editBlog(id) {
    try {
        const blogDoc = await getDoc(doc(db, 'blogs', id));
        const blog = { id: blogDoc.id, ...blogDoc.data() };
        
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
        
        document.getElementById('blog-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('blog-title').value;
            const content = quill.root.innerHTML;
            const tags = document.getElementById('tag-input').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);
            
            try {
                await updateDoc(doc(db, 'blogs', id), {
                    title,
                    content,
                    tags
                });
                showDashboard();
            } catch (error) {
                console.error('Error updating blog:', error);
                alert('Error updating blog');
            }
        });
        
        showPage(writePage);
    } catch (error) {
        console.error('Error loading blog for edit:', error);
        alert('Error loading blog for edit');
    }
}

// Search Functionality
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    const query = searchInput.value.toLowerCase();
    try {
        const blogsSnapshot = await getDocs(collection(db, 'blogs'));
        const blogs = blogsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
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
    } catch (error) {
        console.error('Error searching blogs:', error);
        alert('Error searching blogs');
    }
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
