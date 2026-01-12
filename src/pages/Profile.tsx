import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { getAll, deleteReview } from '../services/reviews';
import { useHistory } from 'react-router-dom';

const KEY = 'user_name';

const Profile: React.FC = () => {
  const history = useHistory();
  // field starts empty as requested
  const [name, setName] = useState('');
  // savedName reflects the currently active saved name (may come from localStorage)
  const [savedName, setSavedName] = useState(localStorage.getItem(KEY) || '');
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    // Update reviews whenever savedName changes
    if (!savedName) {
      setReviews([]);
      return;
    }
    const all = getAll();
    setReviews(all.filter((r: any) => (r.author || '').toString() === savedName));
  }, [savedName]);

  const saveName = () => {
    if (!name || !name.trim()) return;
    localStorage.setItem(KEY, name);
    setSavedName(name);
    // notify other parts of the app (e.g., Reviews) to refresh
    window.dispatchEvent(new Event('app:reviews-updated'));
    // refresh reviews
    const all = getAll();
    setReviews(all.filter((r: any) => (r.author || '').toString() === name));
    // clear input after saving
    setName('');
  };

  const removeReview = (id: string) => {
    if (!confirm('Borrar reseña?')) return;
    deleteReview(id);
    setReviews((s) => s.filter((r) => r.id !== id));
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
          {/* label and current saved name */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ color: '#fff' }}>Nombre de usuario</Typography>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{savedName || 'Sin definir'}</Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                '& .MuiOutlinedInput-root': { color: '#fff', borderColor: 'rgba(255,255,255,0.12)' },
                '& .MuiInputBase-input': { color: '#fff' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' },
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
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)'
                }
              }}
            >
              Guardar
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Mis reseñas</Typography>
            {reviews.length === 0 ? (
              <Typography sx={{ color: 'text.secondary' }}>Aún no tienes reseñas.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {reviews.map((r) => (
                  <Box key={r.id} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">{r.author || 'Anónimo'}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>{r.rating} ⭐ • {r.date}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#fff', mt: 1 }}>{r.text}</Typography>
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
        </Box>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
