import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CardTable from './cards-table';
import AddLeetcode from '../add-leetcode/AddLeetcode';

export default class CardContainer extends Component {
  constructor(props) {
    super(props);
    this.refreshTable = this.refreshTable.bind(this);
    this.cardTable = React.createRef();
  }

  refreshTable(card) {
    this.cardTable.current.fetchCards(card);
  }

  render() {
    return (
      <div className="col">
        {/* <CardAdd refreshTable={this.refreshTable} /> */}
        <Link to="/study">
          <button type="button" className="btn btn-primary" style={{ marginBottom: '25px', fontSize: '24px', borderRadius: '12px' }}>
            Study now
          </button>
        </Link>
        <AddLeetcode refreshTable={this.refreshTable} />
        <div style={{ marginBottom: '25px', marginTop: '25px' }}> </div>
        <CardTable ref={this.cardTable} />
      </div>
    );
  }
}
