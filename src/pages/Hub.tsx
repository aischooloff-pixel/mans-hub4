import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { CategoryList } from '@/components/categories/CategoryList';
import { ArticleListCard } from '@/components/articles/ArticleListCard';
import { CreateArticleModal } from '@/components/articles/CreateArticleModal';
import { UserArticlesModal } from '@/components/profile/UserArticlesModal';
import { AllArticlesModal } from '@/components/articles/AllArticlesModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ChevronRight, FileText } from 'lucide-react';
import { mockCategories } from '@/data/mockData';
import { Category } from '@/types';
import { useArticles, Article } from '@/hooks/use-articles';

export default function Hub() {
  const { getApprovedArticles, getUserArticles } = useArticles();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMyArticlesOpen, setIsMyArticlesOpen] = useState(false);
  const [isAllArticlesOpen, setIsAllArticlesOpen] = useState(false);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);

  // Load all approved articles
  useEffect(() => {
    const load = async () => {
      setLoadingAll(true);
      const data = await getApprovedArticles(50);
      setAllArticles(data);
      setLoadingAll(false);
    };
    load();
  }, [getApprovedArticles]);

  // Load my articles
  useEffect(() => {
    const load = async () => {
      setLoadingMy(true);
      const data = await getUserArticles();
      setMyArticles(data);
      setLoadingMy(false);
    };
    load();
  }, [getUserArticles]);

  const filteredArticles = selectedCategory
    ? allArticles.filter((a) => a.category_id === selectedCategory.id)
    : allArticles;

  const handleArticleClick = (articleId: string) => {
    setExpandedArticleId(expandedArticleId === articleId ? null : articleId);
  };

  // Map Article to the format expected by components
  const mapArticle = (article: Article) => ({
    id: article.id,
    author_id: article.author_id || '',
    author: article.author
      ? {
          id: article.author.id,
          telegram_id: 0,
          username: article.author.show_username !== false ? article.author.username || '' : '',
          first_name: article.author.show_name !== false ? article.author.first_name || '' : 'Аноним',
          last_name: article.author.show_name !== false ? article.author.last_name || undefined : undefined,
          avatar_url:
            article.author.show_avatar !== false
              ? article.author.avatar_url || undefined
              : `https://api.dicebear.com/7.x/shapes/svg?seed=${article.author.id}`,
          reputation: article.author.reputation || 0,
          articles_count: 0,
          is_premium: article.author.is_premium || false,
          created_at: '',
        }
      : undefined,
    category_id: article.category_id || '',
    topic_id: '',
    title: article.title,
    preview: article.preview || '',
    body: article.body,
    media_url: article.media_url || undefined,
    media_type: article.media_type as 'image' | 'youtube' | undefined,
    is_anonymous: article.is_anonymous || false,
    status: (article.status || 'pending') as 'draft' | 'pending' | 'approved' | 'rejected',
    rejection_reason: article.rejection_reason || undefined,
    likes_count: article.likes_count || 0,
    comments_count: article.comments_count || 0,
    favorites_count: article.favorites_count || 0,
    rep_score: article.rep_score || 0,
    allow_comments: article.allow_comments !== false,
    created_at: article.created_at || '',
    updated_at: article.updated_at || '',
  });

  const handleArticleCreated = async () => {
    // Refresh my articles after creation
    const data = await getUserArticles();
    setMyArticles(data);
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-16">
      <Header />

      <main className="py-6">
        {/* Page Title */}
        <section className="mb-6 flex items-center justify-between px-4">
          <h1 className="font-heading text-2xl font-bold">Хаб</h1>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Написать
          </Button>
        </section>

        {/* Categories */}
        <CategoryList
          categories={mockCategories}
          selectedId={selectedCategory?.id}
          onSelect={setSelectedCategory}
          className="mb-6"
        />

        {/* All Articles Section */}
        <section className="mb-6 px-4">
          <div className="rounded-2xl bg-card p-4">
            <h2 className="mb-4 font-heading text-lg font-semibold">Статьи</h2>
            {loadingAll ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArticles.length > 0 ? (
                  filteredArticles.slice(0, 5).map((article, index) => (
                    <ArticleListCard
                      key={article.id}
                      article={mapArticle(article)}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleArticleClick(article.id)}
                      isExpanded={expandedArticleId === article.id}
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-muted-foreground">Нет статей в этой категории</p>
                )}
              </div>
            )}

            {/* Show all button */}
            {filteredArticles.length > 5 && (
              <Button variant="outline" className="mt-4 w-full gap-2" onClick={() => setIsAllArticlesOpen(true)}>
                Смотреть все
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </section>

        {/* My Articles Section */}
        <section className="px-4">
          <div className="rounded-2xl bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Мои статьи</h2>
              {myArticles.length > 0 && (
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => setIsMyArticlesOpen(true)}>
                  Все
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {loadingMy ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : myArticles.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Вы ничего не написали</p>
                <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Написать статью
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myArticles.slice(0, 3).map((article, index) => (
                  <ArticleListCard
                    key={article.id}
                    article={mapArticle(article)}
                    showStatus
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleArticleClick(article.id)}
                    isExpanded={expandedArticleId === article.id}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />

      <CreateArticleModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          handleArticleCreated();
        }}
      />

      <UserArticlesModal isOpen={isMyArticlesOpen} onClose={() => setIsMyArticlesOpen(false)} articles={myArticles.map(mapArticle)} />

      <AllArticlesModal
        isOpen={isAllArticlesOpen}
        onClose={() => setIsAllArticlesOpen(false)}
        articles={filteredArticles.map(mapArticle)}
        title={selectedCategory ? `Статьи: ${selectedCategory.name}` : 'Все статьи'}
      />
    </div>
  );
}
