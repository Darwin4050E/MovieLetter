import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSpinner, IonButton } from '@ionic/react';
import { Box, Typography, Chip, Avatar, Grid, Divider, Button } from '@mui/material';
import tmdb from '../services/tmdb';
import MovieCardMui from '../components/MovieCardMui';

interface Params {
  id: string;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<Params>();
  const history = useHistory();
  const [movie, setMovie] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    tmdb
      .getMovieDetails(id)
      .then((res) => {
        if (!mounted) return;
        setMovie(res);
      })
      .catch((e) => console.error('Movie detail error', e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Cargando...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <IonSpinner />
          </Box>
        </IonContent>
      </IonPage>
    );
  }

  if (!movie) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Sin datos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <Box sx={{ p: 2 }}>
            <Typography>No se pudo cargar la película.</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => history.goBack()}>
              Volver
            </Button>
          </Box>
        </IonContent>
      </IonPage>
    );
  }

  const trailer = (movie.videos?.results || []).find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = (movie.credits?.cast || []).slice(0, 8);
  const recommendations = movie.recommendations?.results || [];

  // Reviews: simple almacenamiento local
  const reviewsKey = `reviews_${movie.id}`;
  const stored = localStorage.getItem(reviewsKey);
  const reviews = stored ? JSON.parse(stored) : [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{movie.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                {movie.poster_path ? (
                  <img
                    src={tmdb.imageUrl(movie.poster_path, 'w500') || ''}
                    alt={movie.title}
                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ height: 320, backgroundColor: '#eee' }} />
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Calificación: ⭐ {movie.vote_average}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {movie.release_date} • {movie.runtime} min
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {(movie.genres || []).map((g: any) => (
                    <Chip key={g.id} label={g.name} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="h6">Sinopsis</Typography>
              <Typography sx={{ mb: 2 }}>{movie.overview}</Typography>

              {trailer && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Tráiler</Typography>
                  <Box sx={{ position: 'relative', pt: '56.25%' }}>
                    <iframe
                      title="trailer"
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6">Elenco</Typography>
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1 }}>
                {cast.map((c: any) => (
                  <Box key={c.cast_id || c.credit_id} sx={{ textAlign: 'center', width: 100 }}>
                    <Avatar
                      src={tmdb.imageUrl(c.profile_path, 'w185') || undefined}
                      alt={c.name}
                      sx={{ width: 72, height: 72, margin: '0 auto' }}
                    />
                    <Typography variant="caption" display="block" noWrap>
                      {c.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                      {c.character}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6">Recomendadas</Typography>
              <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, py: 1 }}>
                {recommendations.map((r: any) => (
                  <MovieCardMui key={r.id} movie={r} compact />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Reseñas</Typography>
                <Button variant="contained" href={`/review/new?movieId=${movie.id}`}>
                  Escribir reseña
                </Button>
              </Box>

              {reviews.length === 0 ? (
                <Typography sx={{ mt: 1 }}>Aún no hay reseñas para esta película.</Typography>
              ) : (
                <Box sx={{ mt: 1 }}>
                  {reviews.map((r: any, idx: number) => (
                    <Box key={idx} sx={{ mb: 1, p: 1, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }}>
                      <Typography variant="subtitle2">{r.author || 'Anónimo'}</Typography>
                      <Typography variant="body2">{r.text}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.rating} ⭐ • {r.date}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </IonContent>
    </IonPage>
  );
};

export default MovieDetail;
