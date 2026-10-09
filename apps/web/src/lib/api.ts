import { demoStorage } from './demoStorage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export class ApiError extends Error {
  public code?: string;
  public status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Intercept demo actions to store data exclusively in browser localStorage.
 * Real registered accounts bypass this completely and write directly to MongoDB.
 */
function interceptDemoRequest(method: string, endpoint: string, body?: any): any | undefined {
  if (!demoStorage.isDemoActive()) return undefined;

  const cleanUrl = endpoint.replace(/^\/api/, '');

  // 1. DONATIONS
  if (method === 'POST' && cleanUrl === '/donations') {
    return demoStorage.createDonation(body);
  }
  if (method === 'GET' && cleanUrl === '/donations/stats') {
    return demoStorage.getDonationStats();
  }
  if (method === 'GET' && cleanUrl.startsWith('/donations')) {
    const list = demoStorage.getDonations();
    return { donations: list, total: list.length };
  }

  // 2. DEMANDS & RECOMMENDATIONS
  if (method === 'POST' && cleanUrl === '/ngos/demands') {
    return demoStorage.createDemand(body);
  }
  if (method === 'GET' && cleanUrl === '/ngos/demands') {
    return demoStorage.getDemands();
  }
  if (method === 'GET' && cleanUrl === '/ngos/recommendations') {
    return demoStorage.getRecommendations();
  }
  if (method === 'POST' && cleanUrl.match(/^\/ngos\/donations\/([^\/]+)\/accept$/)) {
    const id = cleanUrl.split('/')[3];
    return demoStorage.acceptDonation(id);
  }
  if (method === 'POST' && cleanUrl.match(/^\/ngos\/donations\/([^\/]+)\/reject$/)) {
    const id = cleanUrl.split('/')[3];
    return demoStorage.rejectDonation(id);
  }

  // 3. PICKUPS & DELIVERIES
  if (method === 'GET' && cleanUrl === '/pickups/available') {
    return demoStorage.getAvailablePickups();
  }
  if (method === 'POST' && cleanUrl.match(/^\/pickups\/([^\/]+)\/accept$/)) {
    const id = cleanUrl.split('/')[2];
    return demoStorage.claimPickup(id);
  }
  if (method === 'PATCH' && cleanUrl.match(/^\/pickups\/([^\/]+)\/status$/)) {
    const id = cleanUrl.split('/')[2];
    return demoStorage.updatePickupStatus(id, body?.status);
  }
  if (method === 'POST' && cleanUrl.match(/^\/pickups\/deliveries\/([^\/]+)\/complete$/)) {
    const id = cleanUrl.split('/')[3];
    return demoStorage.completeDelivery(id, body);
  }

  // 4. NOTIFICATIONS
  if (method === 'GET' && cleanUrl === '/notifications') {
    const notifs = demoStorage.getNotifications();
    return {
      notifications: notifs,
      unreadCount: notifs.filter((n) => !n.isRead).length
    };
  }
  if (method === 'PATCH' && cleanUrl === '/notifications/read-all') {
    demoStorage.markNotificationsRead();
    return { success: true };
  }

  // 5. IMPACT OVERVIEW (Demo)
  if (method === 'GET' && cleanUrl === '/impact/overview') {
    return demoStorage.getImpact();
  }

  return undefined;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  let body: any = undefined;

  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = options.body;
    }
  }

  // Check demo browser storage interceptor
  const demoResult = interceptDemoRequest(method, endpoint, body);
  if (demoResult !== undefined) {
    // Artificial small delay for realistic UX feedback
    await new Promise((r) => setTimeout(r, 60));
    return demoResult as T;
  }

  // Real account -> persist to backend Express & MongoDB
  const token = typeof window !== 'undefined' ? localStorage.getItem('foodbridge_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errMessage = 'An unexpected error occurred';
    let code: string | undefined;

    try {
      const errData = await response.json();
      errMessage = errData.message || errMessage;
      code = errData.code;
    } catch {
      errMessage = response.statusText || errMessage;
    }

    throw new ApiError(errMessage, response.status, code);
  }

  // Handle blob or text for file downloads (e.g. CSV exports)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return (await response.text()) as any;
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  get: <T = any>(url: string, options?: RequestInit) =>
    request<T>(url, { method: 'GET', ...options }),

  post: <T = any>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    }),

  patch: <T = any>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    }),

  delete: <T = any>(url: string, options?: RequestInit) =>
    request<T>(url, { method: 'DELETE', ...options })
};
