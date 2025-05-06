import './pages/registration.css';
import { RegistrationPage } from './pages/registration';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app') || document.body;

  const path = window.location.pathname;

  if (path === '/registration' || path === '/register' || path === '/') {
    new RegistrationPage(appContainer);
  }
});
