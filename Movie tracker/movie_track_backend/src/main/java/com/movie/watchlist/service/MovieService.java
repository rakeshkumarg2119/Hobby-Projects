package com.movie.watchlist.service;

import com.movie.watchlist.exception.MovieNotFoundException;
import com.movie.watchlist.model.Movie;
import com.movie.watchlist.model.Status;
import com.movie.watchlist.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new MovieNotFoundException("Movie not found with id: " + id));
    }

    public Movie createMovie(Movie movie) {
        movie.setId(null);
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Long id, Movie movie) {
        Movie existing = getMovieById(id);
        existing.setName(movie.getName());
        existing.setGenre(movie.getGenre());
        existing.setRating(movie.getRating());
        existing.setStatus(movie.getStatus());
        return movieRepository.save(existing);
    }

    public void deleteMovie(Long id) {
        Movie existing = getMovieById(id);
        movieRepository.delete(existing);
    }

    public List<Movie> getByStatus(Status status) {
        return movieRepository.findByStatus(status);
    }

    public List<Movie> getByGenre(String genre) {
        return movieRepository.findByGenreIgnoreCase(genre);
    }
}