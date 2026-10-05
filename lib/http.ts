import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function zodMessage(error: ZodError) {
  const issue = error.issues[0];
  if (!issue) return 'Invalid request';
  const field = issue.path.join('.');
  return field ? `${field}: ${issue.message}` : issue.message;
}
