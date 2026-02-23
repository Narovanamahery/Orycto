export function createSidebar() {
  const menuSide = document.createElement('nav');
  menuSide.classList.add('menu-side');
  menuSide.innerHTML = `
    <a href="#dashboard" class="menu-item active">
      <img src="./assets/img/icon/dashboard.png" alt="">
      <h3>Home</h3>
    </a>
    <a href="#livestock" class="menu-item">
      <img src="./assets/img/icon/cheptel.png" alt="">
      <h3>Livestock</h3>
      <span class="menu-badge">42</span>
    </a>
    <a href="#health" class="menu-item">
      <img src="./assets/img/icon/health.png" alt="">
      <h3>Health</h3>
      <span class="menu-badge alert">5</span>
    </a>
    <a href="#reproduction" class="menu-item">
      <img src="./assets/img/icon/repro.png" alt="">
      <h3>Reproduction</h3>
      <span class="menu-badge">3</span>
    </a>
    <a href="#feeding" class="menu-item">
      <img src="./assets/img/icon/aliment.png" alt="">
      <h3>Feeding</h3>
      <span class="menu-badge alert">2</span>
    </a>
    <a href="#statistics" class="menu-item">
      <img src="./assets/img/icon/stat.png" alt="">
      <h3>Statistics</h3>
    </a>
  `
  return menuSide;
}
