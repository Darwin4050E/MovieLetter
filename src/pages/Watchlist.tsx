import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { Box, Typography, TextField, Button, Card, CardContent, CardMedia } from '@mui/material';
import tmdb from '../services/tmdb';
import * as watchlist from '../services/watchlist';

const Watchlist: React.FC = () => {
  const history = useHistory();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [items, setItems] = useState(watchlist.getAll());

  useEffect(() => setItems(watchlist.getAll()), []);

  const doSearch = async () => {
    if (!query || !query.trim()) return setResults([]);
    try {
      const res = await tmdb.searchMovies(query.trim());
      setResults(res.results || []);
    } catch (e) {
      console.error('Search error', e);
      setResults([]);
    }
  };

  const addItem = (m: any) => {
    watchlist.add({ id: m.id, title: m.title, poster_path: m.poster_path });
    setItems(watchlist.getAll());
  };

  const removeItem = (id: any) => {
    watchlist.remove(id);
    setItems(watchlist.getAll());
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
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField fullWidth placeholder="Buscar película para agregar..." value={query} onChange={(e) => setQuery(e.target.value)} size="small" />
            <Button variant="contained" onClick={doSearch} sx={{ alignSelf: 'stretch' }}>Buscar</Button>
          </Box>

          {results.length > 0 && (
            <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
              {results.map((r) => (
                <Card key={r.id} sx={{ display: 'flex', alignItems: 'center' }}>
                  {r.poster_path && <CardMedia component="img" image={tmdb.imageUrl(r.poster_path, 'w154') || ''} sx={{ width: 72 }} />}
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{r.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button size="small" onClick={() => history.push(`/movie/${r.id}`)}>Ver</Button>
                      <Button size="small" variant="contained" onClick={() => addItem(r)}>Agregar</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Mi lista</Typography>
          {items.length === 0 ? (
            <Typography sx={{ color: 'var(--app-text-muted)' }}>No tienes películas pendientes. Agrega alguna usando la búsqueda de arriba.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 1 }}>
              {items.map((it) => (
                <Card key={it.id} sx={{ display: 'flex', alignItems: 'center' }}>
                  {it.poster_path && <CardMedia component="img" image={tmdb.imageUrl(it.poster_path, 'w154') || ''} sx={{ width: 72 }} />}
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'var(--app-text)' }}>{it.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button size="small" onClick={() => history.push(`/movie/${it.id}`)}>Ver</Button>
                      <Button size="small" variant="outlined" onClick={() => removeItem(it.id)}>Eliminar</Button>
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