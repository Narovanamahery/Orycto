import { createHeader } from "./components/header.js";
import { createSidebar } from "./components/sidebar.js";

const App = document.querySelector('.app');
App.appendChild(createHeader());

const container = document.createElement('div');
container.classList.add('container');


const contentArea = document.createElement('div');
contentArea.classList.add('content');
container.appendChild(createSidebar());
container.appendChild(contentArea);

App.appendChild(container);

export { contentArea };