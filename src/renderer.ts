import Point from "./logic/Point";
import Board from "./logic/Board";
import { Game } from "./game";
import { ShipPart } from "./logic/Ship";

const TEXT_BITMAP_PIXEL_SIZE = 8;

type View = {
  start: Point;
  end: Point;
};

const renderer = (
  canvasData: CanvasConfig,
  ctx: CanvasRenderingContext2D,
  sprites: { model: ModelSpritesLoaded; text: TextSpritesLoaded },
  game: Game
) => {
  const { model, text } = sprites;
  const _gameConfig = game.getGameConfig();
  let _fractional = 0;
  let _scale = 0;
  const _drawerView: View = {
    start: new Point(0, 0),
    end: new Point(0, 0),
  };
  const _mainView: View = {
    start: new Point(0, 0),
    end: new Point(0, 0),
  };
  function render(): void {
    const { gameState, mouseInfo } = _gameConfig;
    _clearCanvas();
    ctx.imageSmoothingEnabled = false;
    // ctx.fillStyle = "rgb(45,45,45)";
    // ctx.fillRect(
    //   _drawerView.start.x,
    //   _drawerView.start.y,
    //   _drawerView.end.x,
    //   _drawerView.end.y
    // );
    // ctx.fillStyle = "rgb(35,35,35)";
    // ctx.fillRect(
    //   _mainView.start.x,
    //   _mainView.start.y,
    //   _mainView.end.x,
    //   _mainView.end.y
    // );
    switch (gameState) {
      case "player1turnstart": {
        _drawDefensiveBoard(game.getBoard(0));
        _drawTileDesignations();
        _drawText(
          "ABILITIES:~Airstrike~...5 Turns~Barrage~Radar~Battery",
          new Point(0, 0),
          _drawerView,
          _scale
        );
        break;
      }
      case "player1attack": {
        _drawOffensiveBoard(game.getBoard(1));
        _drawTileDesignations();
        break;
      }
    }
    if (gameState !== "initializing" && mouseInfo.onScreen) {
      _drawReticule(
        mouseInfo.xPos - mouseInfo.xOffset,
        mouseInfo.yPos - mouseInfo.yOffset
      );
    }
  }
  function _drawDefensiveBoard(board: Board) {
    for (let i = 0; i < _gameConfig.boardConfig.xSize; i++) {
      for (let j = 0; j < _gameConfig.boardConfig.ySize; j++) {
        if (board.isOccupied(new Point(i, j))) {
          const shipPart = board.getOccupied(new Point(i, j)) as ShipPart;
          const ship = shipPart.parent;
          const parentType = shipPart.parent.shipType;
          const partNum = shipPart.partNum;
          const damaged = shipPart.damaged;
          if (damaged) {
            _drawSprite(
              (i + j) % 2 === 0 ? model.damageTiles[0] : model.damageTiles[1],
              new Point(
                _mainView.start.x + _fractional + _fractional * i,
                _mainView.start.y + _fractional + _fractional * j
              ),
              _scale,
              0
            );
          } else {
            _drawSprite(
              (i + j) % 2 === 0 ? model.waterTiles[0] : model.waterTiles[1],
              new Point(
                _mainView.start.x + _fractional + _fractional * i,
                _mainView.start.y + _fractional + _fractional * j
              ),
              _scale,
              0
            );
          }
          _drawSprite(
            model[parentType][partNum],
            new Point(
              _mainView.start.x + _fractional + _fractional * i,
              _mainView.start.y + _fractional + _fractional * j
            ),
            _scale,
            ship.orientation === "NS" ? 90 : 0
          );
        } else {
          _drawSprite(
            (i + j) % 2 === 0 ? model.waterTiles[0] : model.waterTiles[1],
            new Point(
              _mainView.start.x + _fractional + _fractional * i,
              _mainView.start.y + _fractional + _fractional * j
            ),
            _scale,
            0
          );
        }
      }
    }
  }
  function _drawOffensiveBoard(board: Board) {
    for (let i = 0; i < _gameConfig.boardConfig.xSize; i++) {
      for (let j = 0; j < _gameConfig.boardConfig.ySize; j++) {
        const point = new Point(i, j);
        if (board.getTargeted(point)) {
          const shipPart = board.getOccupied(point) as ShipPart;
          if (board.isOccupied(point)) {
            const ship = shipPart.parent;
            const isAfloat = ship.isAfloat();
            const parentType = shipPart.parent.shipType;
            const partNum = shipPart.partNum;
            const damaged = shipPart.damaged;
            if (damaged) {
              _drawSprite(
                (i + j) % 2 === 0 ? model.damageTiles[0] : model.damageTiles[1],
                new Point(
                  _mainView.start.x + _fractional + _fractional * i,
                  _mainView.start.y + _fractional + _fractional * j
                ),
                _scale,
                0
              );
              if (!isAfloat) {
                _drawSprite(
                  model[parentType][partNum],
                  new Point(
                    _mainView.start.x + _fractional + _fractional * i,
                    _mainView.start.y + _fractional + _fractional * j
                  ),
                  _scale,
                  ship.orientation === "NS" ? 90 : 0
                );
              }
            }
          } else {
            _drawSprite(
              (i + j) % 2 === 0 ? model.waterTiles[0] : model.waterTiles[1],
              new Point(
                _mainView.start.x + _fractional + _fractional * i,
                _mainView.start.y + _fractional + _fractional * j
              ),
              _scale,
              0
            );
          }
        } else {
          _drawSprite(
            (i + j) % 2 === 0 ? model.radarTiles[0] : model.radarTiles[1],
            new Point(
              _mainView.start.x + _fractional + _fractional * i,
              _mainView.start.y + _fractional + _fractional * j
            ),
            _scale,
            0
          );
        }
      }
    }
  }
  function _drawReticule(mouseX: number, mouseY: number) {
    _drawSprite(
      model.reticule,
      new Point(
        mouseX - (model.reticule.width * _scale) / 2,
        mouseY - (model.reticule.height * _scale) / 2
      ),
      _scale,
      0
    );
  }
  function _drawTileDesignations() {
    //X Designations
    for (let i = 65; i <= _gameConfig.boardConfig.xSize + 64; i++) {
      _drawText(
        String.fromCharCode(i),
        new Point(
          _mainView.start.x +
            (TEXT_BITMAP_PIXEL_SIZE / 2) * _scale +
            _fractional * (i - 64),
          _mainView.start.y + (TEXT_BITMAP_PIXEL_SIZE / 2) * _scale
        ),
        _mainView,
        _scale
      );
    }
    //Y Designations
    for (let i = 1; i <= _gameConfig.boardConfig.ySize; i++) {
      _drawText(
        i.toString(),
        new Point(
          i / 10 < 1
            ? _mainView.start.x + (TEXT_BITMAP_PIXEL_SIZE / 2) * _scale
            : _mainView.start.x,
          _mainView.start.y +
            _fractional * i +
            (TEXT_BITMAP_PIXEL_SIZE / 2) * _scale
        ),
        _mainView,
        _scale
      );
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
  function _drawText(
    str: string,
    drawLoc: Point,
    limits: View,
    scale: number
  ): void {
    let { x, y } = drawLoc;
    const lines = str.split("~");
    lines.forEach((line) => {
      const wordsArr = line.split(" ");
      wordsArr.forEach((word) => {
        if (word.length * TEXT_BITMAP_PIXEL_SIZE * _scale + x > limits.end.x) {
          x = limits.start.x;
          y += TEXT_BITMAP_PIXEL_SIZE * scale;
        }
        const lettersArr = word.split("");
        lettersArr.forEach((letter) => {
          _drawSprite(
            text[letter as validTextSpriteAccessor],
            new Point(x, y),
            scale,
            0
          );
          x += TEXT_BITMAP_PIXEL_SIZE * scale;
        });
        x += TEXT_BITMAP_PIXEL_SIZE * scale;
      });
      x = limits.start.x;
      y += TEXT_BITMAP_PIXEL_SIZE * scale;
    });
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
    _fractional =
      (_mainView.end.x - _mainView.start.x) /
      (_gameConfig.boardConfig.xSize + 1);
    _scale =
      (_mainView.end.x - _mainView.start.x) /
      Math.pow(_gameConfig.boardConfig.xSize + 1, 2);
  }
  return {
    render,
    updateViewSizes,
  };
};

export default renderer;
