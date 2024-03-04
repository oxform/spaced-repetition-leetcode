import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PropTypes from "prop-types";

import CardsContainer from "./components/cards/cards-container";
import SignIn from "./components/auth/sign-in";
import SignUp from "./components/auth/sign-up";
import Header from "./components/header";
import Study from "./components/study/study";
import { getAuth } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { createStore } from "./store";
import PrivateRoute from "./private-route";
import API from "./api/api";
import { AuthProvider } from "./contexts/authContext";
import { useState, useEffect } from "react";

// Define the main app
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <div className="container" style={{ marginTop: "35px" }}>
            <div>
              {/* <SearchBar setResults={setResults} />
            {results && results.length > 0 && <SearchResultsList results={results} />} */}
              <Route exact path="/" component={CardsContainer} />
              <Route path="/study" component={Study} />
              <Route path="/sign_in" component={SignIn} />
              <Route path="/sign_up" component={SignUp} />
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

App.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object.isRequired,
};

export default createStore(App);
