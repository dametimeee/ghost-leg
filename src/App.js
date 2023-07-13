import { useState, useRef } from "react";
import Canvas from "./Components/Canvas";
import styles from "./App.module.css";

const App = () => {
  const [playerNum, setPlayerNum] = useState(2);
  const [playerName, setplayerName] = useState([]);
  const [cases, setCases] = useState(playerNum);
  const [caseName, setcaseName] = useState([]);
  const [isStart, setIsStart] = useState(false);

  const reload = () => {
    window.location.reload();
  };

  const decBtn = () => {
    if (playerNum <= 2) {
      window.alert("최소 인원은 2명입니다.");
      return;
    }
    setPlayerNum(playerNum - 1);
  };

  const incBtn = () => {
    if (playerNum >= 8) {
      window.alert("최대 인원은 8명입니다.");
      return;
    }
    setPlayerNum(playerNum + 1);
  };

  const inputScreen = () => {
    setIsStart(true);
  };

  return isStart ? (
    <Canvas playerNum={playerNum} />
  ) : (
    <div className={styles.wrapper}>
      <h1 className={styles.title} onClick={reload}>
        사다리 게임
      </h1>
      <div className={styles.player_start_wrapper}>
        <div className={styles.playerBtn}>
          <button onClick={decBtn}>-</button>
          <span className={styles.playerNum}>{playerNum}</span>
          <button onClick={incBtn}>+</button>
        </div>
        <div>
          <button className={styles.startBtn} onClick={inputScreen}>
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
