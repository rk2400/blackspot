'use client';

// Use relative API paths so the client talks to the same origin the app is served from.
// This avoids issues when the dev server port differs from NEXT_PUBLIC_APP_URL.
const API_URL = '';

// Shopping-related APIs removed

export async function login(email: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
  return data;
}

export async function verifyOTP(email: string, code: string) {
  const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important: include cookies
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
  return data;
}

export async function logout() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Not authenticated');
  return data.user;
}

export type AddressPayload = {
  street?: string;
  city?: string;
  state?: string;
  pincode: string;
  full?: string;
};

export async function saveAddress(address: AddressPayload) {
  const res = await fetch(`${API_URL}/api/auth/address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ address }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save address');
  return data;
}

export async function createAccount(name: string, email: string, phone: string) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create account');
  return data;
}

// Orders, coupons, and payments removed

// Admin APIs
export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to login');
  return data;
}

// Admin product and order APIs removed

export async function getEmailTemplates() {
  const res = await fetch(`${API_URL}/api/admin/email-templates`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch templates');
  return data.templates;
}

export async function updateEmailTemplate(template: any) {
  const res = await fetch(`${API_URL}/api/admin/email-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(template),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update template');
  return data.template;
}

// Admin stats removed

export async function getAdminUsers() {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
  return data.users;
}

export async function updateAdminUserLock(id: string, locked: boolean) {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ locked }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update user');
  return data.user;
}

export async function getAdminUser(id: string) {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
  return data.user;
}

// Coupons and payments removed

// Manifest configuration
export async function getManifestConfig() {
  const res = await fetch(`${API_URL}/api/manifest/config`, {
    cache: 'no-store',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch manifest config');
  return data;
}

export async function getAdminManifestLimit() {
  const res = await fetch(`${API_URL}/api/admin/settings/manifest-limit`, {
    cache: 'no-store',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch admin manifest limit');
  return data;
}

export async function updateAdminManifestLimit(maxVideos: number) {
  const res = await fetch(`${API_URL}/api/admin/settings/manifest-limit`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ maxVideos }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update manifest limit');
  return data;
}

export async function updateAdminUserManifestLimit(id: string, maxVideos: number) {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ manifestMaxVideos: maxVideos }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update manifest limit');
  return data.user;
}
