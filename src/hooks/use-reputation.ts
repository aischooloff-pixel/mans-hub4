import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReputationEntry {
  id: string;
  user_id: string | null;
  from_user_id: string | null;
  article_id: string | null;
  value: number;
  created_at: string | null;
}

function getInitData() {
  // @ts-ignore
  return window.Telegram?.WebApp?.initData || '';
}

export function useReputation() {
  const [loading, setLoading] = useState(false);

  const getMyReputation = useCallback(async () => {
    const initData = getInitData();
    if (!initData) return { reputation: 0, history: [] as ReputationEntry[] };

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tg-my-reputation', {
        body: { initData },
      });

      if (error) throw error;

      return {
        reputation: data?.reputation || 0,
        history: (data?.history || []) as ReputationEntry[],
      };
    } catch (err) {
      console.error('Error fetching reputation:', err);
      return { reputation: 0, history: [] as ReputationEntry[] };
    } finally {
      setLoading(false);
    }
  }, []);

  return { getMyReputation, loading };
}
