import { useState, useEffect } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { SideMenu } from '@/components/header/SideMenu';
import { SearchModal } from '@/components/header/SearchModal';
import { NotificationsModal } from '@/components/header/NotificationsModal';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/use-profile';

export function Header() {
  const { profile } = useProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Display values respecting privacy settings
  const displayName = profile?.show_name !== false
    ? profile?.first_name || 'Пользователь'
    : 'Аноним';

  const displayAvatar = profile?.show_avatar !== false
    ? profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || profile?.first_name}`
    : `https://api.dicebear.com/7.x/shapes/svg?seed=${profile?.id}`;

  // Build currentUser for ProfileModal
  const currentUser = {
    id: profile?.id || '',
    telegram_id: profile?.telegram_id || 0,
    username: profile?.show_username !== false ? profile?.username || 'user' : 'скрыт',
    first_name: profile?.show_name !== false ? profile?.first_name || 'Пользователь' : 'Аноним',
    last_name: profile?.show_name !== false ? profile?.last_name || '' : '',
    avatar_url: displayAvatar,
    reputation: profile?.reputation || 0,
    articles_count: 0,
    is_premium: profile?.is_premium || false,
    created_at: profile?.created_at || '',
  };

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
          isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="touch-target lg:hidden"
              onClick={() => setIsSideMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="touch-target" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="touch-target relative"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-foreground" />
            </Button>

            <Button variant="ghost" size="icon" className="touch-target" onClick={() => setIsProfileOpen(true)}>
              <img src={displayAvatar} alt={displayName} className="h-8 w-8 rounded-full border border-border" />
            </Button>
          </div>
        </div>
      </header>

      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <ProfileModal user={currentUser} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
