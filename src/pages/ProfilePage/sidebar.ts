import { AuthService } from '../../services/authService';
import { navigateTo, navigation } from '../../main';

export default function createSidebar(onNavigate: (sectionId: string) => void): HTMLElement {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  const links = [
    { label: 'Профиль', id: 'profile' },
    { label: 'Адресс', id: 'adress' },
    { label: 'Пароль', id: 'password' },
    { label: 'Выйти', id: 'logout' },
  ];

  links.forEach(({ label, id }) => {
    const link = document.createElement('button');
    link.textContent = label;
    link.className = 'sidebar-link';
    link.addEventListener('click', () => {
      if (id === 'logout') {
        AuthService.logout();
        navigation.render();
        navigateTo('/');
        return;
      }
      sidebar.querySelectorAll('.sidebar-link').forEach((button) => button.classList.remove('active'));
      link.classList.add('active');

      onNavigate(id);
    });
    sidebar.appendChild(link);
  });

  return sidebar;
}
