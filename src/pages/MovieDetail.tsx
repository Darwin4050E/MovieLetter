import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSpinner, IonButton, IonButtons, IonIcon } from '@ionic/react';
import { search as searchIcon } from 'ionicons/icons';
import { Box, Typography, Chip, Avatar, Divider, Button } from '@mui/material';
import tmdb from '../services/tmdb';
import MovieCardMui from '../components/MovieCardMui';
import { deleteReview } from '../services/reviews';

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

  const reviewsKey = `reviews_${movie.id}`;
  const stored = localStorage.getItem(reviewsKey);
  const reviews = stored ? JSON.parse(stored) : [];

  const starLevels = [5, 4, 3, 2, 1];
  const counts = starLevels.map((s) => reviews.filter((r: any) => Math.round(Number(r.rating || 0)) === s).length);
  const totalRatings = counts.reduce((a, b) => a + b, 0);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{movie.title}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/search" aria-label="Buscar">
              <IonIcon icon={searchIcon} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2, maxWidth: '100%', overflow: 'hidden' }}>
            <Box>
              <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 300, md: 320 }, borderRadius: 1, overflow: 'hidden', mx: 'auto' }}>
                {movie.poster_path ? (
                  <img
                    src={tmdb.imageUrl(movie.poster_path, 'w500') || ''}
                    alt={movie.title}
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '80vh', maxWidth: '100%' }}
                  />
                ) : (
                  <Box sx={{ height: 320, backgroundColor: '#eee' }} />
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Calificación: ⭐ {movie.vote_average}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--app-text-muted)' }}>
                  {movie.release_date} • {movie.runtime} min
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {(movie.genres || []).map((g: any) => (
                    <Chip
                      key={g.id}
                      label={g.name}
                      size="small"
                      sx={{ mr: 0.5, mt: 0.5, color: 'var(--app-text)', bgcolor: 'rgba(var(--ion-text-rgb),0.06)', border: '1px solid rgba(var(--ion-text-rgb),0.08)' }}
                    />
                  ))}
                </Box>
              
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button variant="contained" sx={{ flex: 1 }} onClick={() => console.log('Agregar Favorito clicked', movie.id)}>
                    Agregar Favorito
                  </Button>
                  <Button variant="outlined" sx={{ flex: 1 }} onClick={() => console.log('Ver más tarde clicked', movie.id)}>
                    Ver más tarde
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
              <Typography variant="h6">Sinopsis</Typography>
              <Typography sx={{ mb: 2 }}>{movie.overview}</Typography>

              <Box className="rating-summary" sx={{ mt: 1, mb: 2 }}>
                {starLevels.map((s, i) => {
                  const count = counts[i] || 0;
                  const percent = totalRatings ? Math.round((count / totalRatings) * 100) : 0;
                  return (
                    <div key={s} className="rating-row">
                      <div className="rating-stars">{'★'.repeat(s)}</div>
                      <div className="rating-track"><div className="rating-fill" style={{ width: `${percent}%` }} /></div>
                      <div className="rating-percent">{percent}% <span style={{ color: 'var(--app-text-muted)', marginLeft: 6 }}>{count}</span></div>
                    </div>
                  );
                })}
                {totalRatings === 0 && (
                  <Typography variant="caption" sx={{ color: 'var(--app-text-muted)' }}>Aún no hay reseñas para esta película</Typography>
                )}
              </Box>

              {trailer && (
                <Box sx={{ mb: 2, width: '100%' }}>
                  <Typography variant="h6">Tráiler</Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      pt: '56.25%',
                      width: '100%',
                      cursor: 'pointer',
                      borderRadius: 1,
                      overflow: 'hidden',
                      '&:hover': {
                        opacity: 0.9
                      }
                    }}
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                  >
                    {/* Miniatura de YouTube */}
                    <img
                      src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
                      alt="Trailer thumbnail"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Botón de play superpuesto */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 68,
                        height: 48,
                        backgroundColor: 'rgba(255, 0, 0, 0.8)',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 1)',
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 0,
                          height: 0,
                          borderLeft: '15px solid white',
                          borderTop: '10px solid transparent',
                          borderBottom: '10px solid transparent',
                          ml: 0.5
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6">Elenco</Typography>
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1, flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none' }}>
                {cast.map((c: any) => (
                  <Box key={c.cast_id || c.credit_id} sx={{ textAlign: 'center', width: 100, flex: '0 0 auto' }}>
                    <Avatar
                      src={tmdb.imageUrl(c.profile_path, 'w185') || undefined}
                      alt={c.name}
                      sx={{ width: 72, height: 72, margin: '0 auto' }}
                    />
                    <Typography variant="caption" display="block" noWrap sx={{ color: 'var(--app-text)' }}>
                      {c.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--app-text-muted)' }} display="block" noWrap>
                      {c.character}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6">Recomendadas</Typography>
              {recommendations.length === 0 ? (
                <Typography sx={{ mt: 1, color: 'text.secondary' }}>No hay recomendaciones para esta película.</Typography>
              ) : (
                <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, py: 1, flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none' }}>
                  {recommendations.map((r: any) => (
                    <MovieCardMui key={r.id} movie={r} compact />
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Reseñas</Typography>
                <Button variant="contained" onClick={() => history.push(`/review/new?movieId=${movie.id}`)}>
                  Escribir reseña
                </Button>
              </Box>

              {reviews.length === 0 ? (
                <Typography sx={{ mt: 1 }}>Aún no hay reseñas para esta película.</Typography>
              ) : (
                <Box sx={{ mt: 1 }}>
                  {reviews.map((r: any, idx: number) => (
                    <Box key={r.id || idx} sx={{ mb: 1, p: 1, border: '1px solid rgba(var(--ion-text-rgb),0.12)', backgroundColor: 'rgba(var(--ion-text-rgb),0.02)', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'var(--app-text)' }}>{r.author || 'Anónimo'}</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--app-text)' }}>{r.text}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--app-text-muted)' }}>{r.rating} ⭐ • {r.date}</Typography>
                      </Box>
                      <Box>
                        {r.id && (
                          <Button variant="outlined" size="small" onClick={() => history.push(`/review/${r.id}/edit`)} sx={{ mr: 1 }}>
                            Editar
                          </Button>
                        )}
                        <Button variant="text" size="small" onClick={() => { if (confirm('Borrar reseña?')) { deleteReview(r.id); window.location.reload(); } }}>
                          Borrar
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </IonContent>
    </IonPage>
  );
};

export default MovieDetail;
