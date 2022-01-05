import styles from "./Navigation.module.css";
import { NavLink } from "react-router-dom";

function Navigation(props) {
  return (
    <ul className={styles.LinkWrapper}>
      <li>
        <button className={styles.Signout} onClick={props.onSignOut}>
          Sign out{" "}
        </button>
      </li>

      <li>
        <NavLink to="/my-profile" activeClassName={styles.active}>
          {props.username}{" "}
        </NavLink>
      </li>
      <li>
        <NavLink to="/allcoos" exact activeClassName={styles.active}>
          All Coos{" "}
        </NavLink>
      </li>
      <li>
        <button className={styles.Createcoo} onClick={props.onCreateCoo}>
          Create Coo{" "}
        </button>
      </li>
    </ul>
  );
}

export default Navigation;
