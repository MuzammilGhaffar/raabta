import styles from "./MyProfile.module.css";
import axios from "axios";

function getFollowers(id) {
  const user = { id: id };
  axios.post("/getFollowers", user).then(
    (res) => {
      console.log(res.data);
    },
    (err) => console.log("Error: ", err)
  );
}

function getCoos(id) {
  const user = { id: id };
  axios.get("/userCoos/" + id).then(
    (res) => {
      console.log(res.data);
    },
    (err) => console.log("Error: ", err)
  );
}

function getFollowing(id) {
  const user = { id: id };
  axios.post("/getFollowers", user).then(
    (res) => {
      console.log(res.data);
    },
    (err) => console.log("Error: ", err)
  );
}

function MyProfile(props) {
  console.log(props);
  return (
    <div className={styles.ProfileGrid}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault;
          getFollowers(props.id);
        }}
      >
        Followers
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault;
          getCoos(props.id);
        }}
      >
        My Coos
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault;
          getFollowing(props.id);
        }}
      >
        Following
      </a>
    </div>
  );
}
export default MyProfile;
