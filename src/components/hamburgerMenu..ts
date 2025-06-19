export default function hamburgerMenu(): void {
  const navList = document.querySelector('.navbar');
  const hamburgerButton = document.querySelector('.hamburger__icon');
  const bodyWrapper = document.querySelector('body');

  if (hamburgerButton && bodyWrapper && navList) {
    hamburgerButton.addEventListener('click', () => {
      bodyWrapper.classList.toggle('body-overflow');
      hamburgerButton.classList.toggle('active');
      navList.classList.toggle('active');
    });
  }

  if (navList && bodyWrapper && hamburgerButton)
    navList.addEventListener('click', (event) => {
      if (event) {
        const target = event.target;
        if (target instanceof HTMLElement) {
          if (target.classList.contains('nav-link')) {
            bodyWrapper.classList.remove('body-overflow');
            navList.classList.remove('active');
            hamburgerButton.classList.remove('active');
          }
        }
      }
    });
}
