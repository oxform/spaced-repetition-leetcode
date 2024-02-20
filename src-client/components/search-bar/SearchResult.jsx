import './SearchResult.css';
import React from 'react';
import PropTypes from 'prop-types';
import { getAuth } from 'firebase/auth';
import API from '../../api/api';
import { useEffect, useState } from 'react';

const SearchResult = ({ result, refreshTable }) => {
  console.log('result', result);
  const resultName = `${result.frontendQuestionId}. ${result.title}`;

  const [idToken, setIdToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        console.log("idToken111", token);
        setIdToken(token);
      }
    };

    fetchToken();
  }, []);


  return (
    <div
      className="search-result"
      role="button"
      tabIndex={0}
      onClick={() => {
        const post = {
          leetcodeFrontendId: result.frontendQuestionId,
          leetcodeName: result.title,
          leetcodeDifficulty: result.difficulty,
          leetcodeUrl: `https://leetcode.com/problems/${result.title.replace(/\s/g, '-').replace(/[()]/g, '').toLowerCase()}`,
          last_reviewed: new Date(),
          due_date: new Date(),
        };

        API.post('api/cards', post).then((res) => {
          refreshTable();
          console.log(res);
        })
          .catch((error) => {
            console.log(error);
          });
        console.log(`You selected ${`${result.frontendQuestionId}. ${result.title}`}!`);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          const post = {
            leetcodeFrontendId: result.frontendQuestionId,
            leetcodeName: result.title,
            leetcodeDifficulty: result.difficulty,
            leetcodeUrl: `https://leetcode.com/problems/${result.title.replace(/\s/g, '-').replace(/[()]/g, '').toLowerCase()}`,
            last_reviewed: new Date(),
            due_date: new Date(),
          };

          API.post('api/cards', post).then((res) => {
            refreshTable();
            console.log(res);
          })
            .catch((error) => {
              console.log(error);
            });
          console.log(`You selected ${`${result.frontendQuestionId}. ${result.title}`}!`);
        }
      }}
    >
      {resultName}
    </div>
  );
};

SearchResult.propTypes = {
  result: PropTypes.shape({
    frontendQuestionId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
  }).isRequired,
};

export default SearchResult;
