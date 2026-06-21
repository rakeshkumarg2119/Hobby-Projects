import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/movies',
});

export const getAllMovies = () => apiClient.get('');

export const getMovieById = (id) => apiClient.get(`/${id}`);

export const createMovie = (movie) => apiClient.post('', movie);

export const updateMovie = (id, movie) => apiClient.put(`/${id}`, movie);

export const deleteMovie = (id) => apiClient.delete(`/${id}`);

export const getByStatus = (status) =>
  apiClient.get(`/status/${encodeURIComponent(status)}`);

export const getByGenre = (genre) =>
  apiClient.get(`/genre/${encodeURIComponent(genre)}`);
