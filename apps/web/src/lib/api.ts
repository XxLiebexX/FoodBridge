import { demoStorage, DEMO_USERS } from './demoStorage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : 'http://localhost:5001/api');

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
  const isDemo = demoStorage.isDemoActive();

  // Strip query parameters for endpoint matching
  const urlWithoutQuery = endpoint.split('?')[0];
  const cleanUrl = urlWithoutQuery.replace(/^\/api/, '');

  // Intercept demo login if requested via API
  if (method === 'POST' && cleanUrl === '/auth/login' && body?.email?.toLowerCase().endsWith('@foodbridge.ai')) {
    const email = body.email.toLowerCase();
    let role: 'donor' | 'ngo' | 'volunteer' | 'admin' = 'donor';
    if (email.startsWith('ngo')) role = 'ngo';
    else if (email.startsWith('vol')) role = 'volunteer';
    else if (email.startsWith('admin')) role = 'admin';

    const user = DEMO_USERS[role];
    demoStorage.setDemoActive(true);
    return {
      user,
      accessToken: `demo_access_token_${Date.now()}`,
      refreshToken: `demo_refresh_token_${Date.now()}`
    };
  }

  if (!isDemo) return undefined;

  // 1. DONATIONS
  if (method === 'POST' && cleanUrl === '/donations') {
    return demoStorage.createDonation(body);
  }
  if (method === 'GET' && cleanUrl === '/donations/stats') {
    return demoStorage.getDonationStats();
  }
  if (method === 'GET' && cleanUrl.startsWith('/donations')) {
    return demoStorage.getDonations();
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
  if (method === 'GET' && cleanUrl.startsWith('/ngos/nearby')) {
    return demoStorage.getNearbyNGOs();
  }
  if (method === 'GET' && cleanUrl === '/ngos') {
    return demoStorage.getNearbyNGOs();
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

  // 5. IMPACT OVERVIEW & ANALYTICS
  if (method === 'GET' && cleanUrl === '/impact/overview') {
    return demoStorage.getImpact();
  }
  if (method === 'GET' && cleanUrl === '/impact/trends') {
    return demoStorage.getTrends();
  }
  if (method === 'GET' && cleanUrl === '/impact/leaderboards') {
    return demoStorage.getLeaderboards();
  }
  if (method === 'GET' && cleanUrl === '/impact/badges') {
    return demoStorage.getBadges();
  }

  // 6. ADMIN
  if (method === 'GET' && cleanUrl.startsWith('/admin/organizations')) {
    return demoStorage.getOrganizations();
  }
  if (method === 'PATCH' && cleanUrl.match(/^\/admin\/organizations\/([^\/]+)\/verify$/)) {
    const id = cleanUrl.split('/')[3];
    return demoStorage.verifyOrganization(id, body?.status);
  }
  if (method === 'GET' && cleanUrl === '/admin/users') {
    return demoStorage.getUsers();
  }
  if (method === 'PATCH' && cleanUrl.match(/^\/admin\/users\/([^\/]+)\/status$/)) {
    const id = cleanUrl.split('/')[3];
    return demoStorage.toggleUserStatus(id, body?.isActive);
  }
  if (method === 'GET' && cleanUrl === '/admin/audit-logs') {
    return demoStorage.getAuditLogs();
  }
  if (method === 'GET' && cleanUrl.startsWith('/admin/export/')) {
    return 'id,type,created_at\n1,DEMO_EXPORT,2026-10-10';
  }

  // 7. AI INTELLIGENCE
  if (method === 'GET' && cleanUrl === '/ai/metrics') {
    return demoStorage.getAIMetrics();
  }
  if (method === 'GET' && cleanUrl.startsWith('/ai/forecasts')) {
    return demoStorage.getAIForecasts();
  }
  if (method === 'POST' && cleanUrl === '/ai/predict/surplus') {
    return demoStorage.predictSurplus(body);
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

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr: any) {
    throw new ApiError(
      'Live backend server is unreachable. For evaluation, please use the 1-Click Evaluator Demo Sign-In to run in browser storage.',
      0,
      'NETWORK_ERROR'
    );
  }

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
