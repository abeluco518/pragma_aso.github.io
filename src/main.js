import './sass/main.scss';

const menuButton = document.querySelector('#menu');
const navBar = document.querySelector('.header__nav');
let menuOpen = false;

menuButton.addEventListener('click', () => {
  menuOpen = !menuOpen;

  if (menuOpen) {
    navBar.classList.add('is-open');
    menuButton.style.transform = 'rotate(180deg)';
  } else {
    navBar.classList.remove('is-open');
    menuButton.style.transform = 'rotate(0deg)';
  }
});