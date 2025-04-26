import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import "./dashboard.css";
import logo from "../../assets/logo.png";
import beforeUpvoteIcon from "../../assets/before-upvote.png";
import afterUpvoteIcon from "../../assets/after-upvote.png";
import beforeDownvoteIcon from "../../assets/before-downvote.png";
import afterDownvoteIcon from "../../assets/after-downvote.png";
import streetLight from "../../assets/streetlight.png";
import garbage from "../../assets/garbage.png";

export const dashboard = (function () {
    const content = document.createElement("div");
    content.classList.add("dashboard");

    let currentTab = "home";
    let currentTheme = localStorage.getItem("theme") || "dark";
    let user = null; // Store the user object to access in fetchIssues and updateTrending

    function initializeTheme() {
        document.body.classList.toggle("light-theme", currentTheme === "light");
        content.classList.toggle("light-theme", currentTheme === "light");
    }

    function toggleTheme() {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        document.body.classList.toggle("light-theme");
        content.classList.toggle("light-theme");
        localStorage.setItem("theme", currentTheme);
    }

    function renderUploadModal() {
        return `
      <div class="modal-overlay" id="upload-modal">
        <div class="modal">
          <div class="modal-header">
            <h2>Report an Issue</h2>
            <button class="close-modal">×</button>
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
            <div class="detection-result" id="detection-result"></div>
            <div class="comment-section" id="comment-section" style="display: none;">
              <div class="location-input">
                <label for="issue-location">Location <span style="color: red;">*</span></label>
                <input type="text" id="issue-location" placeholder="Enter location here..." required />
              </div>
              <div class="description-input">
                <label for="issue-description">Add Description (Optional)</label>
                <textarea id="issue-description" placeholder="Enter description here..." rows="3"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer" id="modal-footer">
            <button class="btn btn-autofill" id="detect-btn">Detect Issue With AI</button>
          </div>
        </div>
      </div>
    `;
    }

    function renderMaximizeImageModal() {
        return `
      <div class="maximize-image-modal" id="maximize-image-modal">
        <button class="close-maximize-btn">×</button>
        <img id="maximized-image" src="" alt="Maximized Issue Image">
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
          <div class="nav-link ${
              currentTab === "home" ? "active" : ""
          }" data-tab="home">
            <i class="fas fa-home"></i>
            <span>Home</span>
          </div>
          <div class="nav-link ${
              currentTab === "profile" ? "active" : ""
          }" data-tab="profile">
            <i class="fas fa-user"></i>
            <span>Profile</span>
          </div>
        </div>
      </div>
    `;
    }

    function renderRightSidebar() {
        return `
      <div class="trending">
        <h2>Trending Issues</h2>
        <div id="trending-container"></div>
      </div>
    `;
    }

    function renderHeader(user) {
        return `
      <div class="dashboard-header">
        <div class="user-info">
          <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${
              user.uid
          }" alt="avatar">
          <div>
            <p>Welcome back,</p>
            <p>${user.displayName || user.email.split("@")[0]}</p>
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
        const [day, month, year] = issue.date.split("/");
        const date = `${month}/${day}/${year}`;
        const issueId = issue._id || "unknown";
        const userVote = issue.votes.find(
            (v) => v.userId === auth.currentUser?.uid
        )?.voteType;

        return `
      <div class="issue-card" data-id="${issueId}">
        <div class="issue-card-image-container">
          <img src="${issue.image}" alt="${
              issue.issue
          }" class="issue-card-image" data-full-image="${issue.image}">
        </div>
        <div class="issue-card-content-wrapper">
          <div>
            <div class="issue-card-header">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${
                  issue.userId
              }" alt="User avatar">
              <div class="issue-card-header-info">
                <p class="username">@${issue.username}</p>
                <p class="date">${date}</p>
              </div>
            </div>
          </div>
          <div class="issue-card-status">
            <h3>${issue.issue}</h3>
            <p>${issue.location}</p>
            <p>${issue.description || ""}</p>
            <span class="status-tag ${issue.status.toLowerCase()}">
              <i class="fas fa-exclamation-circle"></i>
              ${issue.status}
            </span>
            <div class="vote-section">
              <button class="vote-btn upvote" data-type="up">
                <img src="${
                    userVote === "up" ? afterUpvoteIcon : beforeUpvoteIcon
                }" alt="Upvote" class="vote-icon">
                <span>${issue.upvotes || 0}</span>
              </button>
              <button class="vote-btn downvote" data-type="down">
                <img src="${
                    userVote === "down" ? afterDownvoteIcon : beforeDownvoteIcon
                }" alt="Downvote" class="vote-icon">
                <span>${issue.downvotes || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    function renderTrendingCard(issue) {
        const [day, month, year] = issue.date.split("/");
        const date = `${month}/${day}/${year}`;
        const issueId = issue._id || "unknown";
        const userVote = issue.votes.find(
            (v) => v.userId === auth.currentUser?.uid
        )?.voteType;

        return `
      <div class="trending-item" data-id="${issueId}">
        <div class="trending-item-image-container">
          <img src="${issue.image}" alt="${issue.issue}" class="trending-item-image" data-full-image="${issue.image}">
        </div>
        <div class="trending-item-content-wrapper">
          <div class="trending-item-header">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${issue.userId}" alt="User avatar" class="trending-user-avatar">
            <div class="trending-item-header-info">
              <p class="username">@${issue.username}</p>
              <p class="date">${date}</p>
            </div>
          </div>
          <div class="trending-item-status">
            <h3>${issue.issue}</h3>
            <p>${issue.location}</p>
            <p>${issue.description || "No description"}</p>
            <div class="vote-section">
              <button class="vote-btn upvote" data-type="up">
                <img src="${
                    userVote === "up" ? afterUpvoteIcon : beforeUpvoteIcon
                }" alt="Upvote" class="vote-icon">
                <span>${issue.upvotes || 0}</span>
              </button>
              <button class="vote-btn downvote" data-type="down">
                <img src="${
                    userVote === "down" ? afterDownvoteIcon : beforeDownvoteIcon
                }" alt="Downvote" class="vote-icon">
                <span>${issue.downvotes || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    function renderMainContent() {
        return `
      <div class="content-grid">
        <div class="issues-section">
          <h2>${currentTab === "home" ? "Recent Issues" : "Your Issues"}</h2>
          <div id="issues-container"></div>
        </div>
        <div class="right-sidebar">
          ${renderRightSidebar()}
        </div>
      </div>
    `;
    }

    async function fetchTrendingIssues() {
        try {
            const response = await fetch("http://localhost:3000/trending");
            if (!response.ok) {
                throw new Error("Failed to fetch trending issues");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching trending issues:", error.message);
            return [];
        }
    }

    async function fetchIssues() {
        try {
            const response = await fetch("http://localhost:3000/issues");
            if (!response.ok) {
                throw new Error("Failed to fetch issues");
            }
            const allIssues = await response.json();

            const issues = currentTab === "profile" && auth.currentUser?.uid
                ? allIssues.filter(issue => issue.userId === auth.currentUser.uid)
                : allIssues;

            const issuesContainer = content.querySelector("#issues-container");
            if (issues.length === 0) {
                issuesContainer.innerHTML = `<p>${
                    currentTab === "profile" ? "You have no issues yet." : "No recent issues to display."
                }</p>`;
            } else {
                issuesContainer.innerHTML = issues
                    .map((issue) => renderIssueCard(issue))
                    .join("");
            }

            // Attach event listeners to vote buttons within .issue-card
            const voteButtons = content.querySelectorAll(".issue-card .vote-btn");
            if (voteButtons.length === 0) {
                console.warn("No vote buttons found in issue cards.");
                return;
            }
            voteButtons.forEach((button) => {
                button.addEventListener("click", async () => {
                    const issueCard = button.closest(".issue-card");
                    if (!issueCard) {
                        console.error("Vote button not within an issue card:", button);
                        return;
                    }
                    const issueId = issueCard.dataset.id;
                    const voteType = button.dataset.type;
                    if (!issueId || issueId === "unknown") {
                        console.error("Invalid issueId:", issueId);
                        alert("Cannot vote on this issue due to an invalid ID.");
                        return;
                    }
                    if (!user || !user.uid) {
                        console.error("User not authenticated for voting.");
                        alert("Please log in to vote.");
                        return;
                    }
                    await updateVote(issueId, voteType, user.uid);
                    fetchIssues();
                });
            });
        } catch (error) {
            console.error("Error fetching issues:", error.message);
            const issuesContainer = content.querySelector("#issues-container");
            issuesContainer.innerHTML = "<p>Error loading issues. Please try again later.</p>";
        }
    }

    async function updateVote(issueId, voteType, userId) {
        try {
            console.log("Sending vote:", { issueId, voteType, userId });
            const response = await fetch("http://localhost:3000/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issueId, voteType, userId }),
            });
            if (!response.ok) {
                throw new Error("Vote update failed");
            }
            const result = await response.json();
            console.log("Vote update response:", result);
        } catch (error) {
            console.error("Error updating vote:", error.message);
            alert("Failed to update vote: " + error.message);
        }
    }

    function render(currentUser) {
        user = currentUser; // Store user for use in fetchIssues and updateTrending
        content.innerHTML = `
      ${renderSidebar()}
      <div class="main-content">
        ${renderHeader(user)}
        ${renderMainContent()}
      </div>
      ${renderUploadModal()}
      ${renderMaximizeImageModal()}
    `;

        initializeTheme();

        const themeToggle = content.querySelector("#theme-toggle");
        themeToggle.addEventListener("click", toggleTheme);

        const navLinks = content.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                currentTab = link.dataset.tab;
                render(user);
                fetchIssues();
            });
        });

        const uploadBtn = content.querySelector("#upload-btn");
        const modal = content.querySelector("#upload-modal");
        const closeBtn = content.querySelector(".close-modal");
        const imageUploadContainer = content.querySelector("#image-upload");
        const imageInput = content.querySelector("#issue-image");
        const detectionResult = content.querySelector("#detection-result");
        const commentSection = content.querySelector("#comment-section");
        const locationInput = content.querySelector("#issue-location");
        const descriptionInput = content.querySelector("#issue-description");
        const issuesContainer = content.querySelector("#issues-container");
        const trendingContainer = content.querySelector("#trending-container");
        const modalFooter = content.querySelector("#modal-footer");
        const maximizeImageModal = content.querySelector("#maximize-image-modal");
        const maximizeImage = content.querySelector("#maximized-image");
        const closeMaximizeBtn = content.querySelector(".close-maximize-btn");
        let detectBtn = content.querySelector("#detect-btn");

        async function updateTrending() {
            const trendingIssues = await fetchTrendingIssues();
            if (trendingIssues.length > 0) {
                trendingContainer.innerHTML = trendingIssues
                    .map((issue) => renderTrendingCard(issue))
                    .join("");
            } else {
                trendingContainer.innerHTML = "<p>No trending issues yet.</p>";
            }

            // Attach event listeners to vote buttons within .trending-item
            const voteButtons = content.querySelectorAll(".trending-item .vote-btn");
            if (voteButtons.length === 0) {
                console.warn("No vote buttons found in trending items.");
            } else {
                voteButtons.forEach((button) => {
                    button.addEventListener("click", async () => {
                        const trendingItem = button.closest(".trending-item");
                        if (!trendingItem) {
                            console.error("Vote button not within a trending item:", button);
                            return;
                        }
                        const issueId = trendingItem.dataset.id;
                        const voteType = button.dataset.type;
                        if (!issueId || issueId === "unknown") {
                            console.error("Invalid issueId:", issueId);
                            alert("Cannot vote on this issue due to an invalid ID.");
                            return;
                        }
                        if (!user || !user.uid) {
                            console.error("User not authenticated for voting.");
                            alert("Please log in to vote.");
                            return;
                        }
                        await updateVote(issueId, voteType, user.uid);
                        updateTrending();
                        fetchIssues();
                    });
                });
            }

            // Attach event listeners to images in trending items
            const trendingImages = content.querySelectorAll(".trending-item-image");
            console.log("Found trending images:", trendingImages.length);
            if (trendingImages.length === 0) {
                console.warn("No trending images found to attach event listeners.");
            }
            trendingImages.forEach((image) => {
                console.log("Attaching event listener to trending image:", image.src);
                image.addEventListener("click", () => {
                    console.log("Trending image clicked:", image.dataset.fullImage);
                    maximizeImage.src = image.dataset.fullImage;
                    maximizeImageModal.classList.add("active");
                });
            });
        }
        updateTrending();
        setInterval(updateTrending, 60000);

        async function updateRecentIssues() {
            await fetchIssues();

            // Attach event listeners to images in issue cards with a slight delay
            setTimeout(() => {
                const issueImages = content.querySelectorAll(".issue-card-image");
                console.log("Found issue images (delayed):", issueImages.length);
                if (issueImages.length === 0) {
                    console.warn("No issue images found to attach event listeners (delayed).");
                }
                issueImages.forEach((image) => {
                    // Remove existing event listeners to prevent duplicates
                    image.removeEventListener("click", handleIssueImageClick);
                    image.addEventListener("click", handleIssueImageClick);
                });
            }, 100);
        }

        function handleIssueImageClick(event) {
            const image = event.target;
            console.log("Issue image clicked:", image.dataset.fullImage);
            maximizeImage.src = image.dataset.fullImage;
            maximizeImageModal.classList.add("active");
        }

        updateRecentIssues();
        setInterval(updateRecentIssues, 60000);

        // Close the maximize image modal
        closeMaximizeBtn.addEventListener("click", () => {
            maximizeImageModal.classList.remove("active");
            maximizeImage.src = "";
        });

        maximizeImageModal.addEventListener("click", (e) => {
            if (e.target === maximizeImageModal) {
                maximizeImageModal.classList.remove("active");
                maximizeImage.src = "";
            }
        });

        uploadBtn.addEventListener("click", () => {
            modal.classList.add("active");
            detectionResult.innerHTML = "";
            commentSection.style.display = "none";
            modalFooter.innerHTML = `<button class="btn btn-autofill" id="detect-btn">Detect Issue With AI</button>`;
            detectBtn = content.querySelector("#detect-btn");
            setupDetectButton();
        });

        closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
            detectionResult.innerHTML = "";
            commentSection.style.display = "none";
            locationInput.value = "";
            descriptionInput.value = "";
            modalFooter.innerHTML = `<button class="btn btn-autofill" id="detect-btn">Detect Issue With AI</button>`;
            detectBtn = content.querySelector("#detect-btn");
            setupDetectButton();
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("active");
                detectionResult.innerHTML = "";
                commentSection.style.display = "none";
                locationInput.value = "";
                descriptionInput.value = "";
                modalFooter.innerHTML = `<button class="btn btn-autofill" id="detect-btn">Detect Issue With AI</button>`;
                detectBtn = content.querySelector("#detect-btn");
                setupDetectButton();
            }
        });

        imageUploadContainer.addEventListener("click", () => {
            imageInput.click();
        });

        imageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imageUploadContainer.innerHTML = `
            <img src="${e.target.result}" alt="Selected image" style="max-width: 100%; max-height: 200px;">
            <p>Click to change image</p>
            <input type="file" id="issue-image" accept="image/*" style="display: none;">
          `;
                };
                reader.readAsDataURL(file);
            }
        });

        function setupDetectButton() {
            if (detectBtn) {
                detectBtn.removeEventListener("click", handleDetect);
                detectBtn.addEventListener("click", handleDetect);
            }
        }

        function handleDetect() {
            console.log("Detect button clicked");
            const file = imageInput.files[0];
            if (!file) {
                alert("Please upload an image first!");
                return;
            }
            if (!user || !user.uid) {
                alert("User not authenticated. Please log in again.");
                return;
            }
            detectIssue(file);
        }

        async function detectIssue(file) {
            try {
                const formData = new FormData();
                formData.append("userId", user.uid);
                formData.append("image", file);
                console.log("Sending FormData:", { file: file.name, userId: user.uid });

                detectionResult.innerHTML = "<p>Detecting issue... Please wait.</p>";
                commentSection.style.display = "none";
                const uploadResponse = await fetch("http://localhost:3000/upload", {
                    method: "POST",
                    body: formData,
                });

                console.log("Upload response status:", uploadResponse.status);
                const uploadResult = await uploadResponse.json();
                console.log("Upload response body:", uploadResult);

                if (!uploadResponse.ok) {
                    throw new Error(uploadResult.error || "Failed to upload image");
                }

                uploadedImagePath = uploadResult.file_path;

                const detectResponse = await fetch("http://localhost:3000/detect", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file_path: uploadResult.file_path }),
                });

                console.log("Detect response status:", detectResponse.status);
                const detectResult = await detectResponse.json();
                console.log("Detect response body:", detectResult);

                if (!detectResponse.ok) {
                    throw new Error(detectResult.error || "Failed to detect issue");
                }

                detectionResult.innerHTML = `<p style="color: green;">Issue detected: ${detectResult.issue}</p>`;
                commentSection.style.display = "block";
                modalFooter.innerHTML = `
          <button class="btn btn-submit" id="submit-btn">Submit Issue</button>
        `;
                setupSubmitButton();
            } catch (error) {
                console.error("Error during detection:", error.message);
                detectionResult.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                commentSection.style.display = "none";
            }
        }

        let uploadedImagePath = "";

        function setupSubmitButton() {
            const submitBtn = content.querySelector("#submit-btn");
            if (submitBtn) {
                submitBtn.removeEventListener("click", handleSubmit);
                submitBtn.addEventListener("click", handleSubmit);
            }
        }

        function handleSubmit() {
            const location = locationInput.value.trim();
            const description = descriptionInput.value.trim();
            if (!location) {
                alert("Location is required!");
                return;
            }
            console.log("Submit clicked - Location:", location);
            console.log("Submit clicked - Issue Description:", description);

            const detectionText =
                detectionResult.textContent.match(/Issue detected: (.+)/);
            if (!detectionText) {
                alert("Please detect an issue first!");
                return;
            }
            const issue = detectionText[1];

            fetch("http://localhost:3000/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.uid,
                    issue: issue,
                    location: location,
                    description: description,
                    imagePath: uploadedImagePath,
                    upvotes: 0,
                    downvotes: 0,
                }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to submit issue");
                    }
                    return response.json();
                })
                .then((result) => {
                    console.log("Submit response:", result);
                    if (result.message) {
                        modal.classList.remove("active");
                        detectionResult.innerHTML = "";
                        commentSection.style.display = "none";
                        locationInput.value = "";
                        descriptionInput.value = "";
                        modalFooter.innerHTML = `<button class="btn btn-autofill" id="detect-btn">Detect Issue With AI</button>`;
                        detectBtn = content.querySelector("#detect-btn");
                        setupDetectButton();
                        fetchIssues();
                        updateTrending();
                        alert("Issue submitted successfully!");
                    }
                })
                .catch((error) => {
                    console.error("Error submitting issue:", error.message);
                    alert("Failed to submit issue: " + error.message);
                });
        }

        const logoutBtn = content.querySelector("#logout-btn");
        logoutBtn.addEventListener("click", async () => {
            try {
                await auth.signOut();
                window.history.pushState({}, "", "/login");
                window.dispatchEvent(new PopStateEvent("popstate"));
            } catch (error) {
                console.error("Error signing out:", error.message);
                alert("Failed to sign out: " + error.message);
            }
        });

        setupDetectButton();
        fetchIssues();
    }

    onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            console.log("Dashboard - User Details:", {
                email: currentUser.email,
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                emailVerified: currentUser.emailVerified,
                lastSignInTime: currentUser.metadata.lastSignInTime,
            });
            render(currentUser);
        } else {
            window.location.href = "/#/login";
        }
    });

    return {
        content,
    };
})();