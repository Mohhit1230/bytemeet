export function clearAuthCookies() {
  if (typeof document === 'undefined') return;

  const cookieNames = ['accessToken', 'refreshToken'];

  cookieNames.forEach((name) => {
    // Clear for current path
    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}
