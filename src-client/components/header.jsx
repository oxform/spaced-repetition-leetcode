import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../auth/firebase/auth";
import { Navbar, Nav, Button, Alert, CloseButton } from "react-bootstrap";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Header = () => {
  const [redirectTo, setRedirectTo] = useState(null);
  const { userLoggedIn } = useAuth();
  const [showAlert, setShowAlert] = useState(true);

  const handleLogout = async () => {
    await doSignOut();
    setRedirectTo("/sign_in");
  };

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#">Spaced Repetition Leetcode</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            {userLoggedIn ? (
              <Button variant="outline-primary" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Nav.Link as={Link} to="/sign_in">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/sign_up">
                  Register New Account
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {!userLoggedIn && showAlert && (
        <Alert variant="info" onClose={() => setShowAlert(false)}>
          <CloseButton
            data-testid="close-alert"
            onClick={() => setShowAlert(false)}
            // vertically center
            style={{
              position: "absolute",
              right: "25px",
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "transparent",
              border: "none",
              fontSize: "30px",
              color: "#0C5640",
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
          <Alert.Heading style={{ marginBottom: "20px" }}>
            Welcome to Spaced Repetition Leetcode!
          </Alert.Heading>
          <p>
            This app is designed to help you learn Leetcode problems using the
            spaced repetition technique.{" "}
            <div style={{ marginTop: "6px" }}>
              <b>Sign up or log in to save your progress!</b>
            </div>
          </p>
        </Alert>
      )}
    </>
  );
};

export default Header;
