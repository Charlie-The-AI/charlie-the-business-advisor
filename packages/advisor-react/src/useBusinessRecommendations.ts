'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recommendation, RecommendationStatus } from '@charlie/advisor-types';
import { useCharlieContext } from './context.js';

export interface UseBusinessRecommendationsOptions {
  businessId?: string;
  initialRecommendations?: Recommendation[];
  autoFetch?: boolean;
}

export function useBusinessRecommendations(options: UseBusinessRecommendationsOptions = {}) {
  const context = useCharlieContext();
  const businessId = options.businessId || context.businessId;
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    options.initialRecommendations || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!businessId || !context.apiKey) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${context.apiUrl}/api/v1/businesses/${businessId}/recommendations`,
        {
          headers: {
            Authorization: `Bearer ${context.apiKey}`,
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to load recommendations: ${res.statusText}`);
      }

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [businessId, context.apiKey, context.apiUrl]);

  useEffect(() => {
    if (options.autoFetch && businessId && context.apiKey) {
      fetchRecommendations();
    }
  }, [options.autoFetch, businessId, context.apiKey, fetchRecommendations]);

  const updateStatus = useCallback(
    async (recommendationId: string, status: RecommendationStatus) => {
      // Optimistic update
      setRecommendations((prev: Recommendation[]) =>
        prev.map((r: Recommendation) => (r.id === recommendationId ? { ...r, status } : r))
      );

      if (!context.apiKey) return;

      try {
        await fetch(`${context.apiUrl}/api/v1/recommendations/${recommendationId}/status`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${context.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ status }),
        });
      } catch (err: any) {
        // Rollback on failure
        fetchRecommendations();
      }
    },
    [context.apiKey, context.apiUrl, fetchRecommendations]
  );

  return {
    recommendations,
    isLoading,
    error,
    refresh: fetchRecommendations,
    updateStatus,
  };
}
