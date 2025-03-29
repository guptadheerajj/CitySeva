import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import "./dashboard.css";
import logo from "../../assets/logo.png";
export const dashboard = (function () {
    const content = document.createElement("div");
    content.classList.add("dashboard");

    // Keep track of current tab
    let currentTab = 'home';
    
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
                        <p>Hi there,</p>
                        <p>${user.displayName || user.email.split('@')[0]}</p>
                    </div>
                </div>
                <div class="header-buttons">
                    <button class="btn btn-upload" id="upload-btn">Upload</button>
                    <button class="btn btn-logout" id="logout-btn">Logout</button>
                </div>
            </div>
        `;
    }

    function renderIssueCard(issue) {
        return `
            <div class="issue-card">
                <h3>${issue.title}</h3>
                <p>${issue.description}</p>
                <div class="card-actions">
                    <span class="card-action">⭐</span>
                    <span class="card-action">👁️</span>
                    <span class="card-action">✔️</span>
                </div>
            </div>
        `;
    }

    function renderMainContent() {
        // Dummy issues data
        const allIssues = [
            { title: 'Issue 1', description: 'Issue description, date, resolved or not, etc. Issue image, etc, user name' },
            { title: 'Super Cool Project', description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum ut facilis iure odit ullam, tempore fugiat recusandae.' }
        ];

        const userIssues = [
            { title: 'My Issue 1', description: 'This is an issue I reported' }
        ];

        const issues = currentTab === 'home' ? allIssues : userIssues;

        return `
            <div class="content-grid">
                <div class="issues-section">
                    <h2>${currentTab === 'home' ? 'Recent Issues' : 'Your Issues'}</h2>
                    ${issues.map(issue => renderIssueCard(issue)).join('')}
                </div>
                <div class="right-sidebar">
                    <div class="announcements">
                        <h2>Announcements</h2>
                        <div class="announcement-item">
                            <h3>Site Management</h3>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum ut...</p>
                        </div>
                        <div class="announcement-item">
                            <h3>Site Management</h3>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum ut...</p>
                        </div>
                    </div>
                    <div class="trending">
                        <h2>Trending</h2>
                        <div class="trending-item">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=1" alt="avatar">
                            <div>
                                <p>@electroboom</p>
                                <p>Shock Them Bolt</p>
                            </div>
                        </div>
                        <div class="trending-item">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=2" alt="avatar">
                            <div>
                                <p>@gigantaurous</p>
                                <p>Crush The Crush</p>
                            </div>
                        </div>
                    </div>
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
        `;

        // Add event listeners
        const navLinks = content.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                currentTab = link.dataset.tab;
                render(user);
            });
        });

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

        // Upload button event listener (to be implemented later)
        const uploadBtn = content.querySelector("#upload-btn");
        uploadBtn.addEventListener("click", () => {
            console.log("Upload functionality coming soon!");
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
