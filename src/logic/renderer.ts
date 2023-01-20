import Point from "./data_storage/Point";
import { Game } from "./game";
import { Scene } from "./sceneBuilder";
const renderer = (ctx: CanvasRenderingContext2D, game: Game) => {
  const _gameInfo = game.getGameInfo();
  let _lastScene: Scene;
  function render(scene: Scene): void {
    const scale = _gameInfo.canvas.scale;
    const { drawer, main } = _gameInfo.canvas.views;
    _lastScene = scene;
    _clearCanvas();
    ctx.imageSmoothingEnabled = false;

    //SECTION1
    ctx.fillStyle = "rgba(45,25,25,1)";
    ctx.fillRect(
      drawer.sections[0].start.x * scale,
      drawer.sections[0].start.y * scale,
      (drawer.sections[0].end.x - drawer.sections[0].start.x) * scale,
      (drawer.sections[0].end.y - drawer.sections[0].start.y) * scale
    );
    //SECTION2
    ctx.fillStyle = "rgba(25,45,25,1)";
    ctx.fillRect(
      drawer.sections[1].start.x * scale,
      drawer.sections[1].start.y * scale,
      (drawer.sections[1].end.x - drawer.sections[1].start.x) * scale,
      (drawer.sections[1].end.y - drawer.sections[1].start.y) * scale
    );
    //SECTION3
    ctx.fillStyle = "rgba(25,25,45,1)";
    ctx.fillRect(
      drawer.sections[2].start.x * scale,
      drawer.sections[2].start.y * scale,
      (drawer.sections[2].end.x - drawer.sections[2].start.x) * scale,
      (drawer.sections[2].end.y - drawer.sections[2].start.y) * scale
    );
    //MAIN SECTION
    ctx.fillStyle = "rgba(25,25,25, .2)";
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
          drawObj.options
        );
      });
    });
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
    options: { rotation: number; transformed: boolean }
  ): void {
    const scaledHeight = bitMap.height * scale;
    const scaledWidth = bitMap.width * scale;
    ctx.save();
    if (options.transformed) {
      ctx.translate(drawLoc.x + scaledWidth / 2, drawLoc.y + scaledHeight / 2);
      ctx.rotate((options.rotation * Math.PI) / 180);
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
    } else {
      ctx.rotate((options.rotation * Math.PI) / 180);
      ctx.drawImage(
        bitMap,
        0,
        0,
        bitMap.width,
        bitMap.height,
        drawLoc.x,
        drawLoc.y,
        scaledWidth,
        scaledHeight
      );
    }
    ctx.restore();
  }
  return {
    render,
    reRender,
  };
};

export default renderer;
