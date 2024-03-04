import { FaSearch } from "react-icons/fa";
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";
import { debounce } from "lodash";
import { getAuth } from "firebase/auth";
import API from "../../api/api";

const SearchBar = ({ setResults }) => {
  const [input, setInput] = useState("");

  const fetchData = useCallback(
    debounce(async (value) => {
      if (!value.trim()) {
        setResults([]);
        return;
      }

      const url = new URL(
        "/api/cards/leetcode-problems",
        window.location.origin
      );
      url.searchParams.append("searchKeywords", value);

      try {
        API.get(url.toString()).then(async (response) => {
          const data = await response.data;
          setResults(data);
          // check results
        });
      } catch (error) {
        // console.error('Error fetching data: ', error);
      }
    }, 50),
    [setResults]
  );
  const handleChange = (value) => {
    setInput(value);
    fetchData(value);
  };

  useEffect(() => () => fetchData.cancel(), [fetchData]);

  return (
    <div className="input-wrapper">
      <FaSearch id="search-icon" />
      <input
        placeholder="Search Leetcode Problems"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

SearchBar.propTypes = {
  setResults: PropTypes.func.isRequired,
};

export default SearchBar;
