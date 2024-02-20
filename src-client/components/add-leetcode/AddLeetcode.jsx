import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SearchBar from '../search-bar/SearchBar';
import { SearchResultsList } from '../search-bar/SearchResultsList';
import { getAuth } from 'firebase/auth';
import { useEffect } from 'react';

const AddLeetcode = ({ refreshTable }) => {
  const [results, setResults] = useState([]);
  console.log('state results', results);

  return (
    <div className="col">
      <h1 style={{ marginBottom: '24px' }}>Add Leetcode Problem</h1>
      <SearchBar setResults={setResults} />
      {results && results.length > 0
      && <SearchResultsList results={results} refreshTable={refreshTable} />}
    </div>
  );
};

AddLeetcode.propTypes = {
  refreshTable: PropTypes.func.isRequired,
};

export default AddLeetcode;
