import { useEffect, useState } from 'react';

const initialFormState = {
  name: '',
  genre: '',
  rating: '',
  status: 'UNWATCHED',
};

function MovieForm({ selectedMovie, onSubmitMovie, onCancelEdit }) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (selectedMovie) {
      setFormData({
        name: selectedMovie.name || '',
        genre: selectedMovie.genre || '',
        rating:
          selectedMovie.rating !== null && selectedMovie.rating !== undefined
            ? String(selectedMovie.rating)
            : '',
        status: selectedMovie.status || 'UNWATCHED',
      });
      return;
    }

    setFormData(initialFormState);
  }, [selectedMovie]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.genre.trim()) {
      alert('Name and genre are required.');
      return;
    }

    const parsedRating = Number(formData.rating);
    if (Number.isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
      alert('Rating should be a number between 0 and 10.');
      return;
    }

    await onSubmitMovie({
      ...formData,
      name: formData.name.trim(),
      genre: formData.genre.trim(),
      rating: parsedRating,
    });

    setFormData(initialFormState);
  };

  const isEditing = Boolean(selectedMovie);

  const handleCancel = () => {
    setFormData(initialFormState);
    onCancelEdit();
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{isEditing ? 'Update Movie' : 'Add New Movie'}</h2>
      </div>

      <div className="panel-body">
        <form className="movie-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Movie name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={formData.genre}
            onChange={handleChange}
          />
          <input
            type="number"
            name="rating"
            placeholder="Rating (0-10)"
            min="0"
            max="10"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
          />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="UNWATCHED">UNWATCHED</option>
            <option value="WATCHED">WATCHED</option>
          </select>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {isEditing ? 'Update Movie' : 'Add Movie'}
            </button>
            {isEditing && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default MovieForm;
