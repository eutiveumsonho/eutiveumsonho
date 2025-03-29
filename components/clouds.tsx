import { Box } from "grommet";
import styles from "./clouds.module.css";

export default function Clouds(): JSX.Element {
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
      <div className={styles.x6}>
        <div className={styles.cloud}></div>
      </div>
      <div className={styles.x7}>
        <div className={styles.cloud}></div>
      </div>
    </div>
  );
}