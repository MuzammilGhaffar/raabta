import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./User.module.css";

function follow(follow) {
  axios.post("/follow", follow).then(
    (res) => {
      console.log(res.data);
    },
    (err) => {
      console.log(err);
    }
  );
}
function User(props) {
  const [followInfo, setInfo] = useState({ follower: null, following: null });
  useEffect(() => {
    axios.post("/getFollowInfo", { id: props.id }).then(
      (res) => {
        setInfo({
          ...followInfo,
          follower: res.data.followerCount,
          following: res.data.followingCount,
        });
      },
      (err) => {
        console.log("Error: ", err);
      }
    );
  }, []);
  return (
    <div className={styles.UserBlock}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          getFollowers(props.id);
        }}
      >
        {props.name}
      </a>
      <div>
        <p>
          Followers:{" "}
          {followInfo.follower !== null ? followInfo.follower : "..."}
        </p>
        <p>
          Following:{" "}
          {followInfo.following !== null ? followInfo.following : "..."}
        </p>
      </div>
      <button
        onClick={() =>
          follow({ toFollow: props.id, following: props.mainUser })
        }
      >
        Follow
      </button>
    </div>
  );
}

export default User;
