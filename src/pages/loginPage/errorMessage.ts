export default function createErrorMessage(text: string, className: string): HTMLElement {
  const error = document.createElement('span');
  error.classList.add('error-message', className);
  error.textContent = text;
  return error;
}
