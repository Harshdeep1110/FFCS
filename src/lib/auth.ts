/**
 * Authentication Helpers
 * 
 * Provides JWT token creation/verification and password hashing
 * using bcryptjs and jose libraries.
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { TokenPayload } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ffcs-dev-secret-change-in-production'
);

const TOKEN_EXPIRY = '8h';
const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT token with the given payload.
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token.
 * Returns the payload if valid, null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
