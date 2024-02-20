import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import API from '../../api/api';
import './cards-table.css';

class CardTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      sort: {
        column: null,
        direction: 'desc',
      },
    };
    this.fetchCards = this.fetchCards.bind(this);
    this.getByID = this.getByID.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fetchCards();
    this.handleRemoveCard = this.handleRemoveCard.bind(this);
  }

  handleChange(event) {
    const vm = this;
    const targetValue = event.target.value;
    this.setState({ filter: event.target.value }, () => {
      if (targetValue) vm.getByID();
      else vm.fetchCards();
    });
  }

  handleRemoveCard(event, id) {
    event.preventDefault();
    API.delete(`/api/cards/${id}`)
      .then(() => {
        this.fetchCards();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  onSort(column, dir = null) {
    return (event) => {
      let direction;

      if (!dir) {
        direction = this.state.sort.column === column
          ? (this.state.sort.direction === 'asc' ? 'desc' : 'asc')
          : 'desc';
      } else dir = direction;

      const sortedData = this.state.cards.sort((a, b) => {
        if (column === 'due_in') {
          const diffB = new Date(a.due_date) - new Date();
          const diffA = new Date(b.due_date) - new Date();
          return direction === 'asc' ? diffA - diffB : diffB - diffA;
        }
        if (column === 'leetcodeName') {
          return direction === 'asc' ? a[column].localeCompare(b[column]) : b[column].localeCompare(a[column]);
        }
        // if (column === 'last_reviewed') {
        //   return direction === 'asc' ? new Date(a[column]) - new Date(b[column]) : new Date(b[column]) - new Date(a[column]);
        // }
        // if (column === 'due_date') {
        //   return direction === 'asc' ? new Date(a[column]) - new Date(b[column]) : new Date(b[column]) - new Date(a[column]);
        // }
        if (column === 'attempts') {
          return direction === 'asc' ? a[column] - b[column] : b[column] - a[column];
        }
        return direction === 'asc' ? a[column].localeCompare(b[column]) : b[column].localeCompare(a[column]);
      });

      this.setState({
        cards: sortedData,
        sort: {
          column,
          direction,
        },
      });
    };
  }

  getByID() {
    const { filter } = this.state;
    API.get(`/api/cards/${filter}`)
      .then((res) => {
        if (res.data) this.setState({ cards: [res.data] });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async fetchCards() {
    try {
      await API.get('/api/cards')
        .then((res) => {
          this.setState({ cards: res.data });
          this.onSort('due_in', 'asc')(); // Reset sort and sort by due in
        });
    } catch (error) {
      console.error('Error fetching ID token:', error);
    }
  }

  render() {
    const { cards } = this.state;

    const listItems = cards.map((item) => {
      // Calculate the difference in milliseconds
      const diff = new Date(item.due_date) - new Date();

      // Calculate the number of days, hours, and minutes
      const days = Math.floor(diff / 1000 / 60 / 60 / 24);
      let hours = Math.floor(diff / 1000 / 60 / 60) % 24;
      const minutes = Math.floor(diff / 1000 / 60) % 60;

      // If there are any minutes left and the days are 0, round up the hours
      if (minutes > 0 && days === 0) {
        hours += 1; // This effectively rounds up the hours
      }

      // Determine the time remaining
      let timeRemaining = '';
      let rowColor = '';
      if (diff < 0) {
        timeRemaining = 'Study';
        rowColor = 'table-primary-bg';
      } else if (days > 0) {
        const plural = days > 1 ? 's' : '';
        // Include the hours only if it's less than 24 after rounding up
        const hoursText = hours > 0 ? ` ${hours} hour${hours > 1 ? 's' : ''}` : '';
        timeRemaining = `${days} day${plural}${hoursText}`;
        rowColor = 'table-success-bg';
      } else if (hours === 1) {
        timeRemaining = `${minutes} minutes`;
        rowColor = 'table-danger-bg';
      } else if (hours === 24) {
        timeRemaining = '1 day';
        rowColor = 'table-success-bg';
      } else if (hours > 0) {
        // Use the rounded-up hours value
        timeRemaining = `${hours} hour${hours > 1 ? 's' : ''}`;
        rowColor = 'table-warning-bg';
      }

      return (
        <tr key={item.id}>
          <td>
            <span className={`${item.leetcodeDifficulty} due-block`}>
              {item.leetcodeDifficulty}
            </span>
          </td>
          <td>
            <div className="center">
              <a href={item.leetcodeUrl} target="_blank" rel="noreferrer" style={{ color: 'black' }}>
                {item.leetcodeFrontendId}
                .
                {' '}
                {item.leetcodeName}
              </a>
            </div>
          </td>
          {/* <td>{new Date(item.last_reviewed).toLocaleDateString()}</td>
          <td>
            {new Date(item.due_date).toLocaleDateString()}
          </td> */}
          <td>
            {diff < 0 ? (
              <Link to={`/study/${item.id}`}>
                <button type="button" className="btn btn-primary due-block">
                  Study
                </button>
              </Link>
            ) : (
              <span className={`${rowColor} due-block`}>
                {timeRemaining}
              </span>
            )}
          </td>
          <td>{item.attempts}</td>
          <td>
            {/* Delete button */}
            <button
              type="button"
              className="btn btn-danger"
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px'
              }}
              onClick={(event) => this.handleRemoveCard(event, item.id)}
            >
              <FaTrash />
            </button>
          </td>
        </tr>
      );
    });
    return (
      <div className="card">
        <div className="card-body">
          <table className="table table-hover table-responsive-sm">
            <thead>
              <tr>
                <th scope="col" onClick={this.onSort('leetcodeDifficulty')} style={{ cursor: 'pointer' }}>
                  Difficulty
                  <span className={this.state.sort.column === 'leetcodeDifficulty' ? 'black-chevron' : 'gray-chevron'}>
                    {this.state.sort.column === 'leetcodeDifficulty' ? (this.state.sort.direction === 'asc' ? '▲' : '▼') : '▲'}
                  </span>
                </th>
                <th scope="col" onClick={this.onSort('leetcodeName')} style={{ cursor: 'pointer' }}>
                  Name
                  <span className={this.state.sort.column === 'leetcodeName' ? 'black-chevron' : 'gray-chevron'}>
                    {this.state.sort.column === 'leetcodeName' ? (this.state.sort.direction === 'asc' ? '▲' : '▼') : '▲'}
                  </span>
                </th>
                {/* <th scope="col" onClick={this.onSort('last_reviewed')} style={{ cursor: 'pointer' }}>
                  Last Reviewed
                  <span className={this.state.sort.column === 'last_reviewed' ? 'black-chevron' : 'gray-chevron'}>
                    {this.state.sort.column === 'last_reviewed' ? (this.state.sort.direction === 'asc' ? '▲' : '▼') : '▲'}
                  </span>
                </th>
                <th scope="col" onClick={this.onSort('due_date')} style={{ cursor: 'pointer' }}>
                  Due Date
                  <span className={this.state.sort.column === 'due_date' ? 'black-chevron' : 'gray-chevron'}>
                    {this.state.sort.column === 'due_date' ? (this.state.sort.direction === 'asc' ? '▲' : '▼') : '▲'}
                  </span>
                </th> */}
                <th onClick={this.onSort('due_in')} style={{ cursor: 'pointer' }}>
                  Due in
                  <span className={this.state.sort.column === 'due_in' ? 'black-chevron' : 'gray-chevron'}>
                    {this.state.sort.column === 'due_in' ? (this.state.sort.direction === 'asc' ? '▲' : '▼') : '▲'}
                  </span>
                </th>
                <th onClick={this.onSort('attempts')} style={{ cursor: 'pointer' }}>
                  Attempts
                  <span className={this.state.sort.column === 'attempts' ? 'black-chevron' : 'gray-chevron'}>
                    {this.state.sort.column === 'attempts' ? (this.state.sort.direction === 'asc' ? '▲' : '▼') : '▲'}
                  </span>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>{listItems}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default CardTable;
