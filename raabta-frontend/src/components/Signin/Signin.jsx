import React from "react";
import styles from "./Signin.module.css";
import { Redirect } from "react-router-dom";
import axios from "axios";

class Signin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toReg: null,
    };
  }
  signin = (e, user) => {
    let p = e.target.children[1];
    if (this.validate(user) === 1 || this.validate(user) === 0) {
      let error = "Username or password is not correct";
      p.innerHTML = error;
      return;
    }
    axios.post("/login", user).then(
      (res) => {
        console.log(res);
        this.props.setUserInfo(res.data);
      },
      (err) => {
        let error = "Username or password is not correct";
        p.innerHTML = error;
      }
    );
    console.log("i am signing in...");
  };

  register = (e, user) => {
    let p = e.target.children[1];
    if (this.validate(user) === 1) {
      let error =
        "Username must be between 3-20 characters and can only have characters or underscore(_)";
      p.innerHTML = error;
      return;
    } else if (this.validate(user) === 0) {
      let error = "Password must have atleast 6 characters";
      p.innerHTML = error;
      return;
    }

    axios.post("/register", user).then(
      (res) => {
        this.props.setUserInfo(res.data);
      },
      (err) => {
        let error = "Username is already taken, try a different one";
        p.innerHTML = error;
      }
    );
    console.log("i am registering...");
  };
  validate = (user) => {
    if (!/^[A-Za-z0-9_-]{3,16}$/.test(user.name)) {
      return 1;
    } else if (user.password.length < 6) {
      return 0;
    }
  };
  loginHandler = (e) => {
    e.preventDefault();
    let p = e.target.children[1];
    p.innerHTML = "";
    const user = { name: e.target[0].value, password: e.target[1].value };
    if (this.state.toReg) {
      this.setState({ toReg: null });
      return this.register(e, user);
    }
    return this.signin(e, user);
  };
  render() {
    return (
      <>
        <div className={styles.loginBox}>
          <h2>Sign in</h2>
          <form
            autoComplete="off"
            id="createCooForm"
            onSubmit={this.loginHandler}
          >
            <div className={styles.userBox}>
              <input
                spellCheck="false"
                type="text"
                name="username"
                placeholder="Enter Username"
              />
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
              />
            </div>
            <p></p>
            <div className={styles.subButton}>
              <input type="submit" name="signin" value="Sign in" />
              <input
                onClick={() => this.setState({ toReg: 1 })}
                type="submit"
                name="register"
                value="Register"
              />
            </div>
          </form>
        </div>
        <Redirect to="/" />
      </>
    );
  }
}

export default Signin;
