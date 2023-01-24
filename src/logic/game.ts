import Board from "./data_storage/Board";
import Point from "./data_storage/Point";
import modelSprites from "../assets/ModelSprites";
import textSprites from "../assets/TextSprites";
import { sceneBuilder, Scene, SceneBuilder } from "./sceneBuilder";
import Ship, { Orientation, ShipPart, ShipType } from "./data_storage/Ship";
type GameState = "initializing" | "settingPieces" | "turnReview" | "attack" | "end";
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
  isHoveringOverDraggable: boolean;
  isHoldingDraggable: boolean;
  holdingDraggableOffsets: Point;
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
type TextDisplayArray = Array<{ loc: Point; img: ImageBitmap }>;
type Game = {
  getGameConfig(): GameConfig;
  getGameInfo(): GameInfo;
  getScene(): Scene;
  getState(): GameState;
  assetsAreLoaded(): boolean;
  setState(gameState: GameState): void;
  updateViewSizes(canvasData: CanvasData): void;
  handleMouseDown(canvasData: DOMRect, mouseClickLocation: Point): void;
  handleMouseUp(canvasData: DOMRect, mouseClickLocation: Point): void;
  handleMouseMove(canvasData: DOMRect, mouseMoveLocation: Point): void;
  handleMouseLeave(canvasData: DOMRect, mouseMoveLocation: Point): void;
  initializeDraggableObjects(): void;
};
type DraggableObject = {
  img: ImageBitmap;
  start: Point;
  end: Point;
  defaultStart: Point;
  defaultEnd: Point;
  name: ShipType;
  visible: boolean;
  rotation: number;
};
type ClickableButton = {
  imgs: Array<ImageBitmap>;
  start: Point;
  end: Point;
  text: string;
};

const zIndexes = {
  background: 0,
  tiles: 1,
  highlightTiles: 2,
  text: 3,
  ships: 4,
  reticule: 5,
};

