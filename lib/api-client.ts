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

export async function updateUserInterests(interests: string[]) {
  const res = await fetch(`${API_URL}/api/profile/interests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ interests }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update interests');
  return data.interests as string[];
}

export async function getCommunityTopics() {
  const res = await fetch(`${API_URL}/api/community/topics`, { cache: 'no-store', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch topics');
  return data.topics as Array<{ title: string; slug: string; description?: string; imageUrl?: string; createdAt?: string; createdBy?: { _id: string; name?: string; email?: string } }>;
}

export async function createCommunityTopic(title: string, description: string, imageUrl?: string) {
  const res = await fetch(`${API_URL}/api/community/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title, description, imageUrl }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create topic');
  return data.topic as { title: string; slug: string };
}

export async function getCommunityPosts(slug: string, page?: number, limit?: number) {
  const qs = new URLSearchParams();
  if (page) qs.set('page', String(page));
  if (limit) qs.set('limit', String(limit));
  const url = `${API_URL}/api/community/topics/${slug}/posts${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch posts');
  return data as { topic: { title: string; slug: string; imageUrl?: string }; posts: Array<{ _id: string; title: string; content: string; imageUrl?: string; imageAlt?: string; imageCaption?: string; author: { _id: string; name?: string; email?: string }; likes: any[]; createdAt: string }>; page?: number; total?: number; hasMore?: boolean };
}

export async function createCommunityPost(slug: string, title: string, content: string, imageUrl?: string, imageAlt?: string, imageCaption?: string) {
  const res = await fetch(`${API_URL}/api/community/topics/${slug}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title, content, imageUrl, imageAlt, imageCaption }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create post');
  return data.post as any;
}

export async function getCommunityPost(id: string) {
  const res = await fetch(`${API_URL}/api/community/posts/${id}`, { cache: 'no-store', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch post');
  return data as { post: { _id: string; title: string; content: string; imageUrl?: string; author: { _id: string; name?: string; email?: string } }; likeCount: number; topic: { title: string; slug: string } | null };
}

export async function getCommunityComments(id: string) {
  const res = await fetch(`${API_URL}/api/community/posts/${id}/comments`, { cache: 'no-store', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch comments');
  return data.comments as Array<{ _id: string; content: string; author: { _id: string; name?: string; email?: string }; createdAt: string }>;
}

export async function addCommunityComment(id: string, content: string) {
  const res = await fetch(`${API_URL}/api/community/posts/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add comment');
  return data.comment as any;
}

export async function toggleCommunityLike(id: string) {
  const res = await fetch(`${API_URL}/api/community/posts/${id}/like`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle like');
  return data as { liked: boolean; likeCount: number };
}

export async function uploadCommunityImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/community/image/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload image');
  return data as { url: string; id: string };
}

export async function deleteCommunityTopic(slug: string) {
  const res = await fetch(`${API_URL}/api/community/topics/${slug}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete topic');
  return data as { ok: true };
}

export async function deleteCommunityPost(id: string) {
  const res = await fetch(`${API_URL}/api/community/posts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete post');
  return data as { ok: true };
}

export async function deleteCommunityComment(postId: string, commentId: string) {
  const res = await fetch(`${API_URL}/api/community/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete comment');
  return data as { ok: true };
}

export async function getCommunityFeeds() {
  const res = await fetch(`${API_URL}/api/community/feeds`, { cache: 'no-store', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load feeds');
  return data as { trending: Array<any>; mostDiscussed: Array<any> };
}

export async function updateUserBio(bio: string) {
  const res = await fetch(`${API_URL}/api/profile/bio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ bio }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update bio');
  return data.bio as string;
}

export async function updatePresence(slug: string, typing?: boolean) {
  const res = await fetch(`${API_URL}/api/community/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ slug, typing: !!typing }),
  });
  return res.json();
}

export async function getPresence(slug: string) {
  const res = await fetch(`${API_URL}/api/community/presence/${slug}`, { cache: 'no-store', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch presence');
  return data.items as Array<{ userId: string; label: string; typing: boolean; updatedAt: string; lastSeen?: string | null }>;
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

export async function getMyActivity() {
  const res = await fetch(`${API_URL}/api/community/user/activity`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch activity');
  return data.posts as Array<{ title: string; createdAt: string; topic?: { title: string; slug: string } }>;
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

export async function getAdminStats() {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
  return data as {
    topicCount: number;
    postCount: number;
    commentCount: number;
    userCount: number;
    activeUsers7d: number;
    totalLikes: number;
    cadence7d: Array<{ date: string; count: number }>;
  };
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
