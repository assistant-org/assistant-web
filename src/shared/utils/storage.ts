
// The manual recommends 'js-cookie'. This is a localStorage-based polyfill for demonstration.
// In a real project, replace with: import cookie from 'js-cookie';

export const saveStorage = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};

export const getStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const removeFromStorage = (key: string): void => {
  localStorage.removeItem(key);
};
