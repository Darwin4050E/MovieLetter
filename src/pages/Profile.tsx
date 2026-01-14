import React, { useEffect, useState, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { getAll, deleteReview } from '../services/reviews';
import MovieCardMui from '../components/MovieCardMui';
import { getAll as getFavorites } from '../services/favorites';
import { useHistory } from 'react-router-dom';

const KEY = 'user_name';
const PROFILE_PIC_KEY = 'profile_photo_v1';

const Profile: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState(localStorage.getItem(KEY) || '');
  const [photo, setPhoto] = useState<string | null>(localStorage.getItem(PROFILE_PIC_KEY) || null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!savedName) {
      setReviews([]);
      return;
    }
    const all = getAll();
    setReviews(all.filter((r: any) => (r.author || '').toString() === savedName));
  }, [savedName]);

  useEffect(() => {
    const favs = getFavorites() || [];
    setFavorites(favs.slice(0, 5));
  }, []);

  const saveName = () => {
    if (!name || !name.trim()) return;
    localStorage.setItem(KEY, name);
    setSavedName(name);
    window.dispatchEvent(new Event('app:reviews-updated'));
    const all = getAll();
    setReviews(all.filter((r: any) => (r.author || '').toString() === name));
    setName('');
  };

  const removeReview = (id: string) => {
    if (!confirm('Borrar reseña?')) return;
    deleteReview(id);
    setReviews((s) => s.filter((r) => r.id !== id));
  };

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhoto(result);
      localStorage.setItem(PROFILE_PIC_KEY, result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            <Box onClick={handlePick} sx={{ cursor: 'pointer', textAlign: 'center' }}>
              <Avatar src={photo || undefined} alt={savedName || 'Perfil'} sx={{ width: 120, height: 120, mx: 'auto' }}>
                {!photo && (savedName ? savedName[0].toUpperCase() : 'U')}
              </Avatar>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'var(--app-text-muted)' }}>Subir foto</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ color: 'var(--app-text)' }}>Nombre de usuario</Typography>
            <Typography variant="subtitle2" sx={{ color: 'var(--app-text-muted)' }}>{savedName || 'Sin definir'}</Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: 'rgba(var(--ion-text-rgb),0.02)',
                '& .MuiOutlinedInput-root': { color: 'var(--app-text)', borderColor: 'rgba(var(--ion-text-rgb),0.12)' },
                '& .MuiInputBase-input': { color: 'var(--app-text)' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(var(--ion-text-rgb),0.12)' },
              }}
            />
          </Box>

          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={saveName}
              disabled={!(name && name.trim().length > 0)}
              sx={{
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(var(--ion-text-rgb),0.12)',
                  color: 'rgba(var(--ion-text-rgb),0.6)'
                }
              }}
            >
              Guardar
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Mis Reseñas</Typography>
            {reviews.length === 0 ? (
              <Typography sx={{ color: 'text.secondary' }}>Aún no tienes reseñas.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {reviews.map((r) => (
                  <Box key={r.id} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(var(--ion-text-rgb),0.12)', backgroundColor: 'rgba(var(--ion-text-rgb),0.02)', color: 'var(--app-text)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">{r.author || 'Anónimo'}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--app-text-muted)' }}>{r.rating} ⭐ • {r.date}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--app-text)', mt: 1 }}>{r.text}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button size="small" variant="outlined" onClick={() => history.push(`/review/${r.id}/edit`)}>Editar</Button>
                      <Button size="small" variant="text" onClick={() => removeReview(r.id)}>Borrar</Button>
                      <Button size="small" variant="text" onClick={() => history.push(`/movie/${r.movieId}`)} sx={{ ml: 1 }}>Ver película</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Mis Favoritos</Typography>
            {favorites.length === 0 ? (
              <Typography sx={{ color: 'text.secondary' }}>Aún no tienes favoritas.</Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 1, flexWrap: 'nowrap' }}>
                {favorites.map((f: any) => (
                  <MovieCardMui key={f.id} movie={f} compact />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
