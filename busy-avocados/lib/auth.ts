import { cookies } from 'next/headers';
import { turso } from './turso';
import crypto from 'crypto';

export function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await turso.execute({
    sql: 'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    args: [sessionId, userId, expiresAt],
  });

  return sessionId;
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (!sessionId) return null;

  const result = await turso.execute({
    sql: `SELECT s.id as session_id, s.expires_at, u.id as user_id, u.name, u.email
          FROM sessions s
          JOIN users u ON s.user_id = u.id
          WHERE s.id = ? AND s.expires_at > datetime('now')`,
    args: [sessionId],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    sessionId: row.session_id as string,
    userId: row.user_id as number,
    name: row.name as string,
    email: row.email as string,
  };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (sessionId) {
    await turso.execute({
      sql: 'DELETE FROM sessions WHERE id = ?',
      args: [sessionId],
    });
  }
  cookieStore.delete('session');
}
