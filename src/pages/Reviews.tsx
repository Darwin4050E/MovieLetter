import React, { useEffect, useState, useMemo } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonViewWillEnter, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { search as searchIcon } from 'ionicons/icons';
import { Box, Typography, Button } from '@mui/material';
import SearchBar from '../components/SearchBar';
import { getAll } from '../services/reviews';
import { useHistory } from 'react-router-dom';
import tmdb from '../services/tmdb';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');

  const history = useHistory();

  const load = () => {
    const all = getAll();
    setReviews(all);

    const ids = Array.from(new Set(all.map((r: any) => r.movieId)));
    ids.forEach((mid) => {
      if (titles[mid]) return;
      tmdb
        .getMovieDetails(mid)
        .then((m: any) => setTitles((s) => ({ ...s, [mid]: m.title })))
        .catch(() => setTitles((s) => ({ ...s, [mid]: 'Pelicula' })));
    });
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('app:reviews-updated', handler);
    return () => window.removeEventListener('app:reviews-updated', handler);
  }, [titles]);

  useIonViewWillEnter(() => {
    load();
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) => (r.text || '').toLowerCase().includes(q));
  }, [reviews, query]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Reseñas</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/search" aria-label="Buscar">
              <IonIcon icon={searchIcon} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Box sx={{ p: 2 }}>

          <Box sx={{ mb: 2 }}>
            <SearchBar onSearch={(q) => setQuery(q)} placeholder="Buscar reseñas por texto..." />
          </Box>

          {filtered.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>No hay reseñas que coincidan.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filtered.map((r: any) => (
                <Box
                  key={r.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(var(--ion-text-rgb),0.12)',
                    backgroundColor: 'rgba(var(--ion-text-rgb),0.02)',
                    color: 'var(--app-text)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">{r.author || 'Anónimo'}</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--app-text-muted)' }}>{r.rating} ⭐ • {r.date}</Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: 'var(--app-text)' }}>{r.text}</Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(var(--ion-text-rgb),0.8)', cursor: 'pointer', mt: 1 }}
                    onClick={() => history.push(`/movie/${r.movieId}`)}
                  >
                    {titles[r.movieId] ? `Película: ${titles[r.movieId]}` : `Película: ${r.movieId}`}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </IonContent>
    </IonPage>
  );
};

export default Reviews;
