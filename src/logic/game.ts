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
  isHoveringOverClickable: boolean;
  holdingDraggableOffsets: Point;
  clicked: {
    bool: boolean;
    loc: Point;
  };
};
type GameConfig = {
  boardConfig: BoardConfig;
  updateSpeed: number;
  appearingTextSpeed: number;
};
type TextDisplayArray = Array<{ loc: Point; img: ImageBitmap }>;
type Game = {
  getGameConfig(): GameConfig;
  getCanvasConfig(): CanvasConfig;
  getScene(): Scene;
  getState(): GameState;
  areAssetsLoaded(): boolean;
  setState(gameState: GameState): void;
  updateViewSizes(canvasData: CanvasData): void;
  handleMouseDown(canvasData: DOMRect, mouseClickLocation: Point): void;
  handleMouseUp(canvasData: DOMRect, mouseClickLocation: Point): void;
  handleMouseMove(canvasData: DOMRect, mouseMoveLocation: Point): void;
  handleMouseLeave(canvasData: DOMRect, mouseMoveLocation: Point): void;
  initializeValuesAfterAssetsLoaded(): void;
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
type ClickableObject = {
  imgs: Array<{ img: ImageBitmap; zIndex: number; loc: Point; stretchedWidth?: number }>;
  start: Point;
  end: Point;
  func: () => void;
};
const zIndexes = {
  background: 0,
  tiles: 1,
  highlightTiles: 2,
  text: 3,
  appearingText: 4,
  ships: 5,
  draggableItems: 6,
  transitionTiles: 7,
  reticule: 8,
};

const game = (): Game => {
  const _gameConfig: GameConfig = {
    boardConfig: {
      xSize: 20,
      ySize: 20,
    },
    updateSpeed: 16,
    appearingTextSpeed: 0.3,
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
  const clickableObjects: Array<ClickableObject> = [];
  const draggableObjects: Array<DraggableObject> = [];
  let currentDraggedObject: DraggableObject | undefined;
  const highlightedTiles: Array<{ loc: Point; valid: boolean }> = [];
  const textToDisplay: TextDisplayArray = [];
  const appearingTextToDisplay: TextDisplayArray = [];
  let appearingTextToDisplayProgressLast: number;
  let appearingTextToDisplayProgress: number;
  let transitioning = false;
  let transitioningProgress = 0;
  let transitioningProgressLast = -1;
  let isTransitioningForward: true;
  let state: GameState = "initializing";
  let nextState: GameState;
  let playerTurn: 0 | 1 = 0;
  const mouse: MouseConfig = {
    isOnScreen: false,
    isHoveringOverClickable: false,
    isHoveringOverDraggable: false,
    isHoldingDraggable: false,
    holdingDraggableOffsets: new Point(0, 0),
    currentLoc: new Point(0, 0),
    clicked: {
      bool: false,
      loc: new Point(0, 0),
    },
  };
  const canvas: CanvasConfig = {
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
  };
  const currentScene = sceneBuilder();
  // End: Items Initialized After Asset Load

  //CONFIG AND GAMESTATE
  function getGameConfig(): GameConfig {
    return _gameConfig;
  }
  function getCanvasConfig(): CanvasConfig {
    return canvas;
  }
  function getState(): GameState {
    return state;
  }
  function setState(gameState: GameState): void {
    state = gameState;
    setupState();
  }
  function setupState(): void {
    resetAppearingText();
    switch (state) {
      case "settingPieces": {
        currentScene.flushAll();
        createButton("green", "CONFIRM", handleConfirmButton, new Point(5, 90));
        createButton("red", "RESET", handleResetButton, new Point(70, 90));
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          "Drag and Drop Your Ships Into Your Desired Layout. ~Click Confirm When Complete or reset to restart.".toUpperCase(),
          new Point(canvas.views.drawer.sections[0].start.x + 5, canvas.views.drawer.sections[0].start.y + 5),
          new Point(canvas.views.drawer.sections[0].end.x + 5, canvas.views.drawer.sections[0].end.y - 5)
        );
        addTileDesignationsToScene(currentScene);
        addFriendlyBoardToScene(currentScene, _boards[playerTurn]);
        addTextToScene(currentScene);
        addAppearingTextToScene(currentScene);
        addClickableObjectsToScene(currentScene);
      }
    }
  }
  function updateViewSizes(canvasData: CanvasData): void {
    const trueSize = canvas.trueSize;
    const { main, drawer } = canvas.views;
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
      } else if (canvas.orientation === "portrait") {
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
    canvas.scale = canvasData.width / trueSize.width;
  }
  function areAssetsLoaded(): boolean {
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
    const [section1, section2] = canvas.views.drawer.sections.slice(1, 3);
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
  function createButton(type: "green" | "red", text: string, func: () => void, loc: Point): void {
    const wordPixelLength = text.length * 8;
    const spritesBackground = type === "green" ? sprites.model.buttonTiles.green : sprites.model.buttonTiles.red;
    const imgs: Array<{ img: ImageBitmap; zIndex: number; loc: Point; stretchedWidth?: number }> = [];
    imgs.push(
      { img: spritesBackground[0], zIndex: zIndexes.background, loc: new Point(0, 0) },
      { img: spritesBackground[1], zIndex: zIndexes.background, loc: new Point(1, 0) },
      { img: spritesBackground[2], zIndex: zIndexes.background, loc: new Point(2, 0) },
      {
        img: spritesBackground[3],
        zIndex: zIndexes.background,
        loc: new Point(3, 0),
        stretchedWidth: wordPixelLength - 1,
      },
      { img: spritesBackground[4], zIndex: zIndexes.background, loc: new Point(2 + wordPixelLength, 0) },
      { img: spritesBackground[5], zIndex: zIndexes.background, loc: new Point(3 + wordPixelLength, 0) },
      { img: spritesBackground[6], zIndex: zIndexes.background, loc: new Point(4 + wordPixelLength, 0) }
    );
    text.split("").forEach((char, i) => {
      imgs.push({
        img: sprites.text[char as validTextSpriteAccessor],
        zIndex: zIndexes.text,
        loc: new Point(3 + i * 8, 4),
      });
    });
    clickableObjects.push({
      imgs,
      start: loc,
      end: new Point(loc.x + 6 + wordPixelLength, loc.y + 16),
      func,
    });
  }
  function initializeValuesAfterAssetsLoaded(): void {
    initializeDraggableObjects();
  }

  //INTERACTIVITY
  function handleConfirmButton() {
    if (!transitioning) {
      switch (state) {
        case "settingPieces": {
          if (_boards[playerTurn].getFleet().length === 5) {
            transitioning = true;
            resetTransitioning();
            console.log("COMPLETE");
          } else {
            currentScene.flushZIndex(zIndexes.appearingText);
            resetAppearingText();
            transformTextToDisplayableFormat(
              appearingTextToDisplay,
              "YOU ARE REQUIRED TO PLACE ALL SHIPS BEFORE PRESSING CONFIRM.",
              new Point(canvas.views.drawer.sections[0].start.x + 5, canvas.views.drawer.sections[0].start.y + 5),
              new Point(canvas.views.drawer.sections[0].end.x + 5, canvas.views.drawer.sections[0].end.y - 5)
            );
          }
        }
      }
    }
  }
  function handleCancelButton() {
    //!
  }
  function handleResetButton() {
    if (!transitioning) {
      switch (state) {
        case "settingPieces": {
          _boards[playerTurn].reset();
          currentScene.flushZIndex(zIndexes.ships);
          resetDraggableObjectPositions();
          resetDraggableObjectVisibility();
        }
      }
    }
  }
  function handleMouseDown(canvasData: DOMRect, mouseClickLocation: Point): void {
    const scale = canvas.scale;
    const trueX = (mouseClickLocation.x - canvasData.left) / scale;
    const trueY = (mouseClickLocation.y - canvasData.top) / scale;
    const clickedPoint = new Point(trueX, trueY);
    switch (state) {
      case "settingPieces": {
        if (mouse.isHoveringOverDraggable) {
          currentDraggedObject = isHoveringOverDraggable(clickedPoint).draggableObj;
          if (currentDraggedObject) {
            mouse.holdingDraggableOffsets = new Point(
              trueX - currentDraggedObject.start.x,
              trueY - currentDraggedObject.start.y
            );
          }
          mouse.isHoveringOverDraggable = false;
          mouse.isHoldingDraggable = true;
        } else if (mouse.isHoveringOverClickable) {
          const clickedObj = isHoveringOverClickable(clickedPoint).clickableObj;
          if (clickedObj) {
            clickedObj.func();
          }
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
    const scale = canvas.scale;
    const trueX = (mouseClickLocation.x - canvasData.left) / scale;
    const trueY = (mouseClickLocation.y - canvasData.top) / scale;
    switch (state) {
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
            const isValid = _boards[playerTurn].isValidPlacementLocation(dropPoint, new Ship(shipType, orientation));
            if (isValid) {
              _boards[playerTurn].addShip(dropPoint, new Ship(shipType, orientation));
              draggableObjects.forEach((drgObj) => {
                if (drgObj.name === shipType) {
                  drgObj.visible = false;
                }
              });
              currentScene.flushZIndex(zIndexes.tiles, zIndexes.ships);
              addFriendlyBoardToScene(currentScene, _boards[playerTurn]);
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
          mouse.isHoveringOverDraggable = true;
        } else {
          mouse.isHoveringOverDraggable = false;
        }
        mouse.isHoldingDraggable = false;
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
    const scale = canvas.scale;
    const trueX = (mouseMoveLocation.x - canvasData.left) / scale;
    const trueY = (mouseMoveLocation.y - canvasData.top) / scale;
    mouse.isOnScreen = true;
    mouse.currentLoc.x = trueX;
    mouse.currentLoc.y = trueY;
    switch (state) {
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
                const isValid = _boards[playerTurn].isValidPlacementLocation(
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
                const isValid = _boards[playerTurn].isValidPlacementLocation(
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
          const checkPoint = new Point(trueX, trueY);
          const hoverResults = isHoveringOverDraggable(checkPoint);
          const clickableResults = isHoveringOverClickable(checkPoint);
          mouse.isHoveringOverClickable = clickableResults.found;
          mouse.isHoveringOverDraggable = hoverResults.found;
        }
        break;
      }
      case "attack": {
        break;
      }
    }
  }
  function handleMouseLeave(canvasData: DOMRect, mouseMoveLocation: Point): void {
    const scale = canvas.scale;
    const trueX = (mouseMoveLocation.x - canvasData.left) / scale;
    const trueY = (mouseMoveLocation.y - canvasData.top) / scale;
    mouse.isOnScreen = false;
    mouse.currentLoc.x = trueX;
    mouse.currentLoc.y = trueY;
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
  function isHoveringOverClickable(trueMouseLoc: Point): {
    found: boolean;
    clickableObj?: ClickableObject;
  } {
    let found = false;
    let i = 0;
    let clkObj;
    while (!found && i < clickableObjects.length) {
      if (trueMouseLoc.isBetween(clickableObjects[i].start, clickableObjects[i].end)) {
        found = true;
        clkObj = clickableObjects[i];
      }
      i++;
    }
    return clkObj ? { found, clickableObj: clkObj } : { found };
  }
  function isWithinBoardTiles(trueMouseLoc: Point): boolean {
    return (
      trueMouseLoc.x >= canvas.views.main.boardPosition.start.x + 16 &&
      trueMouseLoc.x < canvas.views.main.boardPosition.end.x &&
      trueMouseLoc.y >= canvas.views.main.boardPosition.start.y + 16 &&
      trueMouseLoc.y < canvas.views.main.boardPosition.end.y
    );
  }
  //CANVAS FUNCTIONS
  function getTileAtLocation(trueMouseLoc: Point): Point {
    return new Point(
      Math.floor((trueMouseLoc.x - canvas.views.main.boardPosition.start.x - 16) / 16),
      Math.floor((trueMouseLoc.y - canvas.views.main.boardPosition.start.y - 16) / 16)
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
        if (char === "~") {
          x = start.x;
          y += 14;
        } else {
          displayArray.push({
            loc: new Point(char === "." ? x - 3 : x, y),
            img: sprites.text[char as validTextSpriteAccessor],
          });
          x += 8;
        }
      }
      x += 4;
    }
  }

  //SCENE FUNCTIONS
  function getScene(): Scene {
    switch (state) {
      case "settingPieces": {
        currentScene.flushZIndex(zIndexes.reticule, zIndexes.draggableItems, zIndexes.highlightTiles);
        addHighlightedTitlesToScene(currentScene);
        addDraggableObjectsToScene(currentScene);
        addAppearingTextToScene(currentScene);
        // Reticule
        if (mouse.isOnScreen) {
          if (mouse.isHoldingDraggable) {
            currentScene.addImgToScene(
              zIndexes.reticule,
              sprites.model.reticule[2],
              new Point(mouse.currentLoc.x - 4, mouse.currentLoc.y - 4)
            );
          } else if (mouse.isHoveringOverDraggable || mouse.isHoveringOverClickable) {
            currentScene.addImgToScene(
              zIndexes.reticule,
              sprites.model.reticule[1],
              new Point(mouse.currentLoc.x - 4, mouse.currentLoc.y)
            );
          } else {
            currentScene.addImgToScene(
              zIndexes.reticule,
              sprites.model.reticule[0],
              new Point(mouse.currentLoc.x - 8, mouse.currentLoc.y - 8)
            );
          }
        }
        break;
      }
      case "turnReview": {
        //
        break;
      }
      case "attack": {
        //
        break;
      }
      default: {
        //
      }
    }
    return currentScene.getScene();
  }
  function addTileDesignationsToScene(scene: SceneBuilder): void {
    const { main } = canvas.views;
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
    const { main } = canvas.views;
    for (let x = 0; x < _gameConfig.boardConfig.xSize; x++) {
      for (let y = 0; y < _gameConfig.boardConfig.ySize; y++) {
        const searchPoint = new Point(x, y);
        const drawPoint = new Point(x * 16 + main.boardPosition.start.x + 16, y * 16 + main.boardPosition.start.y + 16);
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
    const { main } = canvas.views;
    for (let x = 0; x < _gameConfig.boardConfig.xSize; x++) {
      for (let y = 0; y < _gameConfig.boardConfig.ySize; y++) {
        const searchPoint = new Point(x, y);
        const drawPoint = new Point(x * 16 + main.boardPosition.start.x + 16, y * 16 + main.boardPosition.start.y + 16);
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
  function addDraggableObjectsToScene(scene: SceneBuilder): void {
    const { main } = canvas.views;
    draggableObjects.forEach((obj) => {
      if (obj.visible) {
        scene.addImgToScene(zIndexes.draggableItems, obj.img, obj.start, {
          rotation: obj.rotation,
          transformed: false,
        });
      }
    });
  }
  function addHighlightedTitlesToScene(scene: SceneBuilder): void {
    highlightedTiles.forEach((tile) => {
      scene.addImgToScene(
        zIndexes.highlightTiles,
        tile.valid
          ? sprites.model.radarTiles[(tile.loc.x + tile.loc.y) % 2]
          : sprites.model.damageTiles[(tile.loc.x + tile.loc.y) % 2],
        new Point(
          16 + canvas.views.main.boardPosition.start.x + tile.loc.x * 16,
          16 + canvas.views.main.boardPosition.start.y + tile.loc.y * 16
        )
      );
    });
  }
  function addTextToScene(scene: SceneBuilder): void {
    for (const item of textToDisplay) {
      scene.addImgToScene(zIndexes.text, item.img, item.loc);
    }
  }
  function addAppearingTextToScene(scene: SceneBuilder): void {
    if (appearingTextToDisplayProgress < appearingTextToDisplay.length) {
      if (Math.floor(appearingTextToDisplayProgressLast) !== Math.floor(appearingTextToDisplayProgress)) {
        const { img, loc } = appearingTextToDisplay[Math.floor(appearingTextToDisplayProgress)];
        scene.addImgToScene(zIndexes.appearingText, img, loc);
      }
      appearingTextToDisplayProgressLast = appearingTextToDisplayProgress;
      appearingTextToDisplayProgress += _gameConfig.appearingTextSpeed;
    }
  }
  function addClickableObjectsToScene(scene: SceneBuilder): void {
    for (const obj of clickableObjects) {
      for (const img of obj.imgs) {
        if (img.stretchedWidth) {
          for (let i = 0; i < img.stretchedWidth; i++) {
            scene.addImgToScene(img.zIndex, img.img, new Point(obj.start.x + img.loc.x + i, obj.start.y + img.loc.y));
          }
        } else {
          scene.addImgToScene(img.zIndex, img.img, new Point(obj.start.x + img.loc.x, obj.start.y + img.loc.y));
        }
      }
    }
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
      const [section1, section2] = canvas.views.drawer.sections.slice(1, 3);
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
  function resetAppearingText(): void {
    appearingTextToDisplay.splice(0, appearingTextToDisplay.length);
    appearingTextToDisplayProgress = 0;
    appearingTextToDisplayProgressLast = -1;
  }
  function resetTransitioning(): void {
    transitioningProgress = 0;
    transitioningProgressLast = -1;
  }
  return {
    getGameConfig,
    getCanvasConfig,
    getState,
    setState,
    updateViewSizes,
    areAssetsLoaded,
    getScene,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseLeave,
    initializeValuesAfterAssetsLoaded,
  };
};

export { Game, GameConfig, CanvasConfig, GameState, game };
export default game;
