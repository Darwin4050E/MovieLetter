import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { Box, TextField, Button, Typography, Rating, Avatar } from '@mui/material';
import * as reviewsService from '../services/reviews';

interface Params {
  id?: string;
}

const ReviewForm: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { id } = useParams<Params>();
  const [movieId, setMovieId] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState<number | null>(5);
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const mid = qs.get('movieId');
    if (mid) setMovieId(mid);
    if (id) {
      const r = reviewsService.getById(id);
      if (r) {
        setMovieId(r.movieId);
        setAuthor(r.author || '');
        setText(r.text);
        setRating(r.rating);
        setPhotoBase64(r.photoBase64);
      }
    }
  }, [id, location.search]);

  if (!movieId) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Reseña</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <Box sx={{ p: 2 }}>
            <Typography>Falta movieId en la URL. Abre este formulario desde la página de la película.</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => history.goBack()}>
              Volver
            </Button>
          </Box>
        </IonContent>
      </IonPage>
    );
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(f);
  };

  const onSave = () => {
    if (!rating || rating <= 0) {
      alert('Selecciona una calificación');
      return;
    }

    const currentUser = localStorage.getItem('user_name') || '';
    const nameToUse = author || currentUser || 'Anónimo';

    // persist chosen name as the user's name if they provided it
    if (nameToUse && nameToUse !== currentUser) {
      localStorage.setItem('user_name', nameToUse);
    }

    const payload: any = {
      movieId,
      author: nameToUse,
      text,
      rating,
      photoBase64
    };

    if (id) payload.id = id;

    const saved = reviewsService.saveReview(payload);
    // navigate back to movie detail
    history.push(`/movie/${saved.movieId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{id ? 'Editar reseña' : 'Nueva reseña'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Calificación</Typography>
          <Rating value={rating} onChange={(_, v) => setRating(v)} />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Texto</Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 1 },
              '& .MuiInputBase-input': { color: '#fff' },
            }}
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Foto (opcional)</Typography>
          {photoBase64 ? (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar src={photoBase64} variant="rounded" sx={{ width: 96, height: 96 }} />
              <Button variant="outlined" onClick={() => setPhotoBase64(undefined)}>Eliminar foto</Button>
            </Box>
          ) : (
            <input type="file" accept="image/*" onChange={onFile} />
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'right' }}>
            <Button variant="contained" onClick={onSave}>Guardar</Button>
            <Button variant="outlined" onClick={() => history.goBack()}>Cancelar</Button>
          </Box>
        </Box>
      </IonContent>
    </IonPage>
  );
};

export default ReviewForm;
