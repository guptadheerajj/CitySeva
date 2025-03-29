import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import "./dashboard.css";
import logo from "../../assets/logo.png";

export const dashboard = (function () {
    const content = document.createElement("div");
    content.classList.add("dashboard");

    // Keep track of current tab and theme
    let currentTab = 'home';
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // Initialize theme
    function initializeTheme() {
        document.body.classList.toggle('light-theme', currentTheme === 'light');
        content.classList.toggle('light-theme', currentTheme === 'light');
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('light-theme');
        content.classList.toggle('light-theme');
        localStorage.setItem('theme', currentTheme);
    }

    function renderUploadModal() {
        return `
            <div class="modal-overlay" id="upload-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h2>Report an Issue</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="issue-image">Issue Image</label>
                            <div class="image-upload-container" id="image-upload">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Click to upload or drag and drop</p>
                                <p class="small">Supported formats: JPG, PNG</p>
                                <input type="file" id="issue-image" accept="image/*" style="display: none;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="issue-title">Title</label>
                            <input type="text" id="issue-title" placeholder="Enter issue title">
                        </div>
                        <div class="form-group">
                            <label for="issue-description">Description</label>
                            <textarea id="issue-description" rows="4" placeholder="Describe the issue"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="issue-location">Location</label>
                            <input type="text" id="issue-location" placeholder="Enter location">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-autofill">Autofill</button>
                        <button class="btn btn-submit">Submit Issue</button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderSidebar() {
        return `
            <div class="sidebar">
                <div class="sidebar-logo">
                    <img src="${logo}" alt="CitySeva icon" width="40" height="40">
                    <h1>CitySeva</h1>
                </div>
                <div class="nav-links">
                    <div class="nav-link ${currentTab === 'home' ? 'active' : ''}" data-tab="home">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </div>
                    <div class="nav-link ${currentTab === 'profile' ? 'active' : ''}" data-tab="profile">
                        <i class="fas fa-user"></i>
                        <span>Profile</span>
                    </div>
                </div>
            </div>
        `;
    }

    function renderHeader(user) {
        return `
            <div class="dashboard-header">
                <div class="user-info">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}" alt="avatar">
                    <div>
                        <p>Welcome back,</p>
                        <p>${user.displayName || user.email.split('@')[0]}</p>
                    </div>
                </div>
                <div class="header-buttons">
                    <button class="theme-toggle" id="theme-toggle">
                        <i class="fas fa-moon moon"></i>
                        <i class="fas fa-sun sun"></i>
                    </button>
                    <button class="btn btn-upload" id="upload-btn">
                        <i class="fas fa-plus"></i>
                        Report Issue
                    </button>
                    <button class="btn btn-logout" id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        `;
    }

    function renderIssueCard(issue) {
        const date = new Date(issue.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="issue-card">
                <div class="issue-card-image-container">
                    <img src="${issue.image}" alt="${issue.title}" class="issue-card-image">
                </div>
                <div class="issue-card-content-wrapper">
                    <div>
                        <div class="issue-card-header">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${issue.userId}" alt="User avatar">
                            <div class="issue-card-header-info">
                                <p class="username">@${issue.username}</p>
                                <p class="date">${date}</p>
                            </div>
                        </div>
                        <div class="issue-card-content">
                            <h3>${issue.title}</h3>
                            <p>${issue.description}</p>
                            <div class="issue-card-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${issue.location}</span>
                            </div>
                        </div>
                    </div>
                    <div class="issue-card-status">
                        <span class="status-tag open">
                            <i class="fas fa-exclamation-circle"></i>
                            Open
                        </span>
                        <span class="engagement-count">
                            <i class="fas fa-users"></i>
                            ${Math.floor(Math.random() * 50) + 10} citizens following
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    function renderRightSidebar() {
        return `
            <div class="announcements">
                <h2>Important Updates</h2>
                <div class="announcement-item">
                    <span class="priority-tag priority-high">High Priority</span>
                    <h3>Emergency Road Repairs</h3>
                    <p>Major repairs scheduled on Main Street bridge. Please use alternate routes.</p>
                    <div class="date">Mar 20, 2024</div>
                </div>
                <div class="announcement-item">
                    <span class="priority-tag priority-medium">Community Event</span>
                    <h3>City Clean-up Drive</h3>
                    <p>Join us this weekend for the annual city clean-up initiative. Volunteers needed!</p>
                    <div class="date">Mar 23, 2024</div>
                </div>
                <div class="announcement-item">
                    <span class="priority-tag priority-low">Notice</span>
                    <h3>Water Conservation</h3>
                    <p>Tips and guidelines for reducing water usage during the summer months.</p>
                    <div class="date">Mar 25, 2024</div>
                </div>
            </div>
            
            <div class="trending">
                <h2>Trending Issues</h2>
                <div class="trending-item">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=123" alt="User avatar">
                    <div class="trending-item-info">
                        <h4>Traffic Signal Malfunction</h4>
                        <p>5th & Park Avenue</p>
                        <div class="stats">
                            <span class="stats-item"><i class="fas fa-star"></i> 45</span>
                            <span class="stats-item"><i class="fas fa-eye"></i> 128</span>
                        </div>
                    </div>
                </div>
                <div class="trending-item">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=456" alt="User avatar">
                    <div class="trending-item-info">
                        <h4>Park Renovation Project</h4>
                        <p>Central Park</p>
                        <div class="stats">
                            <span class="stats-item"><i class="fas fa-star"></i> 38</span>
                            <span class="stats-item"><i class="fas fa-eye"></i> 95</span>
                        </div>
                    </div>
                </div>
                <div class="trending-item">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=789" alt="User avatar">
                    <div class="trending-item-info">
                        <h4>Street Light Installation</h4>
                        <p>Riverside Drive</p>
                        <div class="stats">
                            <span class="stats-item"><i class="fas fa-star"></i> 32</span>
                            <span class="stats-item"><i class="fas fa-eye"></i> 87</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderMainContent() {
        // Dummy issues data with more realistic content
        const allIssues = [
            {
                title: 'Broken Street Light on Main Street',
                description: 'The street light near the intersection of Main St. and Oak Ave has been flickering for the past week, creating safety concerns for pedestrians and drivers at night.',
                location: 'Main Street & Oak Avenue',
                username: 'concerned_citizen',
                userId: 'user123',
                date: '2024-03-15',
                image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&q=80'
            },
            {
                title: 'Pothole Damage Risk',
                description: 'Large pothole developing on Cedar Road, approximately 100 meters from the community center. Several vehicles have already been damaged.',
                location: 'Cedar Road',
                username: 'roadwatch',
                userId: 'user456',
                date: '2024-03-14',
                image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&q=80'
            },
            {
                title: 'Park Cleanup Needed',
                description: 'Significant amount of litter accumulated in Central Park playground area. This poses a risk to children and affects the beauty of our community space.',
                location: 'Central Park',
                username: 'parkfriend',
                userId: 'user789',
                date: '2024-03-13',
                image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=500&q=80'
            }
        ];

        const userIssues = [
            {
                title: 'Graffiti on Community Center',
                description: 'Found inappropriate graffiti on the east wall of the community center. Quick action needed to maintain the building\'s appearance.',
                location: 'Community Center',
                username: 'artguardian',
                userId: auth.currentUser.uid,
                date: '2024-03-12',
                image: 'https://images.unsplash.com/photo-1569875770588-6fd4a95a2d4f?w=500&q=80'
            }
        ];

        const issues = currentTab === 'home' ? allIssues : userIssues;

        return `
            <div class="content-grid">
                <div class="issues-section">
                    <h2>${currentTab === 'home' ? 'Recent Issues' : 'Your Issues'}</h2>
                    ${issues.map(issue => renderIssueCard(issue)).join('')}
                </div>
                <div class="right-sidebar">
                    ${renderRightSidebar()}
                </div>
            </div>
        `;
    }

    function render(user) {
        content.innerHTML = `
            ${renderSidebar()}
            <div class="main-content">
                ${renderHeader(user)}
                ${renderMainContent()}
            </div>
            ${renderUploadModal()}
        `;

        // Initialize theme
        initializeTheme();

        // Theme toggle event listener
        const themeToggle = content.querySelector("#theme-toggle");
        themeToggle.addEventListener("click", toggleTheme);

        // Add event listeners for navigation
        const navLinks = content.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                currentTab = link.dataset.tab;
                render(user);
            });
        });

        // Modal event listeners
        const uploadBtn = content.querySelector("#upload-btn");
        const modal = content.querySelector("#upload-modal");
        const closeBtn = content.querySelector(".close-modal");
        const imageUploadContainer = content.querySelector("#image-upload");
        const imageInput = content.querySelector("#issue-image");

        uploadBtn.addEventListener("click", () => {
            modal.classList.add("active");
        });

        closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        });

        // Image upload handling
        imageUploadContainer.addEventListener("click", () => {
            imageInput.click();
        });

        imageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imageUploadContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Selected image" style="max-width: 100%; max-height: 200px;">
                        <p>Click to change image</p>
                        <input type="file" id="issue-image" accept="image/*" style="display: none;">
                    `;
                };
                reader.readAsDataURL(file);
            }
        });

        // Autofill and Submit button event listeners
        const autofillBtn = content.querySelector(".btn-autofill");
        const submitBtn = content.querySelector(".btn-submit");

        autofillBtn.addEventListener("click", () => {
            console.log("Autofill functionality coming soon!");
        });

        submitBtn.addEventListener("click", () => {
            console.log("Submit functionality coming soon!");
            modal.classList.remove("active");
        });

        // Logout button
        const logoutBtn = content.querySelector("#logout-btn");
        logoutBtn.addEventListener("click", async () => {
            try {
                await auth.signOut();
                window.history.pushState({}, '', '/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
            } catch (error) {
                console.error("Error signing out:", error);
            }
        });
    }

    // Initial render with auth check
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Dashboard - User Details:", {
                email: user.email,
                uid: user.uid,
                displayName: user.displayName,
                emailVerified: user.emailVerified,
                lastSignInTime: user.metadata.lastSignInTime
            });
            render(user);
        }
    });

    return {
        content,
    };
})();
