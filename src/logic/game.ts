import Board from "./data_storage/Board";
import Point from "./data_storage/Point";
import modelSprites from "../assets/ModelSprites";
import textSprites from "../assets/TextSprites";
import { sceneBuilder, Scene, SceneBuilder } from "./sceneBuilder";
import Ship, { ShipPart, ShipType } from "./data_storage/Ship";
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
type SectionView = {
  start: Point;
  end: Point;
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
      sections: SectionView[];
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
  getGameConfig(): GameConfig;
  getGameInfo(): GameInfo;
  getScene(): Scene;
  getState(): GameState;
  assetsAreLoaded(): boolean;
  setState(gameState: GameState): void;
  updateViewSizes(canvasData: CanvasData): void;
  handleClick(canvasData: DOMRect, mouseClickLocation: Point): void;
  handleMouseMove(canvasData: DOMRect, mouseMoveLocation: Point): void;
  handleMouseLeave(canvasData: DOMRect, mouseMoveLocation: Point): void;
  initializeAfterAssetLoad(): void;
};

type dragableObject = {
  img: ImageBitmap;
  start: Point;
  end: Point;
  name: ShipType;
  visible: boolean;
  rotation: number;
};

const zIndexes = {
  background: 0,
  tiles: 1,
  text: 2,
  ships: 3,
  reticule: 4,
};

