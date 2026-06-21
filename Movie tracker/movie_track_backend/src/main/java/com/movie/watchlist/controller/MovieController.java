package com.movie.watchlist.controller;

import com.movie.watchlist.model.Movie;
import com.movie.watchlist.model.Status;
import com.movie.watchlist.service.MovieService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("/{id}")
    public Movie getMovieById(@PathVariable Long id) {
        return movieService.getMovieById(id);
    }

    @PostMapping
    public Movie createMovie(@RequestBody Movie movie) {
        return movieService.createMovie(movie);
    }

    @PutMapping("/{id}")
    public Movie updateMovie(@PathVariable Long id, @RequestBody Movie movie) {
        return movieService.updateMovie(id, movie);
    }

    @DeleteMapping("/{id}")
    public void deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
    }

    @GetMapping("/status/{status}")
    public List<Movie> getByStatus(@PathVariable Status status) {
        return movieService.getByStatus(status);
    }

    @GetMapping("/genre/{genre}")
    public List<Movie> getByGenre(@PathVariable String genre) {
        return movieService.getByGenre(genre);
    }
}
