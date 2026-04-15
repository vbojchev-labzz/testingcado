'use server';

import { turso } from '@/lib/turso';
import { generateCode, createSession, setSessionCookie } from '@/lib/auth';
import { sendVerificationCode } from '@/lib/email';
import { redirect } from 'next/navigation';

export async function sendCode(
  _prevState: { error?: string; success?: boolean; email?: string },
  formData: FormData
) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!name || !email) {
    return { error: 'Name and email are required.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await turso.execute({
    sql: `UPDATE verification_codes SET used = 1 WHERE email = ? AND used = 0`,
    args: [email],
  });

  await turso.execute({
    sql: 'INSERT INTO verification_codes (email, name, code, expires_at) VALUES (?, ?, ?, ?)',
    args: [email, name, code, expiresAt],
  });

  try {
    await sendVerificationCode(email, code, name);
  } catch {
    return { error: 'Failed to send verification email. Please try again.' };
  }

  return { success: true, email };
}

export async function verifyCode(
  _prevState: { error?: string },
  formData: FormData
) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const code = (formData.get('code') as string)?.trim();

  if (!email || !code) {
    return { error: 'Email and code are required.' };
  }

  const result = await turso.execute({
    sql: `SELECT * FROM verification_codes
          WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
          ORDER BY id DESC LIMIT 1`,
    args: [email, code],
  });

  if (result.rows.length === 0) {
    return { error: 'Invalid or expired code. Please try again.' };
  }

  const verificationRow = result.rows[0];
  const name = verificationRow.name as string;

  await turso.execute({
    sql: 'UPDATE verification_codes SET used = 1 WHERE id = ?',
    args: [verificationRow.id],
  });

  let userResult = await turso.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  let userId: number;
  if (userResult.rows.length === 0) {
    const insertResult = await turso.execute({
      sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
      args: [name, email],
    });
    userId = Number(insertResult.lastInsertRowid);
  } else {
    userId = userResult.rows[0].id as number;
    await turso.execute({
      sql: 'UPDATE users SET name = ? WHERE id = ?',
      args: [name, userId],
    });
  }

  const sessionId = await createSession(userId);
  await setSessionCookie(sessionId);

  redirect('/dashboard');
}
