import React from "react";
import Coos from "./Coos/Coos";
import Signin from "./Signin/Signin";
import styles from "./App.module.css";
import Cookies from "js-cookies";
import Header from "./Header";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: null,
      username: "",
      loggedin: false,
    };
  }

  onSignOut = () => {
    this.setState({
      user_id: null,
      username: "",
      loggedin: false,
    });
    Cookies.removeItem("name");
    Cookies.removeItem("id");
  };

  componentDidMount() {
    if (Cookies.getItem("name") && Cookies.getItem("id")) {
      this.setState({
        loggedin: true,
        username: Cookies.getItem("name"),
        user_id: Cookies.getItem("id"),
      });
    }
  }

  setUserInfo = (e) => {
    this.setState({
      user_id: e.id,
      username: e.name,
      loggedin: true,
    });
    Cookies.setItem("name", e.name, { expires: 1 });
    Cookies.setItem("id", e.id, { expires: 1 });
  };

  render() {
    var toRender = null;
    var header = (
      <header className={styles.Header}>
        <h1>Raabta - Building Liaison</h1>
      </header>
    );
    if (this.state.loggedin) {
      header = <Header />;
      toRender = (
        <Coos
          onSignOut={this.onSignOut}
          user_id={this.state.user_id}
          username={this.state.username}
        />
      );
    } else toRender = <Signin setUserInfo={this.setUserInfo} />;
    return (
      <>
        {header}
        {toRender}
      </>
    );
  }
}

export default App;
