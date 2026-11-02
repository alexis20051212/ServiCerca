// Cliente HTTP de la API de ServiCerca.
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Si algún día publicas la API en un servidor, escribe aquí su dirección,
// por ejemplo: 'https://api.servicerca.mx'. Vacío = usar la misma PC que corre Expo.
export const API_URL = '';

export function apiBase() {
  if (API_URL) return API_URL.replace(/\/$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.origin;
  const host =
    (Constants.expoConfig && Constants.expoConfig.hostUri) ||
    (Constants.expoGoConfig && Constants.expoGoConfig.debuggerHost) ||
    (Constants.manifest2 && Constants.manifest2.extra && Constants.manifest2.extra.expoGo && Constants.manifest2.extra.expoGo.debuggerHost) ||
    'localhost:8081';
  return `http://${host.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
}

export class ApiError extends Error {
  constructor(message, { status = 0, db = false, network = false } = {}) {
    super(message);
    this.status = status;
    this.db = db;
    this.network = network;
  }
}

export async function api(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${apiBase()}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError('No se pudo conectar con el servidor de ServiCerca.', { network: true });
  }
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }
  if (!res.ok) throw new ApiError(data.error || `Error ${res.status}`, { status: res.status, db: !!data.db });
  return data;
}
