import Point from "./data_storage/Point";
import { Game } from "./game";
import { Scene } from "./scene";
const renderer = (ctx: CanvasRenderingContext2D, game: Game) => {
  const _gameInfo = game.getGameInfo();
  let _lastScene: Scene;
  function render(scene: Scene): void {
    const scale = _gameInfo.canvas.scale;
    const { drawer, main } = _gameInfo.canvas.views;
    _lastScene = scene;
    _clearCanvas();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "rgb(35,45,35)";
    ctx.fillRect(
      drawer.start.x * scale,
      drawer.start.y * scale,
      (drawer.end.x - drawer.start.x) * scale,
      (drawer.end.y - drawer.start.y) * scale
    );
    ctx.fillStyle = "rgb(25,25,25)";
    ctx.fillRect(
      main.start.x * scale,
      main.start.y * scale,
      (main.end.x - main.start.x) * scale,
      (main.end.y - main.start.y) * scale
    );

    scene.forEach((drawObjArray) => {
      drawObjArray.forEach((drawObj) => {
        _drawSprite(
          drawObj.img,
          new Point(drawObj.loc.x * scale, drawObj.loc.y * scale),
          scale,
          drawObj.rotation
        );
      });
    });

    ctx.fillStyle = "rgba(95, 35, 35, .5)";
    ctx.fillRect(
      main.boardPosition.start.x * scale,
      main.boardPosition.start.y * scale,
      //!
      (main.boardPosition.end.x - main.boardPosition.start.x) * scale,
      (main.boardPosition.end.y - main.boardPosition.start.y) * scale
    );
  }
  function reRender(): void {
    if (_lastScene) {
      render(_lastScene);
    }
  }

  function _clearCanvas(): void {
    const scale = _gameInfo.canvas.scale;
    const trueSize = _gameInfo.canvas.trueSize;
    ctx.clearRect(0, 0, trueSize.width * scale, trueSize.height * scale);
  }
  function _drawSprite(
    bitMap: ImageBitmap,
    drawLoc: Point,
    scale: number,
    angle: number
  ): void {
    ctx.save();
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
    ctx.restore();
  }
  return {
    render,
    reRender,
  };
};

export default renderer;
