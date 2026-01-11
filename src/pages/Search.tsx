import React, { useCallback, useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSpinner } from '@ionic/react';
import { Box, Typography } from '@mui/material';
import tmdb from '../services/tmdb';
import SearchBar from '../components/SearchBar';
import MovieCardMui from '../components/MovieCardMui';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState<any[]>([]);

  const runSearch = useCallback((q: string) => {
    setQuery(q);
    if (!q) {
      setResults(initial);
      return;
    }
    setLoading(true);
    tmdb
      .searchMovies(q, 1)
      .then((res) => setResults(res.results || []))
      .catch((e) => console.error('Search error', e))
      .finally(() => setLoading(false));
  }, [initial]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    tmdb
      .getPopular(1)
      .then((res) => {
        if (!mounted) return;
        setInitial(res.results || []);
        setResults(res.results || []);
      })
      .catch((e) => console.error('Search init error', e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Buscar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Buscar</IonTitle>
          </IonToolbar>
        </IonHeader>

        <Box sx={{ p: 2 }}>
          <SearchBar onSearch={runSearch} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <IonSpinner name="crescent" />
            </Box>
          ) : query && results.length === 0 ? (
            <Typography sx={{ mt: 3 }}>No se encontraron resultados para «{query}».</Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 2,
                mt: 2,
                alignItems: 'start',
                justifyContent: 'center',
              }}
            >
              {results.map((m) => (
                <MovieCardMui key={m.id} movie={m} />
              ))}
            </Box>
          )}
        </Box>
      </IonContent>
    </IonPage>
  );
};

export default Search;
