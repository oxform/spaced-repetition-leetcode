import './SearchResultsList.css';
import React, { useState } from 'react';
import SearchResult from './SearchResult';

export const SearchResultsList = ({ results, refreshTable }) => (

  <div className="results-list">
    {results.map((result, id) => <SearchResult result={result} key={id} refreshTable={refreshTable} />)}
  </div>
);
