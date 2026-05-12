/**
 * Shared types for CRO Ideas Board.
 *
 * Single source of truth for the CROIdea interface and related types.
 * Import from here instead of defining inline interfaces.
 */

export interface CROIdea {
  id: number;
  title: string;
  description: string;
  reason: string;
  purpose: string;
  category: { id: number; name: string; slug: string };
  status: string;
  previousStatus: string | null;
  mockupUrl: string | null;
  createdAt: string;
}
