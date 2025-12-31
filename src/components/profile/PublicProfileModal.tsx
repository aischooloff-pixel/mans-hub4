import { useState, useEffect } from 'react';
import { X, Crown, Star, FileText, Calendar, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleDetailModal } from '@/components/articles/ArticleDetailModal';
import type { Article } from '@/types';

interface PublicProfile {
  id: string;
  telegram_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  reputation: number;
  subscription_tier: string;
  show_avatar: boolean;
  show_name: boolean;
  show_username: boolean;
  bio: string | null;
  telegram_channel: string | null;
  website: string | null;
  created_at: string;
}

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: string | null;
}

export function PublicProfileModal({ isOpen, onClose, authorId }: PublicProfileModalProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleDetailOpen, setArticleDetailOpen] = useState(false);

  useEffect(() => {
    if (isOpen && authorId) {
      loadProfile();
      loadArticles();
    }
  }, [isOpen, authorId]);

  const loadProfile = async () => {
    if (!authorId) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authorId)
        .maybeSingle();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    if (!authorId) return;
    setArticlesLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles!articles_author_id_fkey(
            id, first_name, last_name, username, avatar_url, 
            is_premium, reputation, created_at, subscription_tier,
            show_avatar, show_name, show_username
          )
        `)
        .eq('author_id', authorId)
        .eq('status', 'approved')
        .eq('is_anonymous', false)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (!error && data) {
        setArticles(data);
      }
    } catch (err) {
      console.error('Error loading articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
    setArticleDetailOpen(true);
  };

  if (!isOpen) return null;

  const isPremium = profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'plus';
  
  // Apply privacy settings
  const displayName = profile?.show_name !== false 
    ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Пользователь'
    : 'Пользователь';
  const displayUsername = profile?.show_username !== false ? profile?.username : null;
  const displayAvatar = profile?.show_avatar !== false ? profile?.avatar_url : null;

  const formatTelegramLink = (link: string | null) => {
    if (!link) return null;
    if (link.startsWith('@')) return link;
    if (link.includes('t.me/')) {
      const match = link.match(/t\.me\/([^/?\s]+)/);
      return match ? `@${match[1]}` : link;
    }
    return `@${link}`;
  };

  const formatWebsiteDisplay = (url: string | null) => {
    if (!url) return null;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url.length > 25 ? url.slice(0, 25) + '...' : url;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-card animate-slide-up',
            'md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg'
          )}
        >
          {/* Handle bar for mobile */}
          <div className="sticky top-0 z-10 flex justify-center bg-card pt-3 md:hidden">
            <div className="h-1 w-12 rounded-full bg-border" />
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8 z-20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center">
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-40" />
              </div>
            ) : profile ? (
              <>
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative mb-4">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        className="h-20 w-20 rounded-full border-2 border-border object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full border-2 border-border bg-muted flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                    {isPremium && (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Crown className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  <h2 className="mb-1 font-heading text-xl font-semibold">
                    {displayName}
                  </h2>
                  
                  {displayUsername && (
                    <p className="mb-3 text-sm text-muted-foreground">@{displayUsername}</p>
                  )}

                  {/* Bio */}
                  {isPremium && profile.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3 break-words max-w-xs">
                      {profile.bio}
                    </p>
                  )}

                  {/* Social Links - only for premium */}
                  {isPremium && (profile.telegram_channel || profile.website) && (
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      {profile.telegram_channel && (
                        <a
                          href={profile.telegram_channel.startsWith('http') 
                            ? profile.telegram_channel 
                            : `https://t.me/${profile.telegram_channel.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {formatTelegramLink(profile.telegram_channel)}
                        </a>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
                        >
                          <Globe className="h-3 w-3" />
                          {formatWebsiteDisplay(profile.website)}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      <span>{profile.reputation || 0} репутации</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{articles.length} статей</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>С {new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Articles */}
                <div>
                  <h3 className="font-heading text-sm font-semibold mb-3">Статьи автора</h3>
                  
                  {articlesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : articles.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleArticleClick(article)}
                          className="w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <h4 className="font-medium text-sm line-clamp-1 mb-1">
                            {article.topic || article.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {article.preview}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span>❤️</span> {article.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <span>💬</span> {article.comments_count || 0}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      У автора пока нет публичных статей
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground">Профиль не найден</p>
            )}
          </div>
        </div>
      </div>

      {/* Article Detail Modal */}
      <ArticleDetailModal
        isOpen={articleDetailOpen}
        onClose={() => setArticleDetailOpen(false)}
        article={selectedArticle}
      />
    </>
  );
}
