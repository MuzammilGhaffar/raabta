import React, { Component } from "react";
import User from "./User";
import styles from "./AllUsers.module.css";
import axios from "axios";

export default class AllUsers extends Component {
  constructor() {
    super();
    this.state = {
      users: [],
    };
  }
  componentDidMount() {
    axios
      .get("/getUsers", {
        params: {
          product: this.product,
        },
      })
      .then((res) => {
        let allusers = res.data;
        this.setState({
          users: allusers,
        });
      });
  }

  check = (toRender) => {
    if (this.state.users.length) {
      for (let user in this.state.users)
        toRender[user] = (
          <User
            key={this.state.users[user].id}
            id={this.state.users[user].id}
            mainUser={this.props.userid}
            name={this.state.users[user].name}
          />
        );
    } else {
      toRender[0] = (
        <div key={0} className={styles.ldsRing}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      );
    }
  };
  render() {
    var toRender = [];
    this.check(toRender);
    return <div className={styles.Grid}>{[...toRender]}</div>;
  }
}
