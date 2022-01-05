import styles from "./Coo.module.css";

function Coo(props) {
  const dateString = new Date(props.created)
    .toUTCString()
    .split(" ")
    .slice(0, 5)
    .join(" ");
  return (
    <div className={styles.Coo}>
      <h2>{props.name}</h2>
      <p>{props.content}</p>
      <p className={styles.Date}>{dateString}</p>
    </div>
  );
}

export default Coo;
