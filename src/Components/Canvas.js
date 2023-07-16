import { useState, useRef, useEffect } from "react";
import Result from "./Result";
import styles from "./Canvas.module.css";

const Canvas = ({ playerNum }) => {
  const canvas = useRef();
  const playerInput = useRef([]);
  const targetInput = useRef([]);

  const [canvasLeft, setCanvasLeft] = useState(0);
  const [canvasTop, setCanvasTop] = useState(0);
  const [ctx, setCtx] = useState(null);
  const [goNext, setGoNext] = useState(false);
  const [goResult, setGoResult] = useState(false);
  const [resultArr, setResultArr] = useState([]);

  let target;
  let all_result = [];

  let inputClickNum = 0;

  let inputWidth = 100;
  let inputHeight = 30;

  // 플레이어 입력 항목을 설정합니다.
  const handleSetPlayerInput = () => {
    let inputNameArray = [];

    for (let i = 0; i < playerNum; i++) {
      let left = canvasLeft + i * 150;
      let top = canvasTop + 20;

      inputNameArray.push(
        <input
          className={styles.playerName} // CSS 모듈을 사용하도록 클래스 이름을 업데이트합니다.
          type="text"
          key={i}
          id={`line${i}`}
          style={{
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
            width: `${inputWidth}px`,
            height: `${inputHeight}px`,
          }}
          onClick={handleDrawClickRoute}
          ref={(el) => (playerInput.current[i] = el)}
          readOnly={goNext}
        />
      );
    }

    return inputNameArray;
  };

  // 대상 입력 항목을 설정합니다.
  const handleSetTargetInput = () => {
    let inputTargetArray = [];

    for (let i = 0; i < playerNum; i++) {
      inputTargetArray.push(
        <input
          className={styles.targetName} // CSS 모듈을 사용하도록 클래스 이름을 업데이트합니다.
          type="text"
          key={i}
          style={{
            position: "absolute",
            left: `${canvasLeft + i * 150}px`,
            top: `${
              canvasTop + (canvas.current ? canvas.current.height : 0) - 37
            }px`,
            width: `${inputWidth}px`,
            height: `${inputHeight}px`,
          }}
          ref={(el) => (targetInput.current[i] = el)}
          readOnly={goNext}
        />
      );
    }
    target = inputTargetArray;
    return inputTargetArray;
  };

  // 상단 항목 버튼 클릭 시 호출되는 함수입니다.
  const handleDrawClickRoute = (event) => {
    if (ctx && goNext) {
      inputClickNum++;
      const lineId = event.target.id;
      const lineIndex = Number(lineId.slice(-1));

      if (!isNaN(lineIndex)) {
        // 유효한 lineIndex인지 확인합니다.
        let result = drawGhostLegs(lineIndex);
        all_result.push([result, event.target.value]);

        if (resultArr.length >= playerNum) {
          return;
        } else {
          resultArr.push(all_result);
        }
      }
    }
  };

  // 다음으로 넘어가는 함수를 처리합니다.
  const handleSetGoNext = () => {
    if (inputClickNum === playerNum) {
      setGoResult(true);
      return;
    }

    for (let i = 0; i < playerNum; i++) {
      if (
        playerInput.current[i].value === "" ||
        targetInput.current[i].value === ""
      ) {
        alert("모든 칸을 채워주세요.");
        return;
      }
    }

    setGoNext(true);
  };

  // ---------------------- 그리기 관련 함수 --------------------------

  let initialPointX = 50;
  let initialPointY = 50;
  let endLineY = 750;
  let lineIdObj = {};
  let randomCrossPointArrays = [];
  let baseArrays = [];
  let moveRight = 150;
  let moveLeft = -150;
  let numRandomLadders;
  let player = [];
  let playPen = [];
  let colorArr = [
    "indianred",
    "darkmagenta",
    "mediumslateblue",
    "sandybrown",
    "khaki",
    "dodgerblue",
    "blueviolet",
    "mediumspringgreen",
    "aqua",
  ];
  let yValue;

  // 사다리의 개수를 설정합니다.
  const setLadderNum = () => {
    numRandomLadders = Math.floor(Math.random() * 4) + 2;
  };

  // 수직 선을 그립니다.
  const drawVerticalLines = (ctx) => {
    setLadderNum();
    generateRandomCrossPoints();

    ctx.beginPath();

    for (let i = 0; i < playerNum; i++) {
      makeLineIdObj(i);
      // 플레이어를 생성하고 시작점을 초기화합니다.
      player[i] = {};
      player[i].xCoord = initialPointX + i * 150;
      player[i].yCoord = initialPointY;

      ctx.moveTo(player[i].xCoord, player[i].yCoord);
      ctx.lineTo(player[i].xCoord, endLineY);
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.25;
    ctx.stroke();
  };

  // lineIdObj를 생성합니다.
  const makeLineIdObj = (i) => {
    lineIdObj[`line${i}`] = i;
  };

  // 랜덤한 교차 지점을 생성합니다.
  const generateRandomCrossPoints = () => {
    for (let i = 0; i < playerNum; i++) {
      if (i < playerNum - 1) {
        // 교차 지점을 저장할 배열인 randomCrossPointArrays를 생성합니다.
        if (!randomCrossPointArrays[i]) {
          randomCrossPointArrays[i] = [];
        }
        if (!randomCrossPointArrays[i + 1]) {
          randomCrossPointArrays[i + 1] = [];
        }
        // 랜덤한 교차 지점을 생성하고 randomCrossPointArrays에 추가합니다.
        for (let j = 0; j < numRandomLadders; j++) {
          // 교차 지점은 125에서 670 사이여야 합니다.
          let randomCrossPoints =
            Math.floor(Math.random() * 300 + Math.random() * 300) + 100;
          randomCrossPointArrays[i].push(randomCrossPoints);
          randomCrossPointArrays[i + 1].push(randomCrossPoints);
        }
      }
      randomCrossPointArrays[i] = randomCrossPointArrays[i].sort();
      baseArrays[i] = [...randomCrossPointArrays[i]];
    }
  };

  // 베이스 라인을 그립니다.
  const handleDrawBaseLine = (ctx) => {
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    ctx.beginPath();

    // 수직 베이스 라인 그리기
    for (let i = 0; i < playerNum; i++) {
      player[i].xCoord = initialPointX + i * 150;
      player[i].yCoord = initialPointY;
      ctx.moveTo(player[i].xCoord, player[i].yCoord);
      ctx.lineTo(player[i].xCoord, endLineY);
    }

    // 수평 베이스 라인 그리기
    for (let i = 0; i < playerNum - 1; i++) {
      for (let j = 0; j < baseArrays[i].length; j++) {
        ctx.moveTo(player[i].xCoord, baseArrays[i][j]);
        ctx.lineTo(player[i].xCoord + moveRight, baseArrays[i][j]);

        if (baseArrays[i + 1] !== undefined) {
          baseArrays[i + 1] = baseArrays[i + 1].filter(function (x) {
            return x !== baseArrays[i][j];
          });
        }
      }
    }

    ctx.lineWidth = 0.5;
    ctx.stroke();
  };

  // 캔버스를 지웁니다.
  const hadnleClearCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }
  };

  // 사다리를 그립니다.
  const drawGhostLegs = (lineIndex) => {
    let i = lineIndex;

    if (ctx && i !== undefined) {
      let currentY;
      let firstY = randomCrossPointArrays[i][0];

      playPen[i] = canvas.current.getContext("2d");
      hadnleClearCanvas();
      playPen[i].lineWidth = 0.5;
      handleDrawBaseLine(ctx);

      playPen[i].beginPath();
      playPen[i].moveTo(player[i].xCoord, player[i].yCoord);

      player[i].yCoord = firstY;
      playPen[i].lineTo(player[i].xCoord, firstY);
      playPen[i].strokeStyle = colorArr[i];

      while (currentY !== player[i].yCoord) {
        currentY = player[i].yCoord;

        if (lineIndex > 0) {
          if (
            randomCrossPointArrays[lineIndex - 1].includes(player[i].yCoord)
          ) {
            player[i].xCoord += moveLeft;
            playPen[i].lineTo(player[i].xCoord, player[i].yCoord);

            lineIndex--;

            for (let j = 0; j < randomCrossPointArrays[lineIndex].length; j++) {
              yValue = randomCrossPointArrays[lineIndex][j];
              if (yValue > player[i].yCoord) {
                player[i].yCoord = yValue;
                playPen[i].lineTo(player[i].xCoord, player[i].yCoord);
                j = randomCrossPointArrays[lineIndex].length;
              }
            }
          } else if (lineIndex < playerNum - 1) {
            if (
              randomCrossPointArrays[lineIndex + 1].includes(player[i].yCoord)
            ) {
              player[i].xCoord += moveRight;
              playPen[i].lineTo(player[i].xCoord, player[i].yCoord);

              lineIndex++;

              for (
                let j = 0;
                j < randomCrossPointArrays[lineIndex].length;
                j++
              ) {
                yValue = randomCrossPointArrays[lineIndex][j];
                if (yValue > player[i].yCoord) {
                  player[i].yCoord = yValue;
                  playPen[i].lineTo(player[i].xCoord, player[i].yCoord);
                  j = randomCrossPointArrays[lineIndex].length;
                }
              }
            }
          }
        } else if (lineIndex < playerNum - 1) {
          if (
            randomCrossPointArrays[lineIndex + 1].includes(player[i].yCoord)
          ) {
            lineIndex++;
            player[i].xCoord += moveRight;
            playPen[i].lineTo(player[i].xCoord, player[i].yCoord);

            for (let j = 0; j < randomCrossPointArrays[lineIndex].length; j++) {
              yValue = randomCrossPointArrays[lineIndex][j];
              if (yValue > player[i].yCoord) {
                player[i].yCoord = yValue;
                playPen[i].lineTo(player[i].xCoord, player[i].yCoord);
                j = randomCrossPointArrays[lineIndex].length;
              }
            }
          }
        }
      }
      playPen[i].lineTo(player[i].xCoord, endLineY);
      playPen[i].lineWidth = 3;
      playPen[i].stroke();

      let result = targetInput.current[lineIndex].value;
      return result;
    }
  };

  useEffect(() => {
    if (canvas.current) {
      const context = canvas.current.getContext("2d");
      setCtx(context);
      setCanvasLeft(canvas.current.offsetLeft);
      setCanvasTop(canvas.current.offsetTop);
      drawVerticalLines(context);
      if (goNext) {
        handleDrawBaseLine(context);
      }
    }
  }, [canvas, ctx, goNext]);

  return goResult ? (
    <Result resultArr={resultArr[0]} />
  ) : (
    <>
      <div className={styles.canvasWrapper}>
        <div>
          <div>{handleSetPlayerInput()}</div>
          <canvas ref={canvas} width={playerNum * 145} height="790"></canvas>
          <div>{handleSetTargetInput()}</div>
        </div>
      </div>
      <div className={styles.nextBtn} onClick={handleSetGoNext}>
        다음
      </div>
    </>
  );
};

export default Canvas;
