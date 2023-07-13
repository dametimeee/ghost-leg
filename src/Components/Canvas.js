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

  const handleSetPlayerInput = () => {
    let inputNameArray = [];

    for (let i = 0; i < playerNum; i++) {
      let left = canvasLeft + i * 150;
      let top = canvasTop + 20;

      inputNameArray.push(
        <input
          className={styles.playerName} // Update the class name to use CSS module
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

  const handleSetTargetInput = () => {
    let inputTargetArray = [];

    for (let i = 0; i < playerNum; i++) {
      inputTargetArray.push(
        <input
          className={styles.targetName} // Update the class name to use CSS module
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

  const handleDrawClickRoute = (event) => {
    if (ctx && goNext) {
      inputClickNum++;
      const lineId = event.target.id;
      const lineIndex = Number(lineId.slice(-1));

      if (!isNaN(lineIndex)) {
        // 유효한 lineIndex인지 확인
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

  // ---------------------- draw --------------------------

  let initialPointX = 50;
  let initialPointY = 50;
  let endLineY = 750;
  let lineIdObj = {};
  let randomCrossPointArrays = [];
  let baseArrays = [];
  let moveRight = 150;
  let moveLeft = -150;
  let playersInitialXCoord = {};
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

  const setLadderNum = () => {
    numRandomLadders = Math.floor(Math.random() * 4) + 2;
  };

  const drawVerticalLines = (ctx) => {
    setLadderNum();
    generateRandomCrossPoints();

    ctx.beginPath();

    for (let i = 0; i < playerNum; i++) {
      makeLineIdObj(i);
      // create players and initialize their start point
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

  const makeLineIdObj = (i) => {
    lineIdObj[`line${i}`] = i;
  };

  const generateRandomCrossPoints = () => {
    for (let i = 0; i < playerNum; i++) {
      if (i < playerNum - 1) {
        // create randomCrossPointArrays that will store cross points
        if (!randomCrossPointArrays[i]) {
          randomCrossPointArrays[i] = [];
        }
        if (!randomCrossPointArrays[i + 1]) {
          randomCrossPointArrays[i + 1] = [];
        }
        // push random cross points into randomCrossPointArrays from above.
        for (let j = 0; j < numRandomLadders; j++) {
          // randomCrossPoint should be between 125 and 670
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

  const handleDrawBaseLine = (ctx) => {
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    ctx.beginPath();

    // draw vertical baseline
    for (let i = 0; i < playerNum; i++) {
      player[i].xCoord = initialPointX + i * 150;
      player[i].yCoord = initialPointY;
      ctx.moveTo(player[i].xCoord, player[i].yCoord);
      ctx.lineTo(player[i].xCoord, endLineY);
    }

    // draw horizontal baseline
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

  const hadnleClearCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }
  };

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
