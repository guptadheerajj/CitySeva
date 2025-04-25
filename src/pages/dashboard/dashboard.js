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
		const date = `${month}/${day}/${year}`; // Convert to MM/DD/YYYY
		const issueId = issue._id || "unknown"; // Fallback to prevent undefined
		const userVote = issue.votes.find(
			(v) => v.userId === auth.currentUser?.uid
		)?.voteType;

		return `
      <div class="issue-card" data-id="${issueId}">
        <div class="issue-card-image-container">
          <img src="${issue.image}" alt="${
			issue.issue
		}" class="issue-card-image">
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
		const date = `${month}/${day}/${year}`; // Convert to MM/DD/YYYY
		return `
      <div class="trending-item">
      <div class="trending-item-image-container">
          <img src="${issue.image}" alt="${
			issue.issue
		}" class="trending-item-image">
        </div>
        <div class="trending-item-content-wrapper">
          <div class="trending-item-header">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${
							issue.userId
						}" alt="User avatar" class="trending-user-avatar">
            <div class="trending-item-header-info">
              <p class="username">@${issue.username}</p>
              <p class="date">${date}</p>
            </div>
          </div>
          <div class="trending-item-status">
            <h3>${issue.issue}</h3>
            <p>${issue.location}</p>
            <p>${issue.description || "No description"}</p>
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
			return await response.json();
		} catch (error) {
			console.error("Error fetching trending issues:", error);
			return [];
		}
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
		let detectBtn = content.querySelector("#detect-btn");

		// Populate trending issues dynamically
		async function updateTrending() {
			const trendingIssues = await fetchTrendingIssues();
			if (trendingIssues.length > 0) {
				trendingContainer.innerHTML = trendingIssues
					.map((issue) => renderTrendingCard(issue))
					.join("");
			} else {
				trendingContainer.innerHTML = "<p>No trending issues yet.</p>";
			}
		}
		updateTrending(); // Initial load
		setInterval(updateTrending, 5000); // Poll every 5 seconds

		uploadBtn.addEventListener("click", () => {
			modal.classList.add("active");
			detectionResult.innerHTML = "";
			commentSection.style.display = "none";
			modalFooter.innerHTML = `<button class="btn btn-autofill" id="detect-btn">Detect Issue With AI</button>`;
			detectBtn = content.querySelector("#detect-btn"); // Reassign after re-rendering
			setupDetectButton();
		});

		closeBtn.addEventListener("click", () => {
			modal.classList.remove("active");
			detectionResult.innerHTML = "";
			commentSection.style.display = "none";
			locationInput.value = "";
			descriptionInput.value = "";
			modalFooter.innerHTML = `<button class="btn btn-autofill" id="detect-btn">Detect Issue With AI</button>`;
			detectBtn = content.querySelector("#detect-btn"); // Reassign after re-rendering
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
				detectBtn = content.querySelector("#detect-btn"); // Reassign after re-rendering
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
				detectBtn.removeEventListener("click", handleDetect); // Remove old listener to avoid duplicates
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

				detectionResult.innerHTML = "<p>Detecting issue...</p>";
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

		async function fetchIssues() {
			try {
				const response = await fetch("http://localhost:3000/issues");
				const issues = await response.json();
				issues.sort((a, b) => {
					const dateA = new Date(a.date.split("/").reverse().join("-"));
					const dateB = new Date(b.date.split("/").reverse().join("-"));
					return dateB - dateA;
				});
				issuesContainer.innerHTML = issues
					.map((issue) => renderIssueCard(issue))
					.join("");

				const voteButtons = content.querySelectorAll(".vote-btn");
				voteButtons.forEach((button) => {
					button.addEventListener("click", async () => {
						const issueId = button.closest(".issue-card").dataset.id;
						const voteType = button.dataset.type;
						if (!issueId || issueId === "unknown") {
							console.error("Invalid issueId:", issueId);
							return;
						}
						await updateVote(issueId, voteType, user.uid);
						fetchIssues();
					});
				});
			} catch (error) {
				console.error("Error fetching issues:", error);
			}
		}

		function setupSubmitButton() {
			const submitBtn = content.querySelector("#submit-btn");
			if (submitBtn) {
				submitBtn.removeEventListener("click", handleSubmit); // Remove old listener to avoid duplicates
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
				.then((response) => response.json())
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
					}
				})
				.catch((error) => {
					console.error("Error submitting issue:", error);
					alert("Failed to submit issue!");
				});
		}

		async function updateVote(issueId, voteType, userId) {
			try {
				console.log("Sending vote:", { issueId, voteType, userId });
				const response = await fetch("http://localhost:3000/vote", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ issueId, voteType, userId }),
				});
				const result = await response.json();
				console.log("Vote update response:", result);
				if (!response.ok) {
					throw new Error(result.error || "Vote update failed");
				}
			} catch (error) {
				console.error("Error updating vote:", error);
			}
		}

		const logoutBtn = content.querySelector("#logout-btn");
		logoutBtn.addEventListener("click", async () => {
			try {
				await auth.signOut();
				window.history.pushState({}, "", "/login");
				window.dispatchEvent(new PopStateEvent("popstate"));
			} catch (error) {
				console.error("Error signing out:", error);
			}
		});

		setupDetectButton();
		fetchIssues();
	}

	onAuthStateChanged(auth, (user) => {
		if (user) {
			console.log("Dashboard - User Details:", {
				email: user.email,
				uid: user.uid,
				displayName: user.displayName,
				emailVerified: user.emailVerified,
				lastSignInTime: user.metadata.lastSignInTime,
			});
			render(user);
		} else {
			window.location.href = "/#/login";
		}
	});

	return {
		content,
	};
})();
