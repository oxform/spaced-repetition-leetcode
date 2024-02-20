import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../auth/firebase/auth';
import { Navbar, Nav, Button } from 'react-bootstrap';

const Header = () => {
  const [redirectTo, setRedirectTo] = useState(null);
  const { userLoggedIn } = useAuth();

  const handleLogout = async () => {
    await doSignOut();
    setRedirectTo('/sign_in');
  };

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  return (
    <Navbar bg="light" expand="lg" fixed="top">
      <Navbar.Brand href="#">Spaced Repetition Leetcode</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          {
            userLoggedIn
              ? (
                <Button variant="outline-primary" onClick={handleLogout}>Logout</Button>
              )
              : (
                <>
                  <Nav.Link as={Link} to="/sign_in">Login</Nav.Link>
                  <Nav.Link as={Link} to="/sign_up">Register New Account</Nav.Link>
                </>
              )
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;