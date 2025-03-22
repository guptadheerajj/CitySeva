import "./style.css";
import { home } from "./home.js";

const container = document.querySelector("#content");
container.innerHTML = "";
container.appendChild(home.content);

console.log(home.content);
