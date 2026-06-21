import './App.css';
import { useCallback, useEffect, useState } from 'react';
import FilterBar from './components/FilterBar';
import MovieForm from './components/MovieForm';
import MovieList from './components/MovieList';
import {
  createMovie,
  deleteMovie,
  getAllMovies,
  getByGenre,
  getByStatus,
  updateMovie,
} from './services/api';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllMovies();
      setMovies(response.data || []);
    } catch (error) {
      console.log(error);
      alert('Unable to load movies from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSubmitMovie = async (movie) => {
    try {
      if (selectedMovie?.id) {
        await updateMovie(selectedMovie.id, movie);
        alert('Movie updated successfully.');
      } else {
        await createMovie(movie);
        alert('Movie added successfully.');
      }
      setSelectedMovie(null);
      fetchMovies();
    } catch (error) {
      console.log(error);
      alert('Unable to save movie. Please try again.');
    }
  };

  const handleDeleteMovie = async (id) => {
    const shouldDelete = window.confirm('Delete this movie from watchlist?');
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMovie(id);
      alert('Movie deleted successfully.');
      if (selectedMovie?.id === id) {
        setSelectedMovie(null);
      }
      fetchMovies();
    } catch (error) {
      console.log(error);
      alert('Unable to delete movie.');
    }
  };

  const handleApplyFilter = async ({ status, genre }) => {
    try {
      let response;

      if (status) {
        response = await getByStatus(status);
      } else if (genre) {
        response = await getByGenre(genre);
      } else {
        response = await getAllMovies();
      }

      let filteredMovies = response.data || [];

      if (status && genre) {
        filteredMovies = filteredMovies.filter(
          (movie) =>
            String(movie.genre || '').toLowerCase() ===
            genre.trim().toLowerCase()
        );
      }

      setMovies(filteredMovies);
    } catch (error) {
      console.log(error);
      alert('Unable to apply filter.');
    }
  };

  const handleResetFilter = () => {
    fetchMovies();
  };

  const handleCancelEdit = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Movie Watchlist Tracker</h1>
        <p>Track what you watched and what is still waiting on your list.</p>
      </header>

      <main className="container">
        <MovieForm
          selectedMovie={selectedMovie}
          onSubmitMovie={handleSubmitMovie}
          onCancelEdit={handleCancelEdit}
        />

        <FilterBar
          onApplyFilter={handleApplyFilter}
          onResetFilter={handleResetFilter}
        />

        <MovieList
          movies={movies}
          loading={loading}
          onEdit={setSelectedMovie}
          onDelete={handleDeleteMovie}
          onRefresh={fetchMovies}
        />
      </main>
    </div>
  );
}

export default App;
