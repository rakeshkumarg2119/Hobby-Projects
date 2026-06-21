package com.movie.watchlist.repository;

import com.movie.watchlist.model.Movie;
import com.movie.watchlist.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByStatus(Status status);
    List<Movie> findByGenreIgnoreCase(String genre);
}
