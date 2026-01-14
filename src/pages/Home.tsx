import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSpinner, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { search as searchIcon } from 'ionicons/icons';
import { Box, Typography, Button } from '@mui/material';
import tmdb from '../services/tmdb';
import MovieCardMui from '../components/MovieCardMui';

const Section: React.FC<{ title: string; children: React.ReactNode; moreHref?: string }> = ({ title, children, moreHref }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="h6">{title}</Typography>
      {moreHref && (
        <Button size="small" href={moreHref}>
          Ver más
        </Button>
      )}
    </Box>
    <Box
      sx={{
        display: 'flex',
        overflowX: 'auto',
        pb: 1,
        gap: 2,
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { height: 8 },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 },
      }}
    >
      {children}
    </Box>
  </Box>
);

const Home: React.FC = () => {
  const [popular, setPopular] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([tmdb.getPopular(1), tmdb.getTrending('movie', 'week'), tmdb.getUpcoming(1)])
      .then(([popRes, trendRes, upRes]) => {
        if (!mounted) return;
        setPopular(popRes.results || []);
        setTrending(trendRes.results || []);
        setUpcoming(upRes.results || []);
      })
      .catch((e) => console.error('TMDB error', e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/search" aria-label="Buscar">
              <IonIcon icon={searchIcon} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Inicio</IonTitle>
          </IonToolbar>
        </IonHeader>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
            <IonSpinner name="crescent" />
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Section title="Populares" moreHref="/">
              {popular.map((m) => (
                <MovieCardMui key={m.id} movie={m} compact />
              ))}
            </Section>

            <Section title="Tendencias" moreHref="/">
              {trending.map((m) => (
                <MovieCardMui key={m.id} movie={m} compact />
              ))}
            </Section>

            <Section title="Próximas" moreHref="/">
              {upcoming.map((m) => (
                <MovieCardMui key={m.id} movie={m} compact />
              ))}
            </Section>
          </Box>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
