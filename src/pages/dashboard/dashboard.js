import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import "./dashboard.css";

export const dashboard = (function () {
    const content = document.createElement("div");
    content.classList.add("dashboard");
    
    content.innerHTML = `
        <header class="dashboard-header">
            <nav>
                <div class="logo">
                    <h1>CitySeva Dashboard</h1>
                </div>
                <div class="nav-right">
                    <button id="logout-btn" class="btn">Logout</button>
                </div>
            </nav>
        </header>
        <div class="dashboard-container">
            <h1>Welcome to Your Dashboard</h1>
            <div id="user-profile">
                <h2>Your Profile</h2>
                <div id="profile-details"></div>
            </div>
        </div>
    `;

    // Add logout functionality
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

    // Update profile details when component mounts
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const profileDetails = content.querySelector("#profile-details");
            profileDetails.innerHTML = `
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Display Name:</strong> ${user.displayName || 'Not set'}</p>
                <p><strong>Email Verified:</strong> ${user.emailVerified ? 'Yes' : 'No'}</p>
                <p><strong>Last Sign In:</strong> ${new Date(user.metadata.lastSignInTime).toLocaleString()}</p>
            `;
        }
    });

    return {
        content,
    };
})();
