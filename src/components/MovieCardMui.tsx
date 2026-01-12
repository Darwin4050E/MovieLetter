import React from 'react';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import tmdb from '../services/tmdb';

interface Props {
  movie: any;
  compact?: boolean; // compact for carousels: fixed width, otherwise fluid
}

const MovieCardMui: React.FC<Props> = ({ movie, compact = false }) => {
  const poster = tmdb.imageUrl(movie.poster_path, 'w300');
  const sx = compact
    ? { width: 220, mr: 2, flex: '0 0 auto' }
    : { width: '100%', maxWidth: 420, mr: 0 };

  return (
    <Card sx={sx}>
      <CardActionArea component={Link} to={`/movie/${movie.id}`}>
        {poster ? (
          <CardMedia component="img" height={compact ? 320 : 400} image={poster} alt={movie.title} />
        ) : (
          <Box sx={{ height: compact ? 320 : 400, backgroundColor: '#eee' }} />
        )}
        <CardContent sx={{ p: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {movie.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {movie.release_date} • ⭐ {movie.vote_average}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MovieCardMui;
