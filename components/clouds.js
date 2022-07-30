import styles from "./clouds.module.css";

export default function Clouds() {
  return (
    <div className={styles.background}>
      <div className={styles.x1}>
        <div className={styles.cloud}></div>
      </div>

      <div className={styles.x2}>
        <div className={styles.cloud}></div>
      </div>

      <div className={styles.x3}>
        <div className={styles.cloud}></div>
      </div>

      <div className={styles.x4}>
        <div className={styles.cloud}></div>
      </div>

      <div className={styles.x5}>
        <div className={styles.cloud}></div>
      </div>
    </div>
  );
}
