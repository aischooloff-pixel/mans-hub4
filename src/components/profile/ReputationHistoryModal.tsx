import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useReputation, ReputationEntry } from '@/hooks/use-reputation';

interface ReputationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReputationHistoryModal({ isOpen, onClose }: ReputationHistoryModalProps) {
  const { getMyReputation, loading } = useReputation();
  const [reputation, setReputation] = useState(0);
  const [history, setHistory] = useState<ReputationEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && !loaded) {
      const load = async () => {
        const data = await getMyReputation();
        setReputation(data.reputation);
        setHistory(data.history);
        setLoaded(true);
      };
      load();
    }
  }, [isOpen, loaded, getMyReputation]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className={cn(
        'absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-card animate-slide-up',
        'md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl'
      )}>
        <div className="flex shrink-0 justify-center bg-card pt-3 md:hidden">
          <div className="h-1 w-12 rounded-full bg-border" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card p-4">
          <div>
            <h2 className="font-heading text-lg font-semibold">История репутации</h2>
            <p className="text-sm text-muted-foreground">Всего: {reputation} rep</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && !loaded ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">История репутации пуста</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-secondary/50 p-4">
                  <div className="flex items-center gap-3">
                    {entry.value > 0 ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{entry.value > 0 ? 'Получено' : 'Снято'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                    </div>
                  </div>
                  <span className={cn('font-bold', entry.value > 0 ? 'text-green-500' : 'text-red-500')}>
                    {entry.value > 0 ? '+' : ''}{entry.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
