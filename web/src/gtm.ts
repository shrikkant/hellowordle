'use client';

import { sendGTMEvent } from '@next/third-parties/google';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function gtmEvent(event: string, data: Record<string, unknown> = {}): void {
  if (!GTM_ID || typeof window === 'undefined') return;
  sendGTMEvent({ event, ...data });
}
