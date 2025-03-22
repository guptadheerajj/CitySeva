import "./style.css";
import { home } from "./home.js";

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
