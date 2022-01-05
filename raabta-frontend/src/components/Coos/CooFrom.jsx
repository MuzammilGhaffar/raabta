import styles from "./CooForm.module.css";

function CooForm(props) {
  return (
    <>
      <div className={styles.Overlay} onClick={props.onOverlayClick}></div>
      <div className={styles.loginBox}>
        <h2>Write your Coo</h2>
        <form onSubmit={props.onCooSubmit} id="createCooForm">
          <div className={styles.userBox}>
            <textarea
              maxLength="500"
              rows="5"
              type="text"
              name=""
              placeholder="Enter here..."
            />
          </div>
          <p>Please enter at least 3 words</p>
          <input type="submit" />
        </form>
      </div>
    </>
  );
}

export default CooForm;
