import Point from "./logic/Point";
import Board from "./logic/Board";
import { Game } from "./game";
import { ShipPart } from "./logic/Ship";

type View = {
  start: Point;
  end: Point;
  scale: number;
};

const renderer = (
  canvasData: CanvasConfig,
  ctx: CanvasRenderingContext2D,
  sprites: { model: ModelSpritesLoaded; text: TextSpritesLoaded },
  game: Game
) => {
  const { model, text } = sprites;
  let _fractional = 0;
  const _drawerView: View = {
    start: new Point(0, 0),
    end: new Point(0, 0),
    scale: 0,
  };
  const _mainView: View = {
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
    switch (game.getState()) {
      case "player1SettingPieces": {
        _drawDefensiveBoard(game.getBoard(0));

        break;
      }
      case "player2SettingPieces": {
        break;
      }
    }
  }
  function _drawDefensiveBoard(board: Board) {
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
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
              _mainView.scale,
              0
            );
          } else {
            _drawSprite(
              (i + j) % 2 === 0 ? model.waterTiles[0] : model.waterTiles[1],
              new Point(
                _mainView.start.x + _fractional + _fractional * i,
                _mainView.start.y + _fractional + _fractional * j
              ),
              _mainView.scale,
              0
            );
          }
          _drawSprite(
            model[parentType][partNum],
            new Point(
              _mainView.start.x + _fractional + _fractional * i,
              _mainView.start.y + _fractional + _fractional * j
            ),
            _mainView.scale,
            ship.orientation === "NS" ? 90 : 0
          );
        } else {
          _drawSprite(
            (i + j) % 2 === 0 ? model.waterTiles[0] : model.waterTiles[1],
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
  }
  function _drawTileDesignations() {
    //todo
  }
  function _drawOffensiveBoard() {
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        _drawSprite(
          (i + j) % 2 === 0 ? model.radarTiles[0] : model.radarTiles[1],
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
    // ctx.rotate((-angle * Math.PI) / 180);
    // ctx.translate(-drawLoc.x - scaledWidth / 2, -drawLoc.y - scaledHeight / 2);
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
