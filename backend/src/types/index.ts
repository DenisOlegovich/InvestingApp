import type { Request } from 'express';

export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface UserRow {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface ResetTokenData {
  token: string;
  expires: number;
}
