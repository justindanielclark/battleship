import { CanvasConfig } from "./canvas";
import { ModelSprites } from "./assets/ModelSprites";
import { TextSprites } from "./assets/TextSprites";
import Point from "./logic/Point";
import Board from "./logic/Board";

const renderer = (
  canvasData: CanvasConfig,
  ctx: CanvasRenderingContext2D,
  modelSprites: ModelSprites,
  textSprites: TextSprites
) => {
  const _drawerDimensions = {
    start: new Point(0, 0),
    end: new Point(0, 0),
  };
  const _mainDimensions = {
    start: new Point(0, 0),
    end: new Point(0, 0),
  };
  const _boardDimensions = {
    start: new Point(0, 0),
    end: new Point(0, 0),
  };
  function render(): void {
    _clearCanvas();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "rgb(45,45,45)";
    ctx.fillRect(
      _drawerDimensions.start.x,
      _drawerDimensions.start.y,
      _drawerDimensions.end.x,
      _drawerDimensions.end.y
    );
    ctx.fillStyle = "rgb(35,35,35)";
    ctx.fillRect(
      _mainDimensions.start.x,
      _mainDimensions.start.y,
      _mainDimensions.end.x,
      _mainDimensions.end.y
    );
  }
  function _drawDefensiveBoard(board: Board) {
    //todo
  }
  function _drawOffensiveBoard(board: Board) {
    //todo
  }
  function _clearCanvas(): void {
    ctx.clearRect(0, 0, canvasData.width, canvasData.height);
  }
  function _drawSprite(
    bitMap: ImageBitmap,
    drawLoc: Point,
    scale: number,
    angle: number
  ): void {
    const scaledHeight = bitMap.height * scale;
    const scaledWidth = bitMap.width * scale;
    ctx.translate(drawLoc.x + scaledWidth / 2, drawLoc.y + scaledHeight / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(
      bitMap,
      0,
      0,
      bitMap.width,
      bitMap.height,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );
    ctx.rotate((-angle * Math.PI) / 180);
    ctx.translate(-drawLoc.x - scaledWidth / 2, -drawLoc.y - scaledHeight / 2);
  }
  function updateDimensions(): void {
    if (canvasData.orientation === "landscape") {
      _drawerDimensions.start.x = 0;
      _drawerDimensions.start.y = 0;
      _drawerDimensions.end.x = canvasData.width / 4;
      _drawerDimensions.end.y = canvasData.height;
      _mainDimensions.start.x = canvasData.width / 4;
      _mainDimensions.start.y = 0;
      _mainDimensions.end.x = canvasData.width;
      _mainDimensions.end.y = canvasData.height;
    }
    if (canvasData.orientation === "portrait") {
      _drawerDimensions.start.x = 0;
      _drawerDimensions.start.y = 0;
      _drawerDimensions.end.x = canvasData.width;
      _drawerDimensions.end.y = canvasData.height / 4;
      _mainDimensions.start.x = 0;
      _mainDimensions.start.y = canvasData.height / 4;
      _mainDimensions.end.x = canvasData.width;
      _mainDimensions.end.y = canvasData.height;
    }
  }
  return {
    render,
    updateDimensions,
  };
};

export default renderer;
