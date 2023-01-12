import { CanvasConfig } from "./canvas";
import { ModelSprites } from "./assets/ModelSprites";
import { TextSprites, validTextSpriteVals } from "./assets/TextSprites";
import Point from "./logic/Point";
import Board from "./logic/Board";

const renderer = (
  canvasData: CanvasConfig,
  ctx: CanvasRenderingContext2D,
  modelSprites: ModelSprites,
  textSprites: TextSprites
) => {
  let _fractional = 0;
  const _drawerView = {
    start: new Point(0, 0),
    end: new Point(0, 0),
    scale: 0,
  };
  const _mainView = {
    start: new Point(0, 0),
    end: new Point(0, 0),
    scale: 0,
  };
  function render(): void {
    _clearCanvas();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "rgb(45,45,45)";
    ctx.fillRect(
      _drawerView.start.x,
      _drawerView.start.y,
      _drawerView.end.x,
      _drawerView.end.y
    );
    ctx.fillStyle = "rgb(35,35,35)";
    ctx.fillRect(
      _mainView.start.x,
      _mainView.start.y,
      _mainView.end.x,
      _mainView.end.y
    );
    if (modelSprites.loaded && textSprites.loaded) {
      // _drawDefensiveBoard();
      _drawOffensiveBoard();
      _drawTileDesignations();
    }
  }
  function _drawDefensiveBoard() {
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        _drawSprite(
          (i + j) % 2 === 0
            ? modelSprites.waterTiles[0]
            : modelSprites.waterTiles[1],
          new Point(
            _mainView.start.x + _fractional + _fractional * i,
            _mainView.start.y + _fractional + _fractional * j
          ),
          _mainView.scale,
          0
        );
      }
    }
  }
  function _drawTileDesignations() {
    const Letters: Array<validTextSpriteVals> = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
    ];
    const Numbers: Array<validTextSpriteVals> = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    for (let i = 0; i < Letters.length; i++) {
      _drawSprite(
        textSprites[Letters[i]] as ImageBitmap,
        new Point(
          _mainView.start.x + 8 * _mainView.scale,
          _fractional +
            _fractional * i +
            _mainView.start.y +
            8 * _mainView.scale
        ),
        _mainView.scale,
        0
      );
    }
    for (let i = 0; i < Numbers.length; i++) {
      _drawSprite(
        textSprites[Numbers[i]] as ImageBitmap,
        new Point(
          _fractional +
            _fractional * i +
            _mainView.start.x +
            8 * _mainView.scale,
          _mainView.start.y + 8 * _mainView.scale
        ),
        _mainView.scale,
        0
      );
    }
    //10
    _drawSprite(
      textSprites["1"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 10 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale
      ),
      _mainView.scale,
      0
    );
    _drawSprite(
      textSprites["0"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 10 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale + 8 * _mainView.scale
      ),
      _mainView.scale,
      0
    );
    //11
    _drawSprite(
      textSprites["1"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 11 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale
      ),
      _mainView.scale,
      0
    );
    _drawSprite(
      textSprites["1"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 11 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale + 8 * _mainView.scale
      ),
      _mainView.scale,
      0
    );
    //12
    _drawSprite(
      textSprites["1"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 12 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale
      ),
      _mainView.scale,
      0
    );
    _drawSprite(
      textSprites["2"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 12 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale + 8 * _mainView.scale
      ),
      _mainView.scale,
      0
    );
    //13
    _drawSprite(
      textSprites["1"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 13 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale
      ),
      _mainView.scale,
      0
    );
    _drawSprite(
      textSprites["3"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 13 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale + 8 * _mainView.scale
      ),
      _mainView.scale,
      0
    );
    //14
    _drawSprite(
      textSprites["1"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 14 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale
      ),
      _mainView.scale,
      0
    );
    _drawSprite(
      textSprites["4"] as ImageBitmap,
      new Point(
        _fractional +
          _fractional * 14 +
          _mainView.start.x +
          8 * _mainView.scale,
        _mainView.start.y * _mainView.scale + 8 * _mainView.scale
      ),
      _mainView.scale,
      0
    );
  }
  function _drawOffensiveBoard() {
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        _drawSprite(
          (i + j) % 2 === 0
            ? modelSprites.radarTiles[0]
            : modelSprites.radarTiles[1],
          new Point(
            _mainView.start.x + _fractional + _fractional * i,
            _mainView.start.y + _fractional + _fractional * j
          ),
          _mainView.scale,
          0
        );
      }
    }
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
  function updateViewSizes(): void {
    if (canvasData.orientation === "landscape") {
      _drawerView.start.x = 0;
      _drawerView.start.y = 0;
      _drawerView.end.x = canvasData.width / 4;
      _drawerView.end.y = canvasData.height;
      _mainView.start.x = canvasData.width / 4;
      _mainView.start.y = 0;
      _mainView.end.x = canvasData.width;
      _mainView.end.y = canvasData.height;
    }
    if (canvasData.orientation === "portrait") {
      _drawerView.start.x = 0;
      _drawerView.start.y = 0;
      _drawerView.end.x = canvasData.width;
      _drawerView.end.y = canvasData.height / 4;
      _mainView.start.x = 0;
      _mainView.start.y = canvasData.height / 4;
      _mainView.end.x = canvasData.width;
      _mainView.end.y = canvasData.height;
    }
    _fractional = (_mainView.end.x - _mainView.start.x) / 16;
    _mainView.scale = (_mainView.end.x - _mainView.start.x) / 256;
  }
  return {
    render,
    updateViewSizes,
  };
};

export default renderer;
