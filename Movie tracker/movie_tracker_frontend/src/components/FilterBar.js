import { useState } from 'react';

function FilterBar({ onApplyFilter, onResetFilter }) {
  const [status, setStatus] = useState('');
  const [genre, setGenre] = useState('');

  const handleApply = () => {
    onApplyFilter({
      status,
      genre,
    });
  };

  const handleReset = () => {
    setStatus('');
    setGenre('');
    onResetFilter();
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Filter Movies</h2>
      </div>

      <div className="panel-body">
        <div className="filter-row">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All Status</option>
            <option value="WATCHED">WATCHED</option>
            <option value="UNWATCHED">UNWATCHED</option>
          </select>

          <input
            type="text"
            placeholder="Genre (e.g. Sci-Fi)"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          />

          <div className="filter-actions">
            <button className="btn btn-primary" type="button" onClick={handleApply}>
              Apply Filter
            </button>
            <button className="btn btn-secondary" type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FilterBar;
