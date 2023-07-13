import styles from "./Result.module.css";

const Result = ({ resultArr }) => {
  return (
    <div className={styles.resultWrapper}>
      <div className={styles.resultHeader}>
        <span>이름</span>
        <span>결과</span>
      </div>
      <div className={styles.resultContent}>
        {resultArr.map((result, index) => {
          return (
            <div key={index} className={styles.eachResultContent}>
              <span>{result[1]}</span>
              <span>{result[0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Result;
