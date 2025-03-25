import "./style.css";
import { homeTab } from "./home.js";
import { aboutTab } from "./about.js";
import { featuresTab } from "./features.js";
import { contactTab } from "./contact.js";
import { register } from "./register.js";
import { login } from "./login.js";

const tabContentMap = {
	homeTab: homeTab.content,
	aboutTab: aboutTab.content,
	featuresTab: featuresTab.content,
	contactTab: contactTab.content,
	register: register.content,
	login: login.content,
};

const container = document.querySelector("#content");
const tabs = document.querySelectorAll(".tab");

const tabListObj = {};
tabs.forEach((tab) => {
	tabListObj[tab.getAttribute("data-name")] = tab;
});

function toggleActiveTabClass(target) {
	const targetType = target.dataset.type;
	for (const tab in tabListObj) {
		tabListObj[tab].classList.remove("active-tab");
	}

	// if a tab is clicked then only add active-tab class
	if (targetType === "tab") {
		target.classList.add("active-tab");
	}
}

function appendContent(target) {
	container.innerHTML = "";
	const tabName = target.dataset.name;
	container.appendChild(tabContentMap[tabName]);
}

for (const tab in tabListObj) {
	tabListObj[tab].addEventListener("click", (event) => {
		toggleActiveTabClass(event.target);
		appendContent(event.target);
	});
}

function displayInitialHome() {
	const home = document.querySelector('[data-name = "homeTab"]');
	toggleActiveTabClass(home);
	appendContent(home);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", displayInitialHome);
} else {
	displayInitialHome();
}
