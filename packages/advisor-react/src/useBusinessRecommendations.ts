'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recommendation, RecommendationStatus } from '@charlie-the-ai/advisor-types';
import { useCharlieContext } from './context.js';

export interface UseBusinessRecommendationsOptions {
  businessId?: string;
  endpointUrl?: string;
  initialRecommendations?: Recommendation[];
  autoFetch?: boolean;
}

export function useBusinessRecommendations(options: UseBusinessRecommendationsOptions = {}) {
  const context = useCharlieContext();
  const businessId = options.businessId || context.businessId;
  const endpoint = options.endpointUrl || (context as any).recommendationsEndpoint || '/api/charlie/recommendations';

  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    options.initialRecommendations || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (context.apiKey) {
        headers['Authorization'] = `Bearer ${context.apiKey}`;
      }

      const url = context.apiKey && context.apiUrl && businessId
        ? `${context.apiUrl}/api/v1/businesses/${businessId}/recommendations`
        : endpoint;

      const res = await fetch(url, { headers });

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
  }, [businessId, context.apiKey, context.apiUrl, endpoint]);

  useEffect(() => {
    if (options.autoFetch) {
      fetchRecommendations();
    }
  }, [options.autoFetch, fetchRecommendations]);

  const updateStatus = useCallback(
    async (recommendationId: string, status: RecommendationStatus) => {
      setRecommendations((prev: Recommendation[]) =>
        prev.map((r: Recommendation) => (r.id === recommendationId ? { ...r, status } : r))
      );
    },
    []
  );

  return {
    recommendations,
    isLoading,
    error,
    refresh: fetchRecommendations,
    updateStatus,
  };
}
