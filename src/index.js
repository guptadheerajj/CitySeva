import "./style.css";
import { homeTab } from "./home.js";
import { aboutTab } from "./about.js";
import { featuresTab } from "./features.js";
import { contactTab } from "./contact.js";
import { register } from "./register.js";

const tabContentMap = {
	homeTab: homeTab.content,
	aboutTab: aboutTab.content,
	featuresTab: featuresTab.content,
	contactTab: contactTab.content,
	register: register.content,
};

const container = document.querySelector("#content");
const tabs = document.querySelectorAll(".tab");
const buttons = document.querySelectorAll(".btn");
console.log(buttons);

const tabListObj = {};
tabs.forEach((tab) => {
	tabListObj[tab.getAttribute("data-name")] = tab;
});

function toggleActiveTabClass(target) {
	for (const tab in tabListObj) {
		tabListObj[tab].classList.remove("active-tab");
	}
	target.classList.add("active-tab");
}

function appendContent(target) {
	container.innerHTML = "";
	const tabName = target.dataset.name;
	container.appendChild(tabContentMap[tabName]);
}

buttons.forEach((node) => {
	node.addEventListener("click", () => {
		const nodeName = node.dataset.name;
		console.log(nodeName);

		container.innerHTML = "";
		container.appendChild(tabContentMap[nodeName]);
	});
});

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
