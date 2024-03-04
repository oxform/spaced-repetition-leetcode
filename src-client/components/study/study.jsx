import React from "react";
import dayjs from "dayjs";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { Link } from "react-router-dom";
import API from "../../api/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "./study.css";
import { getAuth } from "firebase/auth";

const supermemo = require("../../util/supermemo");

class Study extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      mostDueCard: null,
      mostDueCardIntervals: null,
      urlId: null,
    };
    this.fetchDueCards = this.fetchDueCards.bind(this);
    this.practice = this.practice.bind(this);
    this.onButtonPress = this.onButtonPress.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderTooltip = this.renderTooltip.bind(this);
  }

  componentDidMount() {
    this.fetchDueCards();
  }

  onButtonPress(grade) {
    const flashcard = {
      front: this.state.mostDueCard.leetcodeName,
      back: this.state.mostDueCard.leetcodeUrl,
      interval: this.state.mostDueCard.interval,
      repetition: this.state.mostDueCard.repetition,
      efactor: this.state.mostDueCard.efactor,
      dueDate: this.state.mostDueCard.due_date,
    };

    const result = this.practice(flashcard, grade);

    if (result.repetition < 1) {
      result.repetition = 1;
    }

    // Reconstruct object for api call
    const data = {
      repetition: result.repetition,
      interval: result.interval,
      efactor: result.efactor,
      due_date: result.dueDate,
      last_reviewed: dayjs(Date.now()).toISOString(),
      review_outcome: grade,
      attempts: this.state.mostDueCard.attempts + 1,
    };

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      // Get from local storage
      const cards = JSON.parse(localStorage.getItem("cards")) || [];
      const updatedCards = cards.map((card) => {
        if (card.id === this.state.mostDueCard.id) {
          return { ...card, ...data };
        }
        return card;
      });

      localStorage.setItem("cards", JSON.stringify(updatedCards));
      this.fetchDueCards();

      // If id exists, go back to main page
      if (this.state.urlId) {
        this.props.history.push("/");
      }
    } else {
      API.put(`/api/cards/${this.state.mostDueCard.id}`, data)
        .then((result) => {
          this.fetchDueCards();
          console.log("Update successful", result);

          // If id exists, go back to main page
          if (this.state.urlId) {
            this.props.history.push("/");
          }
        })
        .catch((error) => {
          console.error("Error updating data: ", error);
        });
    }
  }

  practice(flashcard, grade) {
    const { interval, repetition, efactor } = supermemo(flashcard, grade);

    let hours = (interval * 24) / 8; // Convert days to hours

    hours = Math.round(hours / 4) * 4; // Round to nearest multiple of 8
    const dueDate = dayjs(Date.now()).add(hours, "hour").toISOString();

    return {
      ...flashcard,
      interval,
      repetition,
      efactor,
      dueDate,
    };
  }

  fetchDueCards() {
    // Check if there's an ID in the URL e.g. http://localhost:3000/study/174
    let id = this.props.location.pathname.split("/").pop();

    if (id === "study") {
      id = null;
    }

    // Check if user is logged in
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      // Get from local storage
      const cards = JSON.parse(localStorage.getItem("cards")) || [];
      const dueCards = cards.filter((card) =>
        dayjs(card.due_date).isBefore(dayjs(Date.now()))
      );

      if (dueCards.length > 0) {
        let mostDueCard = dueCards[0];
        if (id) {
          // Find the card with the matching ID
          const card = dueCards.find((card) => card.id == id);
          if (card) {
            mostDueCard = card;
          }
        }

        this.setState({ cards: dueCards, mostDueCard, urlId: id });
      } else this.setState({ cards: [], mostDueCard: null, urlId: id });
    } else {
      API.get("/api/cards/due")
        .then((data) => {
          let mostDueCard = data.data[0];

          if (id) {
            // Find the card with the matching ID
            const card = data.data.find((card) => card.id == id);
            if (card) {
              mostDueCard = card;
            }
          }

          this.setState({ cards: data.data, mostDueCard, urlId: id });
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
    }
  }

  renderTooltip(props, description) {
    return (
      <Tooltip id="button-tooltip" {...props}>
        {description}
      </Tooltip>
    );
  }

  renderButton(grade, variant, text, description) {
    return (
      <OverlayTrigger
        placement="top"
        delay={{ show: 250, hide: 400 }}
        overlay={(props) => this.renderTooltip(props, description)}
      >
        <Button
          variant={variant}
          onClick={() => this.onButtonPress(grade)}
          style={{ display: "block", marginTop: "14px", width: "100%" }}
        >
          {text}
        </Button>
      </OverlayTrigger>
    );
  }

  render() {
    const { mostDueCard } = this.state;
    return (
      <div>
        {mostDueCard ? (
          <div>
            <a
              href={mostDueCard.leetcodeUrl}
              target="_blank"
              rel="noreferrer"
              className="customLink"
            >
              {mostDueCard.leetcodeFrontendId}. {mostDueCard.leetcodeName}
            </a>
            <a
              href={mostDueCard.leetcodeUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: "block", marginTop: "14px" }}
            >
              {mostDueCard.leetcodeUrl}
            </a>
            <div style={{ marginTop: "16px" }}>
              <p>
                Attempt to solve the problem and select the button that best
                describes your experience.
              </p>
            </div>
            <div
              style={{
                width: "30%",
                alignSelf: "center",
                margin: "auto",
                marginTop: "32px",
              }}
            >
              {this.renderButton(
                5,
                "success",
                "Solved Effortlessly",
                "Solved the problem quickly without any issues or need to look up anything."
              )}
              {this.renderButton(
                4,
                "primary",
                "Solved with Minor Issues",
                "Solved the problem but faced minor setbacks, such as minor syntactical issues or a brief moment of uncertainty about the best approach."
              )}
              {this.renderButton(
                3,
                "info",
                "Solved after Struggling",
                "Solved but only after significant effort, possibly including revisiting fundamental concepts or struggling with the algorithm."
              )}
              {this.renderButton(
                2,
                "warning",
                "Incorrect, but Understood",
                "Initial attempt was wrong, but upon reviewing the solution or hints, you understood the solution clearly and felt you could have approached it correctly."
              )}
              {this.renderButton(
                1,
                "danger",
                "Incorrect, Solution Remembered",
                "Didn't solve the problem on your own and, after seeing the solution, it made sense, and you believe you'll remember it for next time."
              )}
              {this.renderButton(
                0,
                "secondary",
                "No Clue",
                "No idea how to approach the problem and even after reviewing the solution, the concept or solution didn't stick."
              )}

              <div style={{ marginTop: "54px" }} className="row">
                <div className="col">
                  <Link to="/">
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                    >
                      Go Back
                    </button>
                  </Link>
                </div>
                {!this.state.urlId && (
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      style={{ width: "100%" }}
                    >
                      Skip
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "28px" }}>No cards due for review</p>
            <div
              style={{
                width: "30%",
                alignSelf: "center",
                margin: "auto",
                marginTop: "28px",
              }}
            >
              <Link to="/">
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  Go Back
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default Study;
