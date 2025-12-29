import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Headphones, Dumbbell, Flame, Briefcase } from 'lucide-react';
import spotifyLogo from '@/assets/spotify-logo.jpeg';
import soundcloudLogo from '@/assets/soundcloud-logo.jpeg';
import yandexMusicLogo from '@/assets/yandex-music-logo.jpeg';

interface Playlist {
  id: string;
  title: string;
  icon: React.ReactNode;
  spotifyUrl?: string;
  soundcloudUrl?: string;
  yandexUrl?: string;
}

const playlists: Playlist[] = [
  {
    id: '1',
    title: 'В зал',
    icon: <Dumbbell className="w-5 h-5 text-primary" />,
    spotifyUrl: 'https://open.spotify.com',
    soundcloudUrl: 'https://soundcloud.com',
    yandexUrl: 'https://music.yandex.ru',
  },
  {
    id: '2',
    title: 'Мотивация',
    icon: <Flame className="w-5 h-5 text-orange-500" />,
    spotifyUrl: 'https://open.spotify.com',
    soundcloudUrl: 'https://soundcloud.com',
    yandexUrl: 'https://music.yandex.ru',
  },
  {
    id: '3',
    title: 'Работа',
    icon: <Briefcase className="w-5 h-5 text-blue-500" />,
    spotifyUrl: 'https://open.spotify.com',
    soundcloudUrl: 'https://soundcloud.com',
    yandexUrl: 'https://music.yandex.ru',
  },
];

interface PlaylistsSectionProps {
  className?: string;
}

export const PlaylistsSection = ({ className }: PlaylistsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleListen = (playlist: Playlist) => {
    // Open Spotify by default, can be customized
    if (playlist.spotifyUrl) {
      window.open(playlist.spotifyUrl, '_blank');
    }
  };

  return (
    <section className={className}>
      <div className="px-4">
        {/* Collapsed Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            w-full bg-card border border-border/50 
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden
            ${isExpanded ? 'rounded-t-2xl rounded-b-none border-b-0' : 'rounded-2xl'}
          `}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-lg">Плейлисты</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <img src={spotifyLogo} alt="Spotify" className="w-6 h-6 rounded-full object-cover" />
                <img src={soundcloudLogo} alt="SoundCloud" className="w-6 h-6 rounded-full object-cover" />
                <img src={yandexMusicLogo} alt="Yandex Music" className="w-6 h-6 rounded-lg object-cover" />
              </div>
              <ChevronDown 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        <div
          className="bg-card border border-border/50 border-t-0 rounded-b-2xl overflow-hidden"
          style={{
            maxHeight: isExpanded ? '500px' : '0px',
            opacity: isExpanded ? 1 : 0,
            transition: 'max-height 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div 
            className="p-4 pt-2 space-y-3"
            style={{
              transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {playlists.map((playlist, index) => (
              <div
                key={playlist.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateY(0)' : 'translateY(-8px)',
                  transition: `opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms, transform 400ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms`,
                }}
              >
                <div className="flex items-center gap-3">
                  {playlist.icon}
                  <span className="font-medium">{playlist.title}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleListen(playlist);
                  }}
                  className="text-sm"
                >
                  Слушать
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
