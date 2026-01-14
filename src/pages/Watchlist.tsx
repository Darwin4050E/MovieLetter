import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton } from '@ionic/react';
import { Box, Typography, Button, Card, CardContent, CardMedia } from '@mui/material';
import tmdb from '../services/tmdb';
import * as watchlist from '../services/watchlist';

const Watchlist: React.FC = () => {
  const history = useHistory();
  const [results, setResults] = useState<any[]>([]);
  const [items, setItems] = useState(watchlist.getAll());

  useEffect(() => setItems(watchlist.getAll()), []);
  useEffect(() => {
    const load = () => setItems(watchlist.getAll());
    window.addEventListener('app:watchlist-updated', load);
    return () => window.removeEventListener('app:watchlist-updated', load);
  }, []);

  const addItem = (m: any) => {
    watchlist.add({ id: m.id, title: m.title, poster_path: m.poster_path });
    const next = watchlist.getAll();
    setItems(next);
    window.dispatchEvent(new Event('app:watchlist-updated'));
  };

  const removeItem = (id: any) => {
    watchlist.remove(id);
    const next = watchlist.getAll();
    setItems(next);
    window.dispatchEvent(new Event('app:watchlist-updated'));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pendientes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Box sx={{ p: 2 }}>
          {results.length > 0 && (
            <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
              {results.map((r) => (
                <Card key={r.id} sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}>
                  {r.poster_path && <CardMedia component="img" image={tmdb.imageUrl(r.poster_path, 'w154') || ''} sx={{ width: 72 }} />}
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'var(--app-text)' }}>{r.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--app-text-muted)' }}>{r.overview ? r.overview.slice(0, 80) + '...' : ''}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button size="small" onClick={() => history.push(`/movie/${r.id}`)}>Ver</Button>
                      <Button size="small" variant="contained" onClick={() => addItem(r)}>Agregar</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {items.length === 0 ? (
            <Typography sx={{ color: 'var(--app-text-muted)' }}>No tienes películas pendientes. Agrega alguna usando la búsqueda de arriba.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 1 }}>
              {items.map((it) => (
                <Card key={it.id} sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}>
                  {it.poster_path && <CardMedia component="img" image={tmdb.imageUrl(it.poster_path, 'w154') || ''} sx={{ width: 96 }} />}
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: 'var(--app-text)' }}>{it.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--app-text-muted)' }}>Agregado: {new Date(it.addedAt).toLocaleDateString()}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button size="small" onClick={() => history.push(`/movie/${it.id}`)}>Ver</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => removeItem(it.id)}>Quitar</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </IonContent>
    </IonPage>
  );
};

export default Watchlist;