const game = (): Game => {
  const _gameConfig: GameConfig = {
    boardConfig: {
      xSize: 15,
      ySize: 15,
    },
    updateSpeed: 16,
  };
  const sprites = {
    model: modelSprites(),
    text: textSprites(),
  };
  const _boards: Array<Board> = [
    new Board(_gameConfig.boardConfig.xSize, _gameConfig.boardConfig.ySize),
    new Board(_gameConfig.boardConfig.xSize, _gameConfig.boardConfig.ySize),
  ];
  _boards[0].addShip(new Point(0, 0), new Ship("carrier", "NS"));
  _boards[0].addShip(new Point(1, 0), new Ship("carrier", "EW"));
  // Start: Items Initialized After Asset Load
  const dragableObjects: Array<dragableObject> = [];
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
          sections: [
            { start: new Point(0, 0), end: new Point(0, 0) },
            { start: new Point(0, 0), end: new Point(0, 0) },
            { start: new Point(0, 0), end: new Point(0, 0) },
          ],
        },
      },
    },
  };
  // End: Items Initialized After Asset Load
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
    const [section1, section2, section3] = drawer.sections;
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
        section1.start = drawer.start;
        section1.end = new Point(drawer.end.x, drawer.end.y / 3);
        section2.start = new Point(drawer.start.x, drawer.end.y / 3);
        section2.end = new Point(drawer.end.x, (drawer.end.y * 2) / 3);
        section3.start = new Point(drawer.start.x, (drawer.end.y / 3) * 2);
        section3.end = new Point(drawer.end.x, drawer.end.y);
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
        section1.start = drawer.start;
        section1.end = new Point(drawer.end.x / 3, drawer.end.y);
        section2.start = new Point(drawer.end.x / 3, drawer.start.y);
        section2.end = new Point((drawer.end.x * 2) / 3, drawer.end.y);
        section3.start = new Point((drawer.end.x * 2) / 3, drawer.start.y);
        section3.end = new Point(drawer.end.x, drawer.end.y);
      }
    }
    _gameInfo.canvas.scale = canvasData.width / trueSize.width;
  }
  function getScene(): Scene {
    const newScene = sceneBuilder();
    const main = _gameInfo.canvas.views.main;
    switch (_gameInfo.state) {
      case "settingPieces": {
        // Tile Designations
        addTileDesignationsToScene(newScene);
        // Tiles
        addFriendlyBoardToScene(newScene, _boards[_gameInfo.playerTurn]);
        // Draggable Objects
        addDraggableObjects(newScene);
        break;
      }
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
        {
          rotation: 0,
          transformed: true,
        }
      );
    }
    return newScene.getScene();

    function addTileDesignationsToScene(scene: SceneBuilder): void {
      for (let i = 0; i < _gameConfig.boardConfig.xSize; i++) {
        scene.addImgToScene(
          zIndexes.text,
          sprites.text[String.fromCharCode(i + 65) as validTextSpriteAccessor],
          new Point(
            16 * i + 4 + main.boardPosition.start.x + 16,
            main.boardPosition.start.y + 4
          )
        );
      }
      for (let i = 1; i <= _gameConfig.boardConfig.ySize; i++) {
        if (i < 10) {
          scene.addImgToScene(
            zIndexes.text,
            sprites.text[i.toString() as validTextSpriteAccessor],
            new Point(
              main.boardPosition.start.x,
              main.boardPosition.start.y + i * 16 + 4
            )
          );
        } else {
          const larger = Math.floor(i / 10);
          const smaller = i % 10;
          scene.addImgToScene(
            zIndexes.text,
            sprites.text[larger.toString() as validTextSpriteAccessor],
            new Point(
              main.boardPosition.start.x - 4,
              main.boardPosition.start.y + i * 16 + 4
            )
          );
          scene.addImgToScene(
            zIndexes.text,
            sprites.text[smaller.toString() as validTextSpriteAccessor],
            new Point(
              main.boardPosition.start.x + 4,
              main.boardPosition.start.y + i * 16 + 4
            )
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
                drawPoint
              );
            } else {
              scene.addImgToScene(
                zIndexes.tiles,
                sprites.model.waterTiles[(x + y) % 2],
                drawPoint
              );
            }
            scene.addImgToScene(
              zIndexes.ships,
              sprites.model[partParent.shipType][part.partNum],
              new Point(drawPoint.x, drawPoint.y),
              {
                rotation: partParent.orientation === "NS" ? 90 : 0,
                transformed: partParent.orientation === "NS" ? true : false,
              }
            );
          } else {
            scene.addImgToScene(
              zIndexes.tiles,
              sprites.model.waterTiles[(x + y) % 2],
              drawPoint
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
                  {
                    rotation: partParent.orientation === "NS" ? 90 : 0,
                    transformed: true,
                  }
                );
              }
              scene.addImgToScene(
                zIndexes.tiles,
                sprites.model.damageTiles[(x + y) % 2],
                drawPoint
              );
            } else {
              scene.addImgToScene(
                zIndexes.tiles,
                sprites.model.waterTiles[(x + y) % 2],
                drawPoint
              );
            }
          } else {
            scene.addImgToScene(
              zIndexes.tiles,
              sprites.model.radarTiles[(x + y) % 2],
              drawPoint
            );
          }
        }
      }
    }
    function addDraggableObjects(scene: SceneBuilder): void {
      dragableObjects.forEach((obj) => {
        if (obj.visible) {
          scene.addImgToScene(zIndexes.ships, obj.img, obj.start, {
            rotation: obj.rotation,
            transformed: obj.rotation === 90 ? false : true,
          });
        }
      });
    }
    function addText(scene: SceneBuilder, text: string, loc: Point): void {
      //!
    }
    function addAppearingText(
      scene: SceneBuilder,
      text: string,
      loc: Point
    ): void {
      //!
    }
  }
  function assetsAreLoaded(): boolean {
    return sprites.model.loaded && sprites.text.loaded;
  }
  function initializeAfterAssetLoad(): void {
    dragableObjects.push(
      {
        img: sprites.model.carrier.at(-1) as ImageBitmap,
        name: "carrier",
        start: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 20,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 20
        ),
        end: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 100,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 36
        ),
        visible: true,
        rotation: 0,
      },
      {
        img: sprites.model.battleship.at(-1) as ImageBitmap,
        name: "battleship",
        start: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 20,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 36
        ),
        end: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 84,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 52
        ),
        visible: true,
        rotation: 0,
      },
      {
        img: sprites.model.cruiser.at(-1) as ImageBitmap,
        name: "cruiser",
        start: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 20,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 52
        ),
        end: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 68,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 68
        ),
        visible: true,
        rotation: 0,
      },
      {
        img: sprites.model.submarine.at(-1) as ImageBitmap,
        name: "submarine",
        start: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 20,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 68
        ),
        end: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 68,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 84
        ),
        visible: true,
        rotation: 0,
      },
      {
        img: sprites.model.destroyer.at(-1) as ImageBitmap,
        name: "destroyer",
        start: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 20,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 84
        ),
        end: new Point(
          _gameInfo.canvas.views.drawer.sections[1].start.x + 52,
          _gameInfo.canvas.views.drawer.sections[1].start.y + 100
        ),
        visible: true,
        rotation: 0,
      },

      {
        img: sprites.model.carrier.at(-1) as ImageBitmap,
        name: "carrier",
        start: new Point(
          //!
          _gameInfo.canvas.views.drawer.sections[2].start.x,
          _gameInfo.canvas.views.drawer.sections[2].start.y
        ),
        end: new Point(
          _gameInfo.canvas.views.drawer.sections[2].start.x,
          _gameInfo.canvas.views.drawer.sections[2].start.y
        ),
        visible: true,
        rotation: 90,
      }
      // {
      //   img: sprites.model.battleship.at(-1) as ImageBitmap,
      //   name: "battleship",
      //   start: new Point(
      //     _gameInfo.canvas.views.drawer.sections[2].start.x + 36,
      //     _gameInfo.canvas.views.drawer.sections[2].start.y + 20
      //   ),
      //   end: new Point(
      //     _gameInfo.canvas.views.drawer.sections[2].start.x + 52,
      //     _gameInfo.canvas.views.drawer.sections[2].start.y + 84
      //   ),
      //   visible: true,
      //   rotation: 90,
      // },
      // {
      //   img: sprites.model.cruiser.at(-1) as ImageBitmap,
      //   name: "cruiser",
      //   start: new Point(
      //     _gameInfo.canvas.views.drawer.sections[2].start.x + 52,
      //     _gameInfo.canvas.views.drawer.sections[2].start.y + 20
      //   ),
      //   end: new Point(
      //     _gameInfo.canvas.views.drawer.sections[2].start.x + 68,
      //     _gameInfo.canvas.views.drawer.sections[2].start.y + 68
      //   ),
      //   visible: true,
      //   rotation: 90,
      // },
      // {
      //   img: sprites.model.submarine.at(-1) as ImageBitmap,
      //   name: "submarine",
      //   start: new Point(
      //     _gameInfo.canvas.views.drawer.sections[2].start.x + 68,
      //     _gameInfo.canvas.views.drawer.sections[2].start.y + 20
      //   ),
      //   end: new Point(
      //     _gameInfo.canvas.views.drawer.sections[2].start.x + 84,
      //     _gameInfo.canvas.views.drawer.sections[2].start.y + 68
      //   ),
      //   visible: true,
      //   rotation: 90,
      // },
      // {
      //   img: sprites.model.destroyer.at(-1) as ImageBitmap,
      //   name: "destroyer",
      //   start: new Point(
      //     _gameInfo.canvas.views.drawer.sections[2].start.x + 84,
      //     _gameInfo.canvas.views.drawer.sections[2].start.y + 20
      //   ),
      //   end: new Point(
      //     _gameInfo.canvas.views.drawer.sections[2].start.x + 100,
      //     _gameInfo.canvas.views.drawer.sections[2].start.y + 52
      //   ),
      //   visible: true,
      //   rotation: 90,
      // }
    );
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
    getGameConfig,
    getGameInfo,
    getState,
    setState,
    updateViewSizes,
    assetsAreLoaded,
    getScene,
    handleClick,
    handleMouseMove,
    handleMouseLeave,
    initializeAfterAssetLoad,
  };
};

export { Game, GameConfig, GameInfo, GameState, game };
export default game;
