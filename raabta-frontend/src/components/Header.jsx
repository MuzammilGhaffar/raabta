import styles from "./Header.module.css";
import { NavLink } from "react-router-dom";
import axios from "axios";

function searchUser(e) {
  const user = { username: e.target[0].value };
  axios.post("/searchUser", user).then(
    (res) => {
      console.log(res.data);
    },
    (err) => {
      console.log("Error: ", err);
    }
  );
}

function Header() {
  return (
    <div className={styles.Header}>
      <h1>Raabta</h1>
      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          return searchUser(e);
        }}
      >
        <input type="text" placeholder="Search for Users" name="search" />
        <button type="submit">Go</button>
      </form>
      <NavLink to="/allusers" exact activeClassName={styles.active}>
        All Users
      </NavLink>
    </div>
  );
}

export default Header;
