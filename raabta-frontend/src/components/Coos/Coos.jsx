import styles from "./Coos.module.css";
import Coo from "./Coo";
import React from "react";
import Navigation from "./Navigation";
import MyProfile from "../MyProfile/MyProfile";
import { Switch, Route, Redirect } from "react-router-dom";
import CooForm from "./CooFrom";
import axios from "axios";
import io from "socket.io-client";
import AllUsers from "./Users/AllUsers";
var socket;

class Coos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createCoo: false,
      Coos: [],
    };
    this.postCoos = this.postCoos.bind(this);
    socket = io("http://localhost:5000");
  }
  onCreateCooHandler = (e) => {
    this.setState({
      createCoo: true,
    });
    document.body.style.overflow = "hidden";
  };
  OverlayClickHandler = (e) => {
    this.setState({
      createCoo: false,
    });
    document.body.style.overflow = "auto";
  };

  getCoos() {
    axios.get("/coos").then((coos) => {
      coos = coos.data;
      if (coos.length) {
        this.setState({
          Coos: [...coos],
        });
      }
    });
  }

  componentDidMount() {
    socket.on("informed", (msg) => console.log(msg));
    this.getCoos();
  }

  postCoos(e) {
    e.preventDefault();
    const content = e.target[0];
    const errorPara = e.target.children[1];
    if (content.value) {
      errorPara.style.visibility = "hidden";
    } else {
      errorPara.style.visibility = "visible";
      setTimeout(() => {
        errorPara.style.visibility = "hidden";
      }, 5000);
    }
    const coo = {
      user_id: this.props.user_id,
      name: this.props.username,
      content: content.value,
    };
    axios.post("/coos", coo).then(
      (res) => {
        console.log(res);
        content.value = "";
        socket.emit("inform all", this.props.user_id);
      },
      (err) => {
        console.error(err);
        content.value = "";
      }
    );
  }

  render() {
    return (
      <div className={styles.App}>
        <Navigation
          onSignOut={this.props.onSignOut}
          onCreateCoo={this.onCreateCooHandler}
          username={this.props.username}
        />
        {this.state.createCoo ? (
          <CooForm
            onOverlayClick={this.OverlayClickHandler}
            onCooSubmit={this.postCoos}
          />
        ) : (
          ""
        )}
        <Switch>
          <Route
            path="/my-profile"
            exact
            component={() => <MyProfile id={this.props.user_id} />}
          />
          <Route
            path="/allcoos"
            exact
            component={() => {
              if (this.state.Coos.length) {
                var allCoos = [];
                for (let index in this.state.Coos) {
                  allCoos[index] = (
                    <Coo
                      key={this.state.Coos[index].id}
                      user_id={this.state.Coos[index].user_id}
                      coo_id={this.state.Coos[index].id}
                      name={this.state.Coos[index].name}
                      content={this.state.Coos[index].content}
                      created={this.state.Coos[index].created}
                    />
                  );
                }
                return [...allCoos];
              }
              return (
                <div className={styles.ToMakeCenter}>
                  <div key={0} className={styles.ldsRing}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              );
            }}
          />
          <Route
            path="/allusers"
            exact
            component={() => <AllUsers userid={this.props.user_id} />}
          />
          <Redirect to="/allcoos" />
        </Switch>
      </div>
    );
  }
}

export default Coos;
