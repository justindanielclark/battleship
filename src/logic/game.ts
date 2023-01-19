import Board from "./data_storage/Board";
import Point from "./data_storage/Point";
import modelSprites from "../assets/ModelSprites";
import textSprites from "../assets/TextSprites";
import { scene, Scene, SceneBuilder } from "./scene";
import { ShipPart } from "./data_storage/Ship";
type GameState =
  | "initializing"
  | "settingPieces"
  | "turnReview"
  | "attack"
  | "end";
type BoardConfig = {
  xSize: number;
  ySize: number;
};
type CanvasConfig = {
  orientation: "portrait" | "landscape" | "uninitialized";
  trueSize: {
    width: number;
    height: number;
  };
  views: {
    main: {
      start: Point;
      end: Point;
      boardPosition: {
        start: Point;
        end: Point;
      };
    };
    drawer: {
      start: Point;
      end: Point;
    };
  };
  scale: number;
};
type MouseConfig = {
  isOnScreen: boolean;
  currentLoc: Point;
  clicked: {
    bool: boolean;
    loc: Point;
  };
};
type GameConfig = {
  boardConfig: BoardConfig;
  updateSpeed: number;
};
type GameInfo = {
  playerTurn: 0 | 1;
  state: GameState;
  mouse: MouseConfig;
  canvas: CanvasConfig;
};
type Game = {
  addBoard(board: Board): void;
  getGameConfig(): GameConfig;
  getGameInfo(): GameInfo;
  getScene(): Scene;
  getState(): GameState;
  isInitialized(): boolean;
  setState(gameState: GameState): void;
  updateViewSizes(canvasData: CanvasData): void;
  handleClick(canvasData: DOMRect, mouseClickLocation: Point): void;
  handleMouseMove(canvasData: DOMRect, mouseMoveLocation: Point): void;
  handleMouseLeave(canvasData: DOMRect, mouseMoveLocation: Point): void;
};

const zIndexes = {
  background: 0,
  tiles: 1,
  text: 2,
  ships: 3,
  reticule: 4,
};

