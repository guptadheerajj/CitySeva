import "./pages/landing/style.css";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

import { homeTab } from "./pages/landing/home.js";
import { aboutTab } from "./pages/landing/about.js";
import { featuresTab } from "./pages/landing/features.js";
import { contactTab } from "./pages/landing/contact.js";
import { register } from "./pages/landing/register.js";
import { login } from "./pages/landing/login.js";
import { dashboard } from "./pages/dashboard/dashboard.js";

const tabContentMap = {
	homeTab: homeTab.content,
	aboutTab: aboutTab.content,
	featuresTab: featuresTab.content,
	contactTab: contactTab.content,
	register: register.content,
	login: login.content,
};

const routes = {
	"/": homeTab.content,
	"/about": aboutTab.content,
	"/features": featuresTab.content,
	"/contact": contactTab.content,
	"/register": register.content,
	"/login": login.content,
	"/dashboard": dashboard.content,
};

function toggleActiveTabClass(target) {
	const tabs = document.querySelectorAll(".tab");
	tabs.forEach((tab) => {
		tab.classList.remove("active-tab");
	});

	if (target && target.dataset.type === "tab") {
		target.classList.add("active-tab");
	}
}

function renderContent(content, isDashboard = false) {
	const container = document.querySelector("#content");
	const navbar = document.querySelector("#navbar");
	const header = document.querySelector("header");

	if (container) {
		container.innerHTML = "";

		if (navbar) {
			navbar.style.display = isDashboard ? "none" : "flex";
		}
		if (header) {
			header.style.display = isDashboard ? "none" : "block";
		}

		container.appendChild(content);
	}
}

function setupTabListeners() {
	const tabs = document.querySelectorAll(".tab");
	tabs.forEach((tab) => {
		tab.addEventListener("click", (event) => {
			const target = event.target;
			const tabName = target.dataset.name;

			toggleActiveTabClass(target);

			if (tabContentMap[tabName]) {
				renderContent(tabContentMap[tabName], false);
				const path =
					tabName === "homeTab" ? "/" : `/${tabName.replace("Tab", "")}`;
				window.history.pushState({}, "", path);
			}
		});
	});
}

function handleRoute() {
	const path = window.location.hash.slice(1) || "/";
	
	if (path === "/dashboard") {
		// Check if user is authenticated for dashboard access
		onAuthStateChanged(auth, (user) => {
			if (user) {
				renderContent(dashboard.content, true);
			} else {
				window.location.href = "/#/login";
			}
		});
	} else {
		renderContent(routes[path] || routes["/"], false);

		const tabName = path === "/" ? "homeTab" : `${path.slice(1)}Tab`;
		const tab = document.querySelector(`[data-name="${tabName}"]`);
		if (tab) {
			toggleActiveTabClass(tab);
		}
	}
}

// Listen for route changes
window.addEventListener("popstate", handleRoute);

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
	if (user && window.location.hash === "#/login") {
		window.location.href = "/#/dashboard";
	}
});

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
	setupTabListeners();
	handleRoute();
});
