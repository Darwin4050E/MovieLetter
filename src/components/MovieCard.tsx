import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonImg } from '@ionic/react';
import tmdb from '../services/tmdb';

interface MovieCardProps {
  movie: any;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const poster = tmdb.imageUrl(movie.poster_path, 'w300');
  return (
    <IonCard button href={`/movie/${movie.id}`}>
      {poster && <IonImg src={poster} alt={movie.title} />}
      <IonCardHeader>
        <IonCardTitle>{movie.title}</IonCardTitle>
        <IonCardSubtitle>{movie.release_date} • ⭐ {movie.vote_average}</IonCardSubtitle>
      </IonCardHeader>
    </IonCard>
  );
};

export default MovieCard;
