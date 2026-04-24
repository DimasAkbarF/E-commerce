'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

interface IsolatedSession {
  role: string | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;
}

/**
 * Isolated Session Hook - WORKING VERSION
 * 
 * This hook creates a SNAPSHOT of the session at mount time.
 * It uses useSession from NextAuth to get initial state, then fetches fresh role from DB.
 * The snapshot stays constant even if other tabs change the session.
 */
export function useIsolatedSession(requiredRole?: 'admin' | 'user'): IsolatedSession & {
  hasAccess: boolean;
  showWarning: boolean;
} {
  const { data: session, status } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize session snapshot
  useEffect(() => {
    // Wait for NextAuth to finish loading
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    const initSession = async () => {
      setIsLoading(true);
      
      try {
        // Get userId from NextAuth session
        const currentUserId = session?.user?.id;
        
        if (!currentUserId) {
          console.log('[useIsolatedSession] No user in session');
          setRole(null);
          setUserId(null);
          setIsLoading(false);
          setInitialized(true);
          return;
        }

        setUserId(currentUserId);

        // Fetch fresh role from Supabase database
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', currentUserId)
          .maybeSingle();

        if (error) {
          console.error('[useIsolatedSession] Error fetching role:', error);
          // Fallback to session role
          setRole((session?.user as any)?.role || null);
        } else {
          const dbRole = data?.role || null;
          console.log('[useIsolatedSession] Role fetched:', dbRole, 'for user:', currentUserId);
          setRole(dbRole);
        }
      } catch (err) {
        console.error('[useIsolatedSession] Failed to initialize:', err);
        setRole(null);
        setUserId(null);
      }

      setIsLoading(false);
      setInitialized(true);
    };

    initSession();
  }, [status, session?.user?.id]); // Re-run when session status changes

  // Calculate derived state
  const isAuthenticated = !!userId;
  
  // Determine access - only after fully initialized
  const hasAccess = initialized && (!requiredRole || role === requiredRole);
  
  // Show warning only if role is confirmed and doesn't match
  const showWarning = initialized && !!requiredRole && !!role && role !== requiredRole;

  return {
    role,
    userId,
    isLoading,
    isAuthenticated,
    initialized,
    hasAccess,
    showWarning,
  };
}

/**
 * Validate role for current page access
 * Returns true if user has access, false otherwise
 * Does NOT trigger redirects - only returns boolean
 */
export function validatePageAccess(
  currentRole: string | null,
  pageRole: 'admin' | 'user'
): boolean {
  if (!currentRole) return false;
  return currentRole === pageRole;
}
