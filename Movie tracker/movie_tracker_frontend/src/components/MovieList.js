import { useEffect } from 'react';

function MovieList({ movies, loading, onEdit, onDelete, onRefresh }) {
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  if (loading) {
    return <p className="loading-text">Loading movies...</p>;
  }

  if (!movies.length) {
    return <p className="empty-text">No movies found. Add your first movie above.</p>;
  }

  return (
    <section className="movie-grid">
      {movies.map((movie) => {
        const isWatched = String(movie.status).toUpperCase() === 'WATCHED';

        return (
          <article className="movie-card" key={movie.id}>
            <h3>{movie.name}</h3>
            <div className="movie-meta">
              <span>
                <strong>Genre:</strong> {movie.genre}
              </span>
              <span>
                <strong>Rating:</strong> {movie.rating}
              </span>
              <span>
                <strong>Status:</strong>{' '}
                <span className={`badge ${isWatched ? 'watched' : 'unwatched'}`}>
                  {movie.status}
                </span>
              </span>
            </div>

            <div className="card-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => onEdit(movie)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => onDelete(movie.id)}
              >
                Delete
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default MovieList;
