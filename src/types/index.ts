// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Credential {
  _id: string;
  platform: 'twitter' | 'facebook' | 'instagram';
  username?: string;
  email?: string;
  password: string;
  verified: boolean;
  createdAt: string;
}

export interface Post {
  _id: string;
  content: string;
  platforms: string[];
  image?: string;
  status: 'draft' | 'published' | 'failed';
  createdAt: string;
  publishedAt?: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: any;
  color: string;
  fields: string[];
}

export interface ContentGenerationRequest {
  topic: string;
  tone: 'professional' | 'casual' | 'humorous' | 'inspirational';
  length: 'short' | 'medium' | 'long';
  platforms: string[];
}

export interface ContentGenerationResponse {
  content: string;
  metadata: {
    topic: string;
    tone: string;
    length: string;
    platforms: string[];
    generatedAt: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface PostHistory {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface AutomationResult {
  platform: string;
  success: boolean;
  message: string;
  postId?: string;
}