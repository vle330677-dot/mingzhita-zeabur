import type { AppDatabase } from '../db/types';

export const SESSION_TOUCH_INTERVAL_SECONDS = 30;

function buildTouchThreshold(seconds: number) {
  const normalized = Math.max(5, Math.trunc(Number(seconds || SESSION_TOUCH_INTERVAL_SECONDS)));
  return `-${normalized} seconds`;
}

export function touchSessionByToken(
  db: AppDatabase,
  token: string,
  minIntervalSeconds = SESSION_TOUCH_INTERVAL_SECONDS,
) {
  const normalizedToken = String(token || '').trim();
  if (!normalizedToken) return;

  db.prepare(`
    UPDATE user_sessions
    SET lastSeenAt = CURRENT_TIMESTAMP
    WHERE token = ?
      AND (
        lastSeenAt IS NULL
        OR datetime(lastSeenAt) <= datetime('now', ?)
      )
  `).run(normalizedToken, buildTouchThreshold(minIntervalSeconds));
}

export function touchPlayerSessionsByUserId(
  db: AppDatabase,
  userId: number,
  minIntervalSeconds = SESSION_TOUCH_INTERVAL_SECONDS,
) {
  const normalizedUserId = Number(userId || 0);
  if (!normalizedUserId) return;

  db.prepare(`
    UPDATE user_sessions
    SET lastSeenAt = CURRENT_TIMESTAMP
    WHERE userId = ?
      AND role = 'player'
      AND revokedAt IS NULL
      AND (
        lastSeenAt IS NULL
        OR datetime(lastSeenAt) <= datetime('now', ?)
      )
  `).run(normalizedUserId, buildTouchThreshold(minIntervalSeconds));
}
