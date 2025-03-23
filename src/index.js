import "./style.css";
import { home } from "./home.js";
import { about } from "./about.js";
import { features } from "./features.js";
import { contact } from "./contact.js";

const container = document.querySelector("#content");
const tabs = document.querySelectorAll(".tab");

const tabListObj = {};
tabs.forEach((tab) => {
	tabListObj[tab.getAttribute("data-name")] = tab;
});

const tabListArr = Array.from(tabs);

function toggleActiveTabClass(event) {
	tabListArr.forEach((tab) => {
		tab.classList.remove("active-tab");
	});
	event.target.classList.add("active-tab");
}

for (const element of tabListArr) {
	element.addEventListener("click", toggleActiveTabClass);
}

// home logic
const homeTab = document.querySelector(".home-tab");

function displayHome() {
	homeTab.classList.toggle("active-tab");
	container.innerHTML = "";
	container.appendChild(home.content);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", displayHome);
} else {
	displayHome();
}

// about
tabListObj.about.addEventListener("click", () => {
	container.innerHTML = "";
	container.appendChild(about.content);
});
homeTab.addEventListener("click", () => {
	container.innerHTML = "";
	container.appendChild(home.content);
});
tabListObj.features.addEventListener("click", () => {
	container.innerHTML = "";
	container.appendChild(features.content);
});
tabListObj.contact.addEventListener("click", () => {
	container.innerHTML = "";
	container.appendChild(contact.content);
});
