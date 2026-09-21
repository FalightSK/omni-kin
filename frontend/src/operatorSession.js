const TOKEN_KEY = 'omnikin.operator-token';

export async function establishOperatorSession() {
  const params = new URLSearchParams(window.location.search);
  let code = params.get('pair');
  if (!code) {
    const info = await fetch('/api/server/info').then((response) => response.json());
    code = info.pairing_code;
  }
  if (!code) throw new Error('No operator pairing code was supplied');
  const response = await fetch(`/api/pairing/session?code=${encodeURIComponent(code)}`);
  if (!response.ok) throw new Error('Operator pairing failed');
  const payload = await response.json();
  sessionStorage.setItem(TOKEN_KEY, payload.operator_token);
}

export function installAuthenticatedFetch() {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, window.location.origin);
    const method = (init.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
    if (url.origin === window.location.origin && url.pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const headers = new Headers(init.headers || (typeof input === 'object' ? input.headers : undefined));
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (token) headers.set('X-OmniKin-Token', token);
      return nativeFetch(input, { ...init, headers });
    }
    return nativeFetch(input, init);
  };
}