const game = (): Game => {
  const _boards: Array<Board> = [];
  const _gameConfig: GameConfig = {
    boardConfig: {
      xSize: 20,
      ySize: 20,
    },
    updateSpeed: 33.33,
  };
  //View Values Set In First UpdateViewSizesCall
  const _gameInfo: GameInfo = {
    state: "initializing",
    playerTurn: 0,
    mouse: {
      isOnScreen: false,
      currentLoc: new Point(0, 0),
      clicked: {
        bool: false,
        loc: new Point(0, 0),
      },
    },
    canvas: {
      orientation: "uninitialized",
      scale: 0,
      trueSize: {
        width: 0,
        height: 0,
      },
      views: {
        main: {
          start: new Point(0, 0),
          end: new Point(0, 0),
          boardPosition: {
            start: new Point(0, 0),
            end: new Point(0, 0),
          },
        },
        drawer: {
          start: new Point(0, 0),
          end: new Point(0, 0),
        },
      },
    },
  };
  const sprites = {
    model: modelSprites(),
    text: textSprites(),
  };
  function addBoard(board: Board) {
    _boards.push(board);
  }
  function getGameConfig(): GameConfig {
    return _gameConfig;
  }
  function getGameInfo(): GameInfo {
    return _gameInfo;
  }
  function getState(): GameState {
    return _gameInfo.state;
  }
  function setState(gameState: GameState): void {
    _gameInfo.state = gameState;
  }
  function updateViewSizes(canvasData: CanvasData): void {
    const canvas = _gameInfo.canvas;
    const trueSize = _gameInfo.canvas.trueSize;
    const { main, drawer } = _gameInfo.canvas.views;
    const boardPosition = main.boardPosition;
    if (canvas.orientation !== canvasData.orientation) {
      canvas.orientation = canvasData.orientation;
      if (canvas.orientation === "landscape") {
        trueSize.width = 480;
        trueSize.height = 360;
        drawer.start.x = 0;
        drawer.start.y = 0;
        drawer.end.x = trueSize.width / 4;
        drawer.end.y = trueSize.height;
        main.start.x = trueSize.width / 4;
        main.start.y = 0;
        main.end.x = trueSize.width;
        main.end.y = trueSize.height;
        boardPosition.start.x =
          (main.end.x -
            main.start.x -
            (_gameConfig.boardConfig.xSize + 1) * 16) /
            2 +
          main.start.x;
        boardPosition.start.y =
          (main.end.y -
            main.start.y -
            (_gameConfig.boardConfig.ySize + 1) * 16) /
            2 +
          main.start.y;
        boardPosition.end.x =
          main.end.x - (boardPosition.start.x - main.start.x);
        boardPosition.end.y =
          main.end.y - (boardPosition.start.y - main.start.y);
      } else if (_gameInfo.canvas.orientation === "portrait") {
        trueSize.width = 360;
        trueSize.height = 480;
        drawer.start.x = 0;
        drawer.start.y = 0;
        drawer.end.x = trueSize.width;
        drawer.end.y = trueSize.height / 4;
        main.start.x = 0;
        main.start.y = trueSize.height / 4;
        main.end.x = trueSize.width;
        main.end.y = trueSize.height;
        boardPosition.start.x =
          (main.end.x -
            main.start.x -
            (_gameConfig.boardConfig.xSize + 1) * 16) /
            2 +
          main.start.x;
        boardPosition.start.y =
          (main.end.y -
            main.start.y -
            (_gameConfig.boardConfig.ySize + 1) * 16) /
            2 +
          main.start.y;
        boardPosition.end.x =
          main.end.x - (boardPosition.start.x - main.start.x);
        boardPosition.end.y =
          main.end.y - (boardPosition.start.y - main.start.y);
      }
    }
    _gameInfo.canvas.scale = canvasData.width / trueSize.width;
  }
  function getScene(): Scene {
    const newScene = scene();
    const main = _gameInfo.canvas.views.main;
    switch (_gameInfo.state) {
      case "turnReview": {
        // Tile Designations
        addTileDesignationsToScene(newScene);
        //Tiles
        addFriendlyBoardToScene(newScene, _boards[_gameInfo.playerTurn]);
        break;
      }
      case "attack": {
        addTileDesignationsToScene(newScene);
        addEnemyBoardToScene(newScene, _boards[(_gameInfo.playerTurn + 1) % 2]);
        break;
      }
      default: {
        //
      }
    }
    //Render Reticule
    if (_gameInfo.mouse.isOnScreen) {
      newScene.addImgToScene(
        zIndexes.reticule,
        sprites.model.reticule,
        new Point(
          _gameInfo.mouse.currentLoc.x - 8,
          _gameInfo.mouse.currentLoc.y - 8
        ),
        0
      );
    }
    return newScene.getDrawArray();

    function addTileDesignationsToScene(scene: SceneBuilder): void {
      for (let i = 0; i < _gameConfig.boardConfig.xSize; i++) {
        scene.addImgToScene(
          zIndexes.text,
          sprites.text[String.fromCharCode(i + 65) as validTextSpriteAccessor],
          new Point(
            16 * i + 4 + main.boardPosition.start.x + 16,
            main.boardPosition.start.y + 4
          ),
          0
        );
      }
      for (let i = 1; i <= _gameConfig.boardConfig.ySize; i++) {
        if (i < 10) {
          scene.addImgToScene(
            zIndexes.text,
            sprites.text[i.toString() as validTextSpriteAccessor],
            new Point(
              main.boardPosition.start.x + 4,
              main.boardPosition.start.y + i * 16 + 4
            ),
            0
          );
        } else {
          const larger = Math.floor(i / 10);
          const smaller = i % 10;
          scene.addImgToScene(
            zIndexes.text,
            sprites.text[larger.toString() as validTextSpriteAccessor],
            new Point(
              main.boardPosition.start.x,
              main.boardPosition.start.y + i * 16 + 4
            ),
            0
          );
          scene.addImgToScene(
            zIndexes.text,
            sprites.text[smaller.toString() as validTextSpriteAccessor],
            new Point(
              main.boardPosition.start.x + 8,
              main.boardPosition.start.y + i * 16 + 4
            ),
            0
          );
        }
      }
    }
    function addFriendlyBoardToScene(scene: SceneBuilder, board: Board): void {
      for (let x = 0; x < _gameConfig.boardConfig.xSize; x++) {
        for (let y = 0; y < _gameConfig.boardConfig.ySize; y++) {
          const searchPoint = new Point(x, y);
          const drawPoint = new Point(
            x * 16 + main.boardPosition.start.x + 16,
            y * 16 + main.boardPosition.start.y + 16
          );
          if (board.isOccupied(searchPoint)) {
            const part: ShipPart = board.getOccupied(searchPoint) as ShipPart;
            const partParent = part.parent;
            if (part.damaged) {
              scene.addImgToScene(
                zIndexes.tiles,
                sprites.model.damageTiles[(x + y) % 2],
                drawPoint,
                0
              );
            } else {
              scene.addImgToScene(
                zIndexes.tiles,
                sprites.model.waterTiles[(x + y) % 2],
                drawPoint,
                0
              );
            }
            scene.addImgToScene(
              zIndexes.ships,
              sprites.model[partParent.shipType][part.partNum],
              drawPoint,
              part.parent.orientation === "NS" ? 90 : 0
            );
          } else {
            scene.addImgToScene(
              zIndexes.tiles,
              sprites.model.waterTiles[(x + y) % 2],
              drawPoint,
              0
            );
          }
        }
      }
    }
    function addEnemyBoardToScene(scene: SceneBuilder, board: Board): void {
      for (let x = 0; x < _gameConfig.boardConfig.xSize; x++) {
        for (let y = 0; y < _gameConfig.boardConfig.ySize; y++) {
          const searchPoint = new Point(x, y);
          const drawPoint = new Point(
            x * 16 + main.boardPosition.start.x + 16,
            y * 16 + main.boardPosition.start.y + 16
          );
          if (board.getTargeted(searchPoint)) {
            if (board.isOccupied(searchPoint)) {
              const part: ShipPart = board.getOccupied(searchPoint) as ShipPart;
              const partParent = part.parent;
              if (!partParent.isAfloat()) {
                scene.addImgToScene(
                  zIndexes.ships,
                  sprites.model[partParent.shipType][part.partNum],
                  drawPoint,
                  partParent.orientation === "NS" ? 90 : 0
                );
              }
              scene.addImgToScene(
                zIndexes.tiles,
                sprites.model.damageTiles[(x + y) % 2],
                drawPoint,
                0
              );
            } else {
              scene.addImgToScene(
                zIndexes.tiles,
                sprites.model.waterTiles[(x + y) % 2],
                drawPoint,
                0
              );
            }
          } else {
            scene.addImgToScene(
              zIndexes.tiles,
              sprites.model.radarTiles[(x + y) % 2],
              drawPoint,
              0
            );
          }
        }
      }
    }
    function addText(scene: SceneBuilder, text: string): void {
      //
    }
  }
  function isInitialized(): boolean {
    return sprites.model.loaded && sprites.text.loaded;
  }
  function handleClick(canvasData: DOMRect, mouseClickLocation: Point): void {
    const scale = _gameInfo.canvas.scale;
    const trueX = (mouseClickLocation.x - canvasData.left) / scale;
    const trueY = (mouseClickLocation.y - canvasData.top) / scale;
    const { boardPosition } = _gameInfo.canvas.views.main;
    if (_gameInfo.state === "attack") {
      if (isWithinBoardTiles(new Point(trueX, trueY))) {
        const clickLoc = getTileClicked(new Point(trueX, trueY));
        console.log(clickLoc);
      }
    }

    function isWithinBoardTiles(loc: Point): boolean {
      return (
        loc.x >= boardPosition.start.x + 16 &&
        loc.x <= boardPosition.end.x &&
        loc.y >= boardPosition.start.y + 16 &&
        loc.y <= boardPosition.end.y
      );
    }
    function getTileClicked(loc: Point): Point {
      return new Point(
        Math.floor((loc.x - boardPosition.start.x - 16) / 16),
        Math.floor((loc.y - boardPosition.start.y - 16) / 16)
      );
    }
  }
  function handleMouseMove(
    canvasData: DOMRect,
    mouseMoveLocation: Point
  ): void {
    const scale = _gameInfo.canvas.scale;
    const trueX = (mouseMoveLocation.x - canvasData.left) / scale;
    const trueY = (mouseMoveLocation.y - canvasData.top) / scale;
    _gameInfo.mouse.isOnScreen = true;
    _gameInfo.mouse.currentLoc.x = trueX;
    _gameInfo.mouse.currentLoc.y = trueY;
  }
  function handleMouseLeave(
    canvasData: DOMRect,
    mouseMoveLocation: Point
  ): void {
    const scale = _gameInfo.canvas.scale;
    const trueX = (mouseMoveLocation.x - canvasData.left) / scale;
    const trueY = (mouseMoveLocation.y - canvasData.top) / scale;
    _gameInfo.mouse.isOnScreen = false;
    _gameInfo.mouse.currentLoc.x = trueX;
    _gameInfo.mouse.currentLoc.y = trueY;
  }
  return {
    addBoard,
    getGameConfig,
    getGameInfo,
    getState,
    setState,
    updateViewSizes,
    isInitialized,
    getScene,
    handleClick,
    handleMouseMove,
    handleMouseLeave,
  };
};

export { Game, GameConfig, GameInfo, GameState, game };
export default game;