const game = (): Game => {
  const _gameConfig: GameConfig = {
    boardConfig: {
      xSize: 20,
      ySize: 20,
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
  // Start: Items Initialized After Asset Load
  const draggableObjects: Array<DraggableObject> = [];
  let currentDraggedObject: DraggableObject | undefined;
  const highlightedTiles: Array<{ loc: Point; valid: boolean }> = [];
  const textToDisplay: TextDisplayArray = [];
  let appearingText: { loc: Point; str: string };
  const appearingTextToDisplay: TextDisplayArray = [];
  let appearingTextToDisplayProgress: number;
  const _gameInfo: GameInfo = {
    state: "initializing",
    playerTurn: 0,
    mouse: {
      isOnScreen: false,
      isHoveringOverDraggable: false,
      isHoldingDraggable: false,
      holdingDraggableOffsets: new Point(0, 0),
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
    setupState();
  }
  function setupState(): void {
    switch (_gameInfo.state) {
      case "settingPieces": {
        transformTextToDisplayableFormat(
          textToDisplay,
          "Drag and Drop Your Ships Into Your Desired Layout",
          new Point(
            _gameInfo.canvas.views.drawer.sections[0].start.x + 15,
            _gameInfo.canvas.views.drawer.sections[0].start.y + 15
          ),
          new Point(
            _gameInfo.canvas.views.drawer.sections[0].end.x - 10,
            _gameInfo.canvas.views.drawer.sections[0].end.y - 10
          )
        );
      }
    }
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
          (main.end.x - main.start.x - (_gameConfig.boardConfig.xSize + 1) * 16) / 2 + main.start.x;
        boardPosition.start.y =
          (main.end.y - main.start.y - (_gameConfig.boardConfig.ySize + 1) * 16) / 2 + main.start.y;
        boardPosition.end.x = main.end.x - (boardPosition.start.x - main.start.x);
        boardPosition.end.y = main.end.y - (boardPosition.start.y - main.start.y);
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
          (main.end.x - main.start.x - (_gameConfig.boardConfig.xSize + 1) * 16) / 2 + main.start.x;
        boardPosition.start.y =
          (main.end.y - main.start.y - (_gameConfig.boardConfig.ySize + 1) * 16) / 2 + main.start.y;
        boardPosition.end.x = main.end.x - (boardPosition.start.x - main.start.x);
        boardPosition.end.y = main.end.y - (boardPosition.start.y - main.start.y);
        section1.start = drawer.start;
        section1.end = new Point(drawer.end.x / 3, drawer.end.y);
        section2.start = new Point(drawer.end.x / 3, drawer.start.y);
        section2.end = new Point((drawer.end.x * 2) / 3, drawer.end.y);
        section3.start = new Point((drawer.end.x * 2) / 3, drawer.start.y);
        section3.end = new Point(drawer.end.x, drawer.end.y);
      }
      resetDraggableObjectPositions();
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
        // Highlighted Tiles
        addHighlightedTitles(newScene);
        // Draggable Objects
        addDraggableObjects(newScene);
        // Appearing Text
        addText(newScene);
        // Reticule
        if (_gameInfo.mouse.isOnScreen) {
          if (_gameInfo.mouse.isHoldingDraggable) {
            newScene.addImgToScene(
              zIndexes.reticule,
              sprites.model.reticule[2],
              new Point(_gameInfo.mouse.currentLoc.x - 4, _gameInfo.mouse.currentLoc.y - 4)
            );
          } else if (_gameInfo.mouse.isHoveringOverDraggable) {
            newScene.addImgToScene(
              zIndexes.reticule,
              sprites.model.reticule[1],
              new Point(_gameInfo.mouse.currentLoc.x - 4, _gameInfo.mouse.currentLoc.y)
            );
          } else {
            newScene.addImgToScene(
              zIndexes.reticule,
              sprites.model.reticule[0],
              new Point(_gameInfo.mouse.currentLoc.x - 8, _gameInfo.mouse.currentLoc.y - 8)
            );
          }
        }
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
        if (_gameInfo.mouse.isOnScreen) {
          newScene.addImgToScene(
            zIndexes.reticule,
            sprites.model.reticule[0],
            new Point(_gameInfo.mouse.currentLoc.x - 8, _gameInfo.mouse.currentLoc.y - 8)
          );
        }
        break;
      }
      default: {
        //
      }
    }
    return newScene.getScene();

    function addTileDesignationsToScene(scene: SceneBuilder): void {
      for (let i = 0; i < _gameConfig.boardConfig.xSize; i++) {
        scene.addImgToScene(
          zIndexes.text,
          sprites.text[String.fromCharCode(i + 65) as validTextSpriteAccessor],
          new Point(16 * i + 4 + main.boardPosition.start.x + 16, main.boardPosition.start.y + 4)
        );
      }
      for (let i = 1; i <= _gameConfig.boardConfig.ySize; i++) {
        if (i < 10) {
          scene.addImgToScene(
            zIndexes.text,
            sprites.text[i.toString() as validTextSpriteAccessor],
            new Point(main.boardPosition.start.x, main.boardPosition.start.y + i * 16 + 4)
          );
        } else {
          const larger = Math.floor(i / 10);
          const smaller = i % 10;
          scene.addImgToScene(
            zIndexes.text,
            sprites.text[larger.toString() as validTextSpriteAccessor],
            new Point(main.boardPosition.start.x - 4, main.boardPosition.start.y + i * 16 + 4)
          );
          scene.addImgToScene(
            zIndexes.text,
            sprites.text[smaller.toString() as validTextSpriteAccessor],
            new Point(main.boardPosition.start.x + 4, main.boardPosition.start.y + i * 16 + 4)
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
              scene.addImgToScene(zIndexes.tiles, sprites.model.damageTiles[(x + y) % 2], drawPoint);
            } else {
              scene.addImgToScene(zIndexes.tiles, sprites.model.waterTiles[(x + y) % 2], drawPoint);
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
            scene.addImgToScene(zIndexes.tiles, sprites.model.waterTiles[(x + y) % 2], drawPoint);
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
                scene.addImgToScene(zIndexes.ships, sprites.model[partParent.shipType][part.partNum], drawPoint, {
                  rotation: partParent.orientation === "NS" ? 90 : 0,
                  transformed: true,
                });
              }
              scene.addImgToScene(zIndexes.tiles, sprites.model.damageTiles[(x + y) % 2], drawPoint);
            } else {
              scene.addImgToScene(zIndexes.tiles, sprites.model.waterTiles[(x + y) % 2], drawPoint);
            }
          } else {
            scene.addImgToScene(zIndexes.tiles, sprites.model.radarTiles[(x + y) % 2], drawPoint);
          }
        }
      }
    }
    function addDraggableObjects(scene: SceneBuilder): void {
      draggableObjects.forEach((obj) => {
        if (obj.visible) {
          scene.addImgToScene(zIndexes.ships, obj.img, obj.start, {
            rotation: obj.rotation,
            transformed: false,
          });
        }
      });
    }
    function addHighlightedTitles(scene: SceneBuilder): void {
      highlightedTiles.forEach((tile) => {
        scene.addImgToScene(
          zIndexes.highlightTiles,
          tile.valid
            ? sprites.model.radarTiles[(tile.loc.x + tile.loc.y) % 2]
            : sprites.model.damageTiles[(tile.loc.x + tile.loc.y) % 2],
          new Point(
            16 + _gameInfo.canvas.views.main.boardPosition.start.x + tile.loc.x * 16,
            16 + _gameInfo.canvas.views.main.boardPosition.start.y + tile.loc.y * 16
          )
        );
      });
    }
    function addText(scene: SceneBuilder): void {
      for (const item of textToDisplay) {
        scene.addImgToScene(zIndexes.text, item.img, item.loc);
      }
    }
  }
  function assetsAreLoaded(): boolean {
    return sprites.model.loaded && sprites.text.loaded;
  }
  function initializeDraggableObjects(): void {
    const ships: Array<{ name: ShipType; length: number }> = [
      { name: "carrier", length: 5 },
      { name: "battleship", length: 4 },
      { name: "cruiser", length: 3 },
      { name: "submarine", length: 3 },
      { name: "destroyer", length: 2 },
    ];
    const [section1, section2] = _gameInfo.canvas.views.drawer.sections.slice(1, 3);
    ships.forEach((ship, i) => {
      //HORIZONTAL
      draggableObjects.push({
        img: sprites.model[ship.name].at(-1) as ImageBitmap,
        name: ship.name,
        start: new Point(section1.start.x + 20, section1.start.y + 20 + i * 16),
        end: new Point(section1.start.x + 20 + 16 * ship.length, section1.start.y + 20 + 16 + i * 16),
        defaultStart: new Point(section1.start.x + 20, section1.start.y + 20 + i * 16),
        defaultEnd: new Point(section1.start.x + 20 + 16 * ship.length, section1.start.y + 20 + 16 + i * 16),
        visible: true,
        rotation: 0,
      });
      //VERTICAL
      draggableObjects.push({
        img: sprites.model[ship.name].at(-1) as ImageBitmap,
        name: ship.name,
        start: new Point(section2.start.x + 20 + i * 16, section2.start.y + 20),
        end: new Point(section2.start.x + 20 + 16 + i * 16, section2.start.y + 20 + 16 * ship.length),
        defaultStart: new Point(section2.start.x + 20 + i * 16, section2.start.y + 20),
        defaultEnd: new Point(section2.start.x + 20 + 16 + i * 16, section2.start.y + 20 + 16 * ship.length),
        visible: true,
        rotation: 90,
      });
    });
  }
  function resetDraggableObjectPositions(): void {
    if (draggableObjects.length > 0) {
      const ships: Array<{ name: ShipType; length: number }> = [
        { name: "carrier", length: 5 },
        { name: "battleship", length: 4 },
        { name: "cruiser", length: 3 },
        { name: "submarine", length: 3 },
        { name: "destroyer", length: 2 },
      ];
      const [section1, section2] = _gameInfo.canvas.views.drawer.sections.slice(1, 3);
      ships.forEach((ship, i) => {
        const drgObj1 = draggableObjects[i * 2];
        const drgObj2 = draggableObjects[i * 2 + 1];
        drgObj1.start = new Point(section1.start.x + 20, section1.start.y + 20 + i * 16);
        drgObj1.end = new Point(section1.start.x + 20 + 16 * ship.length, section1.start.y + 20 + 16 + i * 16);
        drgObj1.defaultStart = new Point(section1.start.x + 20, section1.start.y + 20 + i * 16);
        drgObj1.defaultEnd = new Point(section1.start.x + 20 + 16 * ship.length, section1.start.y + 20 + 16 + i * 16);
        drgObj2.start = new Point(section2.start.x + 20 + i * 16, section2.start.y + 20);
        drgObj2.end = new Point(section2.start.x + 20 + 16 + i * 16, section2.start.y + 20 + 16 * ship.length);
        drgObj2.defaultStart = new Point(section2.start.x + 20 + i * 16, section2.start.y + 20);
        drgObj2.defaultEnd = new Point(section2.start.x + 20 + 16 + i * 16, section2.start.y + 20 + 16 * ship.length);
      });
    }
  }
  function resetDraggableObjectVisibility(): void {
    draggableObjects.forEach((drgObj) => {
      drgObj.visible = true;
    });
  }
  function handleMouseDown(canvasData: DOMRect, mouseClickLocation: Point): void {
    const scale = _gameInfo.canvas.scale;
    const trueX = (mouseClickLocation.x - canvasData.left) / scale;
    const trueY = (mouseClickLocation.y - canvasData.top) / scale;
    switch (_gameInfo.state) {
      case "settingPieces": {
        if (_gameInfo.mouse.isHoveringOverDraggable) {
          currentDraggedObject = isHoveringOverDraggable(new Point(trueX, trueY)).draggableObj;
          if (currentDraggedObject) {
            _gameInfo.mouse.holdingDraggableOffsets = new Point(
              trueX - currentDraggedObject.start.x,
              trueY - currentDraggedObject.start.y
            );
          }
          _gameInfo.mouse.isHoveringOverDraggable = false;
          _gameInfo.mouse.isHoldingDraggable = true;
        }
        break;
      }
      case "attack": {
        if (isWithinBoardTiles(new Point(trueX, trueY))) {
          const clickLoc = getTileAtLocation(new Point(trueX, trueY));
          //todo
        }
        break;
      }
    }
  }
  function handleMouseUp(canvasData: DOMRect, mouseClickLocation: Point): void {
    const { mouse } = _gameInfo;
    const scale = _gameInfo.canvas.scale;
    const trueX = (mouseClickLocation.x - canvasData.left) / scale;
    const trueY = (mouseClickLocation.y - canvasData.top) / scale;
    switch (_gameInfo.state) {
      case "settingPieces": {
        if (mouse.isHoldingDraggable && currentDraggedObject) {
          let orientation: Orientation;
          if (currentDraggedObject.rotation === 0) {
            currentDraggedObject.start.x = trueX - mouse.holdingDraggableOffsets.x;
            currentDraggedObject.end.x = currentDraggedObject.start.x + currentDraggedObject.img.width;
            currentDraggedObject.start.y = trueY - mouse.holdingDraggableOffsets.y;
            currentDraggedObject.end.y = currentDraggedObject.start.y + currentDraggedObject.img.height;
            orientation = "EW";
          } else {
            currentDraggedObject.start.x = trueX - mouse.holdingDraggableOffsets.x;
            currentDraggedObject.end.x = currentDraggedObject.start.x + currentDraggedObject.img.height;
            currentDraggedObject.start.y = trueY - mouse.holdingDraggableOffsets.y;
            currentDraggedObject.end.y = currentDraggedObject.start.y + currentDraggedObject.img.width;
            orientation = "NS";
          }
          const startCheckLoc = new Point(currentDraggedObject.start.x + 8, currentDraggedObject.start.y + 8);
          const endCheckLoc = new Point(currentDraggedObject.end.x - 8, currentDraggedObject.end.y - 8);
          const startWithinBounds = isWithinBoardTiles(startCheckLoc);
          const endWithinBounds = isWithinBoardTiles(endCheckLoc);
          if (startWithinBounds && endWithinBounds) {
            const shipType = currentDraggedObject.name;
            const dropPoint = highlightedTiles[0].loc;
            const isValid = _boards[_gameInfo.playerTurn].isValidPlacementLocation(
              dropPoint,
              new Ship(shipType, orientation)
            );
            if (isValid) {
              _boards[_gameInfo.playerTurn].addShip(dropPoint, new Ship(shipType, orientation));
              draggableObjects.forEach((drgObj) => {
                if (drgObj.name === shipType) {
                  drgObj.visible = false;
                }
              });
            } else {
              currentDraggedObject.start.x = currentDraggedObject.defaultStart.x;
              currentDraggedObject.start.y = currentDraggedObject.defaultStart.y;
              currentDraggedObject.end.x = currentDraggedObject.defaultEnd.x;
              currentDraggedObject.end.y = currentDraggedObject.defaultEnd.y;
            }
          } else {
            currentDraggedObject.start.x = currentDraggedObject.defaultStart.x;
            currentDraggedObject.start.y = currentDraggedObject.defaultStart.y;
            currentDraggedObject.end.x = currentDraggedObject.defaultEnd.x;
            currentDraggedObject.end.y = currentDraggedObject.defaultEnd.y;
          }
        }
        if (isHoveringOverDraggable(new Point(trueX, trueY)).found) {
          _gameInfo.mouse.isHoveringOverDraggable = true;
        } else {
          _gameInfo.mouse.isHoveringOverDraggable = false;
        }
        _gameInfo.mouse.isHoldingDraggable = false;
        highlightedTiles.splice(0, highlightedTiles.length);
        break;
      }
      case "attack": {
        if (isWithinBoardTiles(new Point(trueX, trueY))) {
          const clickLoc = getTileAtLocation(new Point(trueX, trueY));
          // todo
        }
        break;
      }
    }
  }
  function handleMouseMove(canvasData: DOMRect, mouseMoveLocation: Point): void {
    const scale = _gameInfo.canvas.scale;
    const trueX = (mouseMoveLocation.x - canvasData.left) / scale;
    const trueY = (mouseMoveLocation.y - canvasData.top) / scale;
    const { mouse } = _gameInfo;
    mouse.isOnScreen = true;
    mouse.currentLoc.x = trueX;
    mouse.currentLoc.y = trueY;
    switch (_gameInfo.state) {
      case "settingPieces": {
        if (mouse.isHoldingDraggable) {
          if (currentDraggedObject) {
            if (currentDraggedObject.rotation === 0) {
              currentDraggedObject.start.x = trueX - mouse.holdingDraggableOffsets.x;
              currentDraggedObject.end.x = currentDraggedObject.start.x + currentDraggedObject.img.width;
              currentDraggedObject.start.y = trueY - mouse.holdingDraggableOffsets.y;
              currentDraggedObject.end.y = currentDraggedObject.start.y + currentDraggedObject.img.height;
            } else {
              currentDraggedObject.start.x = trueX - mouse.holdingDraggableOffsets.x;
              currentDraggedObject.end.x = currentDraggedObject.start.x + currentDraggedObject.img.height;
              currentDraggedObject.start.y = trueY - mouse.holdingDraggableOffsets.y;
              currentDraggedObject.end.y = currentDraggedObject.start.y + currentDraggedObject.img.width;
            }
            const startCheckLoc = new Point(currentDraggedObject.start.x + 8, currentDraggedObject.start.y + 8);
            const endCheckLoc = new Point(currentDraggedObject.end.x - 8, currentDraggedObject.end.y - 8);
            const startWithinBounds = isWithinBoardTiles(startCheckLoc);
            const endWithinBounds = isWithinBoardTiles(endCheckLoc);
            const startTile = startWithinBounds ? getTileAtLocation(startCheckLoc) : undefined;
            const endTile = endWithinBounds ? getTileAtLocation(endCheckLoc) : undefined;
            highlightedTiles.length = 0;
            if (startTile && endTile) {
              if (currentDraggedObject.rotation === 0) {
                const isValid = _boards[_gameInfo.playerTurn].isValidPlacementLocation(
                  startTile,
                  new Ship(currentDraggedObject.name, "EW")
                );
                for (let i = startTile.x; i <= endTile.x; i++) {
                  highlightedTiles.push({
                    loc: new Point(i, startTile.y),
                    valid: isValid,
                  });
                }
              } else {
                const isValid = _boards[_gameInfo.playerTurn].isValidPlacementLocation(
                  startTile,
                  new Ship(currentDraggedObject.name, "NS")
                );
                for (let i = startTile.y; i <= endTile.y; i++) {
                  highlightedTiles.push({
                    loc: new Point(startTile.x, i),
                    valid: isValid,
                  });
                }
              }
            } else if (startTile) {
              if (currentDraggedObject.rotation === 0) {
                for (let i = startTile.x; i < _gameConfig.boardConfig.xSize; i++) {
                  highlightedTiles.push({
                    loc: new Point(i, startTile.y),
                    valid: false,
                  });
                }
              } else {
                for (let i = startTile.y; i < _gameConfig.boardConfig.ySize; i++) {
                  highlightedTiles.push({
                    loc: new Point(startTile.x, i),
                    valid: false,
                  });
                }
              }
            } else if (endTile) {
              if (currentDraggedObject.rotation === 0) {
                for (let i = endTile.x; i >= 0; i--) {
                  highlightedTiles.push({
                    loc: new Point(i, endTile.y),
                    valid: false,
                  });
                }
              } else {
                for (let i = endTile.y; i >= 0; i--) {
                  highlightedTiles.push({
                    loc: new Point(endTile.x, i),
                    valid: false,
                  });
                }
              }
            }
          }
        } else {
          const results = isHoveringOverDraggable(new Point(trueX, trueY));
          if (results.found) {
            mouse.isHoveringOverDraggable = true;
          } else {
            mouse.isHoveringOverDraggable = false;
          }
        }
        break;
      }
      case "attack": {
        break;
      }
    }
  }
  function handleMouseLeave(canvasData: DOMRect, mouseMoveLocation: Point): void {
    const scale = _gameInfo.canvas.scale;
    const trueX = (mouseMoveLocation.x - canvasData.left) / scale;
    const trueY = (mouseMoveLocation.y - canvasData.top) / scale;
    _gameInfo.mouse.isOnScreen = false;
    _gameInfo.mouse.currentLoc.x = trueX;
    _gameInfo.mouse.currentLoc.y = trueY;
  }
  function isHoveringOverDraggable(trueMouseLoc: Point): {
    found: boolean;
    draggableObj?: DraggableObject;
  } {
    let found = false;
    let i = 0;
    let drgObj;
    while (!found && i < draggableObjects.length) {
      if (trueMouseLoc.isBetween(draggableObjects[i].start, draggableObjects[i].end)) {
        found = true;
        drgObj = draggableObjects[i];
      }
      i++;
    }
    return drgObj && drgObj.visible ? { found: true, draggableObj: drgObj } : { found: false };
  }
  function isWithinBoardTiles(trueMouseLoc: Point): boolean {
    return (
      trueMouseLoc.x >= _gameInfo.canvas.views.main.boardPosition.start.x + 16 &&
      trueMouseLoc.x < _gameInfo.canvas.views.main.boardPosition.end.x &&
      trueMouseLoc.y >= _gameInfo.canvas.views.main.boardPosition.start.y + 16 &&
      trueMouseLoc.y < _gameInfo.canvas.views.main.boardPosition.end.y
    );
  }
  function getTileAtLocation(trueMouseLoc: Point): Point {
    return new Point(
      Math.floor((trueMouseLoc.x - _gameInfo.canvas.views.main.boardPosition.start.x - 16) / 16),
      Math.floor((trueMouseLoc.y - _gameInfo.canvas.views.main.boardPosition.start.y - 16) / 16)
    );
  }
  function transformTextToDisplayableFormat(displayArray: TextDisplayArray, text: string, start: Point, end: Point) {
    const words = text.split(" ");
    let x = start.x;
    let y = start.y;
    for (const word of words) {
      if (x + word.length * 9 > end.x) {
        y += 9;
        x = start.x;
      }
      const wordArr = word.split("");
      for (const char of wordArr) {
        displayArray.push({
          loc: new Point(x, y),
          img: sprites.text[char as validTextSpriteAccessor],
        });
        x += 8;
      }
      x += 4;
    }
  }
  return {
    getGameConfig,
    getGameInfo,
    getState,
    setState,
    updateViewSizes,
    assetsAreLoaded,
    getScene,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseLeave,
    initializeDraggableObjects,
  };
};

export { Game, GameConfig, GameInfo, GameState, game };
export default game;
