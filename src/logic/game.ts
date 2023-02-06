import Board from "./data_storage/Board";
import Point from "./data_storage/Point";
import modelSprites from "../assets/ModelSprites";
import textSprites from "../assets/TextSprites";
import { sceneBuilder, Scene, SceneBuilder } from "./display/sceneBuilder";
import Ship, { Orientation, ShipPart, ShipType } from "./data_storage/Ship";
type AttackTypes = "salvo" | "airstrike" | "radar" | "mines";
type AttacksWithCooldowns = Extract<AttackTypes, "airstrike" | "mines">;
type Cooldown = {
  [key in AttacksWithCooldowns]: number;
};
type Turn = {
  attackType: AttackTypes;
  targetedTiles: Array<Point>;
  hitTiles: Array<Point>;
};
type GameState =
  | "initializing"
  | "titleScreen"
  | "chooseOpponent"
  | "settingPieces"
  | "playerSwapScreen"
  | "defensiveTurnReview"
  | "offensiveTurnReview"
  | "attack"
  | "attack-salvo"
  | "attack-airstrike"
  | "attack-radar"
  | "attack-mines"
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
type MouseInfo = {
  isOnScreen: boolean;
  currentLoc: Point;
  isHoveringOverDraggable: boolean;
  isHoveringOverAttackButton: boolean;
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
  transitionSpeed: number;
  updateSpeed: number;
  appearingTextSpeed: number;
  radarLimit: number;
};
type TextDisplayArray = Array<{
  img: ImageBitmap;
  root: { start: Point; end: Point };
  offset: { x: number; y: number };
}>;
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
  update(): void;
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
  clickFunc: () => void;
  hoverFunc: (() => void) | undefined;
  clickable: boolean;
};
const zIndexes = {
  background: 0,
  tiles: 1,
  highlightTiles: 2,
  altHighlightTiles: 3,
  button: 4,
  text: 5,
  appearingText: 6,
  ships: 7,
  draggableItems: 8,
  transitionTiles: 9,
  reticule: 10,
};

const game = (): Game => {
  const gameConfig: GameConfig = {
    boardConfig: {
      xSize: 18,
      ySize: 18,
    },
    updateSpeed: 16,
    appearingTextSpeed: 1, // Must Be Less Than 1
    transitionSpeed: 0.85, // Must Be Less Than 1
    radarLimit: 10, // Num Tiles Radar Can Check Per Turn
  };
  const sprites = {
    model: modelSprites(),
    text: textSprites(),
  };
  const boards: Array<Board> = [
    new Board(gameConfig.boardConfig.xSize, gameConfig.boardConfig.ySize),
    new Board(gameConfig.boardConfig.xSize, gameConfig.boardConfig.ySize),
  ];
  boards[0].addShip(new Point(5, 5), new Ship("carrier", "NS"));
  boards[0].addShip(new Point(0, 1), new Ship("battleship", "EW"));
  boards[0].addShip(new Point(0, 2), new Ship("cruiser", "EW"));
  boards[0].addShip(new Point(0, 3), new Ship("submarine", "EW"));
  boards[0].addShip(new Point(0, 4), new Ship("destroyer", "EW"));
  // boards[0].target(new Point(0, 0));
  // boards[0].target(new Point(1, 0));
  // boards[0].target(new Point(2, 0));
  // boards[0].target(new Point(3, 0));
  // boards[0].target(new Point(4, 0));
  // boards[0].target(new Point(0, 3));
  // boards[0].target(new Point(1, 3));
  // boards[0].target(new Point(2, 3));
  // boards[0].target(new Point(0, 1));
  // boards[0].target(new Point(1, 1));
  // boards[0].target(new Point(2, 1));
  // boards[0].target(new Point(3, 1));
  // boards[0].target(new Point(0, 2));
  // boards[0].target(new Point(1, 2));
  // boards[0].target(new Point(2, 2));

  boards[1].addShip(new Point(0, 0), new Ship("carrier", "NS"));
  boards[1].addShip(new Point(1, 0), new Ship("battleship", "NS"));
  boards[1].addShip(new Point(2, 0), new Ship("cruiser", "NS"));
  boards[1].addShip(new Point(3, 0), new Ship("submarine", "NS"));
  boards[1].addShip(new Point(4, 0), new Ship("destroyer", "NS"));
  // boards[1].target(new Point(12, 12));
  // boards[1].target(new Point(13, 13));
  // boards[1].target(new Point(12, 13));
  // boards[1].target(new Point(12, 14));
  // boards[1].target(new Point(12, 15));
  // boards[1].target(new Point(12, 16));
  // boards[1].target(new Point(0, 0));
  // boards[1].target(new Point(0, 1));
  // boards[1].target(new Point(1, 1));

  //! DECLARATIONS(Start)
  // GAMESTATE
  let state: GameState = "initializing";
  let nextState: GameState;
  let playerTurn = 0;
  let currentTurn = 0;
  const currentScene = sceneBuilder();
  const Turns: [Array<Turn>, Array<Turn>] = [
    [
      // {
      //   attackType: "airstrike",
      //   hitTiles: [new Point(0, 0)],
      //   targetedTiles: [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(4, 0)],
      // },
    ],
    [
      // {
      //   attackType: "salvo",
      //   hitTiles: [],
      //   targetedTiles: [new Point(0, 8), new Point(1, 8), new Point(2, 8), new Point(3, 8), new Point(4, 8)],
      // },
    ],
  ];
  const Cooldowns: Array<Cooldown> = [
    { airstrike: 0, mines: 0 },
    { airstrike: 0, mines: 0 },
  ];
  const CooldownLimits: Cooldown = {
    airstrike: 5,
    mines: 4,
  };
  // MOUSE AND CANVS
  const mouse: MouseInfo = {
    isOnScreen: false,
    isHoveringOverAttackButton: false,
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
  // RENDERED OBJECTS
  const clickableObjects: Array<ClickableObject> = [];
  const draggableObjects: Array<DraggableObject> = [];
  let currentDraggedObject: DraggableObject | undefined;
  // TILES
  const validTilesForPlacement: Array<{ loc: Point; valid: boolean }> = [];
  const highlightTiles: Array<Point> = [];
  const altHighlightTiles: Array<Point> = [];
  // TEXT
  const textToDisplay: TextDisplayArray = [];
  const appearingTextToDisplay: TextDisplayArray = [];
  let appearingTextToDisplayProgressLast = -1;
  let appearingTextToDisplayProgress = 0;
  //TRANSITION DATA
  let transitioning = false;
  let transitioningProgress = 0;
  let isTransitioningForward = true;
  const transitionLimits = {
    upper: 6.99,
    lower: 0,
  };

  //! UPDATE CYCLE
  //GAMESTATE SETUP
  function setupAfterStateChange(): void {
    resetAppearingText();
    resetText();
    if (clickableObjects.length > 0) {
      emptyClickableObjects();
    }
    if (draggableObjects.length > 0) {
      emptyDraggableObjects();
    }
    if (highlightTiles.length > 0) {
      emptyHighlightTiles();
    }
    if (altHighlightTiles.length > 0) {
      emptyAltHighlightTiles();
    }
    currentScene.flushAll();
    switch (state) {
      case "settingPieces": {
        initializeDraggableObjects();
        createButton("green", "Confirm", new Point(5, 90), handleConfirmButton);
        createButton("red", "Reset", new Point(70, 90), handleResetButton);
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          "Drop Your Ships Into Your Desired Layout. ~Click Confirm When Complete.",
          canvas.views.drawer.sections[0]
        );
        addTileDesignationsToScene(currentScene);
        addFriendlyBoardToScene(currentScene, boards[playerTurn]);
        addAppearingTextToScene(currentScene);
        addClickableObjectsToScene(currentScene);
        break;
      }
      case "playerSwapScreen": {
        resetText();
        readyTextForPlayerSwapScene();
        break;
      }
      case "defensiveTurnReview": {
        readyTextForDefensiveTurnReview();
        createButton("green", "PROCEED", new Point(35, 90), handleConfirmButton);
        addClickableObjectsToScene(currentScene);
        addTileDesignationsToScene(currentScene);
        addFriendlyBoardToScene(currentScene, boards[playerTurn]);
        addAppearingTextToScene(currentScene);
        break;
      }
      case "offensiveTurnReview": {
        readyTextForOffensiveTurnReview();
        createButton("green", "PROCEED", new Point(35, 90), handleConfirmButton);
        addClickableObjectsToScene(currentScene);
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        addAppearingTextToScene(currentScene);
        break;
      }
      case "attack": {
        readyTextForAttack();
        readyTextForFleetStatus();
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        createAbilityButtons();
        addTextToScene(currentScene);
        addClickableObjectsToScene(currentScene);
        break;
      }
      case "attack-salvo": {
        const textMessage =
          boards[playerTurn].getNumAliveShips() === 1
            ? "Salvo: Pick A Tile To Attack"
            : `Salvo: Pick Up To ${boards[playerTurn].getNumAliveShips()} Tiles To Attack:`;
        createButton("green", "Confirm", new Point(5, 60), handleConfirmButton);
        createButton("red", "Reset", new Point(5, 80), handleResetButton);
        createButton("red", "Cancel", new Point(5, 100), handleCancelButton);
        transformTextToDisplayableFormat(appearingTextToDisplay, textMessage, canvas.views.drawer.sections[0]);
        readyTextForFleetStatus();
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        addTextToScene(currentScene);
        addClickableObjectsToScene(currentScene);
        break;
      }
      case "attack-radar": {
        const textMessage = "Radar: Pick Up To 10 Tiles To Investigate";
        createButton("green", "Confirm", new Point(5, 60), handleConfirmButton);
        createButton("red", "Reset", new Point(5, 80), handleResetButton);
        createButton("red", "Cancel", new Point(5, 100), handleCancelButton);
        transformTextToDisplayableFormat(appearingTextToDisplay, textMessage, canvas.views.drawer.sections[0]);
        readyTextForFleetStatus();
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        addTextToScene(currentScene);
        addClickableObjectsToScene(currentScene);
        break;
      }
      case "attack-mines": {
        const textMessage = "Mines: Pick A Tile to Center A Large Blast";
        createButton("green", "Confirm", new Point(5, 60), handleConfirmButton);
        createButton("red", "Reset", new Point(5, 80), handleResetButton);
        createButton("red", "Cancel", new Point(5, 100), handleCancelButton);
        transformTextToDisplayableFormat(appearingTextToDisplay, textMessage, canvas.views.drawer.sections[0]);
        readyTextForFleetStatus();
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        addTextToScene(currentScene);
        addAppearingTextToScene(currentScene);
        addClickableObjectsToScene(currentScene);
        break;
      }
      case "attack-airstrike": {
        const textMessage = "Airstrike: Pick a Strip of 7 Tiles Aligned with Your Carrier To Bomb!";
        createButton("green", "Confirm", new Point(5, 60), handleConfirmButton);
        createButton("red", "Reset", new Point(5, 80), handleResetButton);
        createButton("red", "Cancel", new Point(5, 100), handleCancelButton);
        transformTextToDisplayableFormat(appearingTextToDisplay, textMessage, canvas.views.drawer.sections[0]);
        readyTextForFleetStatus();
        readyHighlightTilesForAttackAirstrike();
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        addTextToScene(currentScene);
        addAppearingTextToScene(currentScene);
        addClickableObjectsToScene(currentScene);
        addHighlightTilesToScene(currentScene);
        break;
      }
    }
  }
  //EVERY FRAME
  function update() {
    if (transitioning) {
      handleTransition();
    }
    switch (state) {
      case "settingPieces": {
        currentScene.flushZIndex(zIndexes.reticule, zIndexes.draggableItems, zIndexes.highlightTiles);
        addValidForPlacementTilesToScreen(currentScene);
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
      case "playerSwapScreen": {
        currentScene.flushZIndex(zIndexes.reticule);
        drawMouse();
        break;
      }
      case "defensiveTurnReview": {
        currentScene.flushZIndex(zIndexes.reticule);
        addAppearingTextToScene(currentScene);
        drawMouse();
        break;
      }
      case "offensiveTurnReview": {
        currentScene.flushZIndex(zIndexes.reticule);
        addAppearingTextToScene(currentScene);
        drawMouse();
        break;
      }
      case "attack": {
        currentScene.flushZIndex(zIndexes.reticule);
        addAppearingTextToScene(currentScene);
        drawMouse();
        break;
      }
      case "attack-salvo": {
        currentScene.flushZIndex(zIndexes.reticule, zIndexes.highlightTiles);
        addAppearingTextToScene(currentScene);
        addHighlightTilesToScene(currentScene);
        drawMouse();
        break;
      }
      case "attack-radar": {
        currentScene.flushZIndex(zIndexes.reticule, zIndexes.highlightTiles);
        addAppearingTextToScene(currentScene);
        addHighlightTilesToScene(currentScene);
        drawMouse();
        break;
      }
      case "attack-mines": {
        currentScene.flushZIndex(zIndexes.reticule, zIndexes.highlightTiles);
        addAppearingTextToScene(currentScene);
        addHighlightTilesToScene(currentScene);
        drawMouse();
        break;
      }
      case "attack-airstrike": {
        currentScene.flushZIndex(zIndexes.reticule, zIndexes.highlightTiles, zIndexes.altHighlightTiles);
        addAppearingTextToScene(currentScene);
        addHighlightTilesToScene(currentScene);
        addAltHighlightTilesToScene(currentScene);
        drawMouse();
        break;
      }
    }
    function drawMouse() {
      if (mouse.isOnScreen) {
        if (mouse.isHoveringOverClickable) {
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
    }
  }
  //GAMESTATE TAKEDOWN
  function handleTransition(): void {
    currentScene.flushZIndex(zIndexes.transitionTiles);
    transitioningProgress += isTransitioningForward ? gameConfig.transitionSpeed : -gameConfig.transitionSpeed;
    const flooredTransitioningProgress = Math.floor(transitioningProgress);
    //Transition Ends
    if (
      flooredTransitioningProgress >= transitionLimits.upper ||
      flooredTransitioningProgress < transitionLimits.lower
    ) {
      if (isTransitioningForward) {
        transitioningProgress = transitionLimits.upper;
        switch (state) {
          case "settingPieces": {
            if (playerTurn === 0) {
              playerTurn = 1;
              setState("playerSwapScreen");
              nextState = "settingPieces";
            } else {
              playerTurn = 0;
              setState("playerSwapScreen");
              nextState = "offensiveTurnReview";
            }
            break;
          }
          case "playerSwapScreen": {
            setState(nextState);
            break;
          }
          case "defensiveTurnReview": {
            setState("offensiveTurnReview");
            break;
          }
          case "attack-salvo": {
            playerTurn = (playerTurn + 1) % 2;
            if (playerTurn === 0) {
              hitTargetedTiles();
              currentTurn++;
            }
            nextState = currentTurn === 0 ? "offensiveTurnReview" : "defensiveTurnReview";
            setState("playerSwapScreen");
            break;
          }
          case "attack-mines": {
            playerTurn = (playerTurn + 1) % 2;
            if (playerTurn === 0) {
              hitTargetedTiles();
              currentTurn++;
            }
            nextState = currentTurn === 0 ? "offensiveTurnReview" : "defensiveTurnReview";
            setState("playerSwapScreen");
            break;
          }
          case "attack-radar": {
            playerTurn = (playerTurn + 1) % 2;
            if (playerTurn === 0) {
              hitTargetedTiles();
              currentTurn++;
            }
            nextState = currentTurn === 0 ? "offensiveTurnReview" : "defensiveTurnReview";
            setState("playerSwapScreen");
            break;
          }
          case "attack-airstrike": {
            playerTurn = (playerTurn + 1) % 2;
            if (playerTurn === 0) {
              hitTargetedTiles();
              currentTurn++;
            }
            nextState = currentTurn === 0 ? "offensiveTurnReview" : "defensiveTurnReview";
            setState("playerSwapScreen");
            break;
          }
        }
        addTransitionTilesToScene(currentScene);
      } else {
        transitioningProgress = transitionLimits.lower;
        transitioning = false;
      }
      isTransitioningForward = !isTransitioningForward;
    } else {
      addTransitionTilesToScene(currentScene);
    }
  }
  //!CONFIG AND GAMESTATE
  function getGameConfig(): GameConfig {
    return gameConfig;
  }
  function getCanvasConfig(): CanvasConfig {
    return canvas;
  }
  function getState(): GameState {
    return state;
  }
  function setState(gameState: GameState): void {
    state = gameState;
    setupAfterStateChange();
  }
  function areAssetsLoaded(): boolean {
    return sprites.model.loaded && sprites.text.loaded;
  }
  //!INTERACTIVITY
  function handleConfirmButton() {
    if (!transitioning) {
      switch (state) {
        case "settingPieces": {
          if (boards[playerTurn].getFleet().length === 5) {
            transitioning = true;
          } else {
            currentScene.flushZIndex(zIndexes.appearingText);
            resetAppearingText();
            transformTextToDisplayableFormat(
              appearingTextToDisplay,
              "You Are Required To Place All Ships Before Pressing Confirm.",
              canvas.views.drawer.sections[0]
            );
          }
          break;
        }
        case "defensiveTurnReview": {
          transitioning = true;
          mouse.isHoveringOverClickable = false;
          break;
        }
        case "offensiveTurnReview": {
          setState("attack");
          mouse.isHoveringOverClickable = false;
          break;
        }
        case "attack-salvo": {
          if (altHighlightTiles.length === 0) {
            currentScene.flushZIndex(zIndexes.appearingText);
            resetAppearingText();
            transformTextToDisplayableFormat(
              appearingTextToDisplay,
              "You Must Target At Least 1 Tile In Your Attack",
              canvas.views.drawer.sections[0]
            );
          } else {
            transitioning = true;
            const hitTiles = altHighlightTiles.filter((tile) => {
              return boards[getEnemyTurn()].isOccupied(tile);
            });
            const targeted = altHighlightTiles.splice(0, altHighlightTiles.length);
            Turns[playerTurn].push({ attackType: "salvo", hitTiles, targetedTiles: targeted });
          }
          break;
        }
        case "attack-radar": {
          if (altHighlightTiles.length === 0) {
            currentScene.flushZIndex(zIndexes.appearingText);
            resetAppearingText();
            transformTextToDisplayableFormat(
              appearingTextToDisplay,
              "You Must Target At Least 1 Tile In Your Attack",
              canvas.views.drawer.sections[0]
            );
          } else {
            transitioning = true;
            const hitTiles = altHighlightTiles.filter((tile) => {
              return boards[getEnemyTurn()].isOccupied(tile);
            });
            const targetedTiles = [...altHighlightTiles];
            Turns[playerTurn].push({ attackType: "radar", hitTiles, targetedTiles });
          }
          break;
        }
        case "attack-mines": {
          if (altHighlightTiles.length === 0) {
            currentScene.flushZIndex(zIndexes.appearingText);
            resetAppearingText();
            transformTextToDisplayableFormat(
              appearingTextToDisplay,
              "You Must Target At Least 1 Tile In Your Attack",
              canvas.views.drawer.sections[0]
            );
          } else {
            transitioning = true;
            const hitTiles = altHighlightTiles.filter((tile) => {
              return boards[getEnemyTurn()].isOccupied(tile);
            });
            const targetedTiles = [...altHighlightTiles];
            Turns[playerTurn].push({ attackType: "mines", hitTiles, targetedTiles });
          }
          break;
        }
        case "attack-airstrike": {
          //todo
          break;
        }
      }
    }
  }
  function handleCancelButton() {
    if (!transitioning) {
      switch (state) {
        case "attack-salvo": {
          emptyAltHighlightTiles();
          setState("attack");
          break;
        }
        case "attack-radar": {
          emptyAltHighlightTiles();
          setState("attack");
          break;
        }
        case "attack-mines": {
          emptyAltHighlightTiles();
          setState("attack");
          break;
        }
        case "attack-airstrike": {
          emptyHighlightTiles();
          setState("attack");
          break;
        }
      }
    }
  }
  function handleResetButton() {
    if (!transitioning) {
      switch (state) {
        case "settingPieces": {
          boards[playerTurn].reset();
          currentScene.flushZIndex(zIndexes.ships);
          resetDraggableObjectPositions();
          resetDraggableObjectVisibility();
          break;
        }
        case "attack-salvo": {
          currentScene.flushZIndex(zIndexes.altHighlightTiles);
          emptyAltHighlightTiles();
          break;
        }
        case "attack-radar": {
          currentScene.flushZIndex(zIndexes.altHighlightTiles);
          emptyAltHighlightTiles();
          break;
        }
        case "attack-mines": {
          currentScene.flushZIndex(zIndexes.altHighlightTiles);
          emptyAltHighlightTiles();
          break;
        }
        case "attack-airstrike": {
          currentScene.flushZIndex(zIndexes.altHighlightTiles);
          emptyAltHighlightTiles();
          break;
        }
      }
    }
  }
  function handleMouseDown(canvasData: DOMRect, mouseClickLocation: Point): void {
    const scale = canvas.scale;
    const trueX = (mouseClickLocation.x - canvasData.left) / scale;
    const trueY = (mouseClickLocation.y - canvasData.top) / scale;
    const clickedPoint = new Point(trueX, trueY);
    if (!transitioning) {
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
          } else {
            ifHoveringOverClickableExecuteClickableFunc();
          }
          break;
        }
        case "playerSwapScreen": {
          if (!transitioning) {
            transitioning = true;
          }
          break;
        }
        case "defensiveTurnReview": {
          ifHoveringOverClickableExecuteClickableFunc();
          break;
        }
        case "offensiveTurnReview": {
          ifHoveringOverClickableExecuteClickableFunc();
          break;
        }
        case "attack": {
          ifHoveringOverClickableExecuteClickableFunc();
          break;
        }
        case "attack-salvo": {
          if (isWithinBoardTiles(clickedPoint)) {
            const boardLoc = getTileAtLocation(clickedPoint);
            const hasAlreadyBeenTargeted = boards[getEnemyTurn()].getTargeted(boardLoc);
            if (altHighlightTiles.length < boards[playerTurn].getNumAliveShips() && !hasAlreadyBeenTargeted) {
              const isInAltHighlightTiles = altHighlightTiles.reduce((acc, cur) => {
                if (acc === true) {
                  return true;
                } else {
                  return cur.equals(boardLoc);
                }
              }, false);
              if (!isInAltHighlightTiles) {
                altHighlightTiles.push(getTileAtLocation(new Point(trueX, trueY)));
                currentScene.flushZIndex(zIndexes.altHighlightTiles);
                addAltHighlightTilesToScene(currentScene);
              }
            }
          } else {
            ifHoveringOverClickableExecuteClickableFunc();
          }
          break;
        }
        case "attack-radar": {
          if (isWithinBoardTiles(clickedPoint)) {
            const boardLoc = getTileAtLocation(clickedPoint);
            const hasAlreadyBeenTargeted = boards[getEnemyTurn()].getTargeted(boardLoc);
            if (altHighlightTiles.length < gameConfig.radarLimit && !hasAlreadyBeenTargeted) {
              const isInAltHighlightTiles = altHighlightTiles.reduce((acc, cur) => {
                if (acc === true) {
                  return true;
                } else {
                  return cur.equals(boardLoc);
                }
              }, false);
              if (!isInAltHighlightTiles) {
                altHighlightTiles.push(getTileAtLocation(new Point(trueX, trueY)));
                currentScene.flushZIndex(zIndexes.altHighlightTiles);
                addAltHighlightTilesToScene(currentScene);
              }
            }
          } else {
            ifHoveringOverClickableExecuteClickableFunc();
          }
          break;
        }
        case "attack-mines": {
          if (isWithinBoardTiles(clickedPoint)) {
            if (highlightTiles.length > 0 && altHighlightTiles.length === 0) {
              altHighlightTiles.push(...highlightTiles);
              currentScene.flushZIndex(zIndexes.altHighlightTiles);
              addAltHighlightTilesToScene(currentScene);
            }
          } else {
            ifHoveringOverClickableExecuteClickableFunc();
          }
          break;
        }
        case "attack-airstrike": {
          if (isWithinBoardTiles(clickedPoint)) {
            if (highlightTiles.length > 0 && altHighlightTiles.length === 0) {
              //!
            }
          } else {
            ifHoveringOverClickableExecuteClickableFunc();
          }
          break;
        }
      }
    }
    function ifHoveringOverClickableExecuteClickableFunc() {
      if (mouse.isHoveringOverClickable) {
        const clickedObj = isHoveringOverClickable(clickedPoint).clickableObj;
        if (clickedObj) {
          clickedObj.clickFunc();
        }
      }
    }
  }
  function handleMouseUp(canvasData: DOMRect, mouseClickLocation: Point): void {
    switch (state) {
      case "settingPieces": {
        const scale = canvas.scale;
        const trueX = (mouseClickLocation.x - canvasData.left) / scale;
        const trueY = (mouseClickLocation.y - canvasData.top) / scale;
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
            const dropPoint = validTilesForPlacement[0].loc;
            const isValid = boards[playerTurn].isValidPlacementLocation(dropPoint, new Ship(shipType, orientation));
            if (isValid) {
              boards[playerTurn].addShip(dropPoint, new Ship(shipType, orientation));
              draggableObjects.forEach((drgObj) => {
                if (drgObj.name === shipType) {
                  drgObj.visible = false;
                }
              });
              currentScene.flushZIndex(zIndexes.tiles, zIndexes.ships);
              addFriendlyBoardToScene(currentScene, boards[playerTurn]);
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
        validTilesForPlacement.splice(0, validTilesForPlacement.length);
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
            validTilesForPlacement.length = 0;
            if (startTile && endTile) {
              if (currentDraggedObject.rotation === 0) {
                const isValid = boards[playerTurn].isValidPlacementLocation(
                  startTile,
                  new Ship(currentDraggedObject.name, "EW")
                );
                for (let i = startTile.x; i <= endTile.x; i++) {
                  validTilesForPlacement.push({
                    loc: new Point(i, startTile.y),
                    valid: isValid,
                  });
                }
              } else {
                const isValid = boards[playerTurn].isValidPlacementLocation(
                  startTile,
                  new Ship(currentDraggedObject.name, "NS")
                );
                for (let i = startTile.y; i <= endTile.y; i++) {
                  validTilesForPlacement.push({
                    loc: new Point(startTile.x, i),
                    valid: isValid,
                  });
                }
              }
            } else if (startTile) {
              if (currentDraggedObject.rotation === 0) {
                for (let i = startTile.x; i < gameConfig.boardConfig.xSize; i++) {
                  validTilesForPlacement.push({
                    loc: new Point(i, startTile.y),
                    valid: false,
                  });
                }
              } else {
                for (let i = startTile.y; i < gameConfig.boardConfig.ySize; i++) {
                  validTilesForPlacement.push({
                    loc: new Point(startTile.x, i),
                    valid: false,
                  });
                }
              }
            } else if (endTile) {
              if (currentDraggedObject.rotation === 0) {
                for (let i = endTile.x; i >= 0; i--) {
                  validTilesForPlacement.push({
                    loc: new Point(i, endTile.y),
                    valid: false,
                  });
                }
              } else {
                for (let i = endTile.y; i >= 0; i--) {
                  validTilesForPlacement.push({
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
      case "defensiveTurnReview": {
        const checkPoint = new Point(trueX, trueY);
        const clickableResults = isHoveringOverClickable(checkPoint);
        mouse.isHoveringOverClickable = clickableResults.found;
        break;
      }
      case "offensiveTurnReview": {
        const checkPoint = new Point(trueX, trueY);
        const clickableResults = isHoveringOverClickable(checkPoint);
        mouse.isHoveringOverClickable = clickableResults.found;
        break;
      }
      case "attack": {
        const checkPoint = new Point(trueX, trueY);
        const clickableResults = isHoveringOverClickable(checkPoint);
        if (clickableResults.found && clickableResults.clickableObj && clickableResults.clickableObj.clickable) {
          mouse.isHoveringOverClickable = true;
          if (clickableResults.clickableObj.hoverFunc && !mouse.isHoveringOverAttackButton) {
            mouse.isHoveringOverAttackButton = true;
            clickableResults.clickableObj.hoverFunc();
          }
        } else {
          mouse.isHoveringOverClickable = false;
          if (mouse.isHoveringOverAttackButton) {
            mouse.isHoveringOverAttackButton = false;
            resetAppearingText();
            currentScene.flushZIndex(zIndexes.appearingText);
          }
        }
        break;
      }
      case "attack-salvo": {
        const checkPoint = new Point(trueX, trueY);
        mouse.isHoveringOverClickable = isHoveringOverClickable(checkPoint).found;
        highlightUntargetedTile(checkPoint);
        break;
      }
      case "attack-radar": {
        const checkPoint = new Point(trueX, trueY);
        mouse.isHoveringOverClickable = isHoveringOverClickable(checkPoint).found;
        highlightUntargetedTile(checkPoint);
        break;
      }
      case "attack-mines": {
        const checkPoint = new Point(trueX, trueY);
        mouse.isHoveringOverClickable = isHoveringOverClickable(checkPoint).found;
        highlightUntargetedTilesForBlast(checkPoint);
        break;
      }
      case "attack-airstrike": {
        const checkPoint = new Point(trueX, trueY);
        mouse.isHoveringOverClickable = isHoveringOverClickable(checkPoint).found;
        if (isWithinBoardTiles(checkPoint)) {
          const tile = getTileAtLocation(checkPoint);
          const { x, y } = tile;
          const { xSize, ySize } = gameConfig.boardConfig;
          if (isWithinCarrierRange(tile)) {
            const carrier = boards[playerTurn].getFleet().reduce((acc, cur) => {
              if (cur.ship.shipType === "carrier") {
                return cur;
              } else {
                return acc;
              }
            });
            const consideredTiles = [];
            const orientation = carrier.ship.orientation;
            if (orientation === "NS") {
              consideredTiles.push(
                new Point(x, y - 3 < 0 ? ySize + (y - 3) : y - 3),
                new Point(x, y - 2 < 0 ? ySize + (y - 2) : y - 2),
                new Point(x, y - 1 < 0 ? ySize + (y - 1) : y - 1),
                new Point(x, y),
                new Point(x, y + 1 >= ySize ? ySize - (y + 1) : y + 1),
                new Point(x, y + 2 >= ySize ? ySize - (y + 2) : y + 2),
                new Point(x, y + 3 >= ySize ? ySize - (y + 3) : y + 3)
              );
            } else {
              consideredTiles.push(
                new Point(x - 3 < 0 ? xSize + (x - 3) : x - 3, y),
                new Point(x - 2 < 0 ? xSize + (x - 2) : x - 2, y),
                new Point(x - 1 < 0 ? xSize + (x - 1) : x - 1, y),
                new Point(x, y),
                new Point(x + 1 >= xSize ? xSize - (x + 1) : x + 1, y),
                new Point(x + 2 >= xSize ? xSize - (x + 2) : x + 2, y),
                new Point(x + 3 >= xSize ? xSize - (x + 3) : x + 3, y)
              );
            }
            consideredTiles.forEach((tile) => {
              altHighlightTiles.push(tile.deepCopy());
            });
          }
        }
      }
    }
    function highlightUntargetedTile(checkPoint: Point) {
      emptyHighlightTiles();
      if (isWithinBoardTiles(checkPoint)) {
        const tile = getTileAtLocation(checkPoint);
        if (!boards[getEnemyTurn()].getTargeted(tile)) {
          highlightTiles.push(tile);
        }
      }
    }
    function highlightUntargetedTilesForBlast(checkPoint: Point) {
      emptyHighlightTiles();
      if (isWithinBoardTiles(checkPoint)) {
        const centerTile = getTileAtLocation(checkPoint);
        const aboveTile = new Point(
          centerTile.x,
          centerTile.y === 0 ? gameConfig.boardConfig.ySize - 1 : centerTile.y - 1
        );
        const rightTile = new Point(
          centerTile.x === gameConfig.boardConfig.xSize - 1 ? 0 : centerTile.x + 1,
          centerTile.y
        );
        const leftTile = new Point(
          centerTile.x === 0 ? gameConfig.boardConfig.xSize - 1 : centerTile.x - 1,
          centerTile.y
        );
        const belowTile = new Point(
          centerTile.x,
          centerTile.y === gameConfig.boardConfig.ySize - 1 ? 0 : centerTile.y + 1
        );
        const tilesToConsider = [centerTile, aboveTile, rightTile, leftTile, belowTile];
        const tilesToAdd = tilesToConsider.filter((tile) => {
          return !boards[getEnemyTurn()].getTargeted(tile);
        });
        highlightTiles.push(...tilesToAdd);
      }
    }
  }
  function handleMouseLeave(canvasData: DOMRect, mouseMoveLocation: Point): void {
    const scale = canvas.scale;
    const trueX = (mouseMoveLocation.x - canvasData.left) / scale;
    const trueY = (mouseMoveLocation.y - canvasData.top) / scale;
    mouse.isOnScreen = false;
    mouse.isHoveringOverAttackButton = false;
    mouse.isHoveringOverClickable = false;
    mouse.currentLoc.x = trueX;
    mouse.currentLoc.y = trueY;
    if (state === "attack") {
      resetAppearingText();
      currentScene.flushZIndex(zIndexes.appearingText);
    }
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
  function getTileAtLocation(trueMouseLoc: Point): Point {
    return new Point(
      Math.floor((trueMouseLoc.x - canvas.views.main.boardPosition.start.x - 16) / 16),
      Math.floor((trueMouseLoc.y - canvas.views.main.boardPosition.start.y - 16) / 16)
    );
  }
  //!CANVAS FUNCTIONS
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
          (main.end.x - main.start.x - (gameConfig.boardConfig.xSize + 1) * 16) / 2 + main.start.x;
        boardPosition.start.y =
          (main.end.y - main.start.y - (gameConfig.boardConfig.ySize + 1) * 16) / 2 + main.start.y;
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
          (main.end.x - main.start.x - (gameConfig.boardConfig.xSize + 1) * 16) / 2 + main.start.x;
        boardPosition.start.y =
          (main.end.y - main.start.y - (gameConfig.boardConfig.ySize + 1) * 16) / 2 + main.start.y;
        boardPosition.end.x = main.end.x - (boardPosition.start.x - main.start.x);
        boardPosition.end.y = main.end.y - (boardPosition.start.y - main.start.y);
        section1.start = drawer.start;
        section1.end = new Point(drawer.end.x / 3, drawer.end.y);
        section2.start = new Point(drawer.end.x / 3, drawer.start.y);
        section2.end = new Point((drawer.end.x * 2) / 3, drawer.end.y);
        section3.start = new Point((drawer.end.x * 2) / 3, drawer.start.y);
        section3.end = new Point(drawer.end.x, drawer.end.y);
      }
      if (state === "settingPieces") {
        resetDraggableObjectPositions();
      }
      redrawOnOrientationShift();
    }
    canvas.scale = canvasData.width / trueSize.width;
  }
  function redrawOnOrientationShift(): void {
    switch (state) {
      case "settingPieces": {
        currentScene.flushZIndex(zIndexes.tiles, zIndexes.ships, zIndexes.text);
        addTileDesignationsToScene(currentScene);
        addFriendlyBoardToScene(currentScene, boards[playerTurn]);
        break;
      }
      case "playerSwapScreen": {
        currentScene.flushZIndex(zIndexes.text);
        resetText();
        readyTextForPlayerSwapScene();
        break;
      }
      case "defensiveTurnReview": {
        currentScene.flushZIndex(
          zIndexes.tiles,
          zIndexes.ships,
          zIndexes.text,
          zIndexes.appearingText,
          zIndexes.highlightTiles
        );
        addTileDesignationsToScene(currentScene);
        addFriendlyBoardToScene(currentScene, boards[playerTurn]);
        redrawAppearingText();
        break;
      }
      case "offensiveTurnReview": {
        currentScene.flushZIndex(
          zIndexes.tiles,
          zIndexes.ships,
          zIndexes.text,
          zIndexes.appearingText,
          zIndexes.highlightTiles
        );
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        redrawAppearingText();
        break;
      }
      case "attack": {
        currentScene.flushZIndex(zIndexes.tiles, zIndexes.ships, zIndexes.text, zIndexes.appearingText);
        resetText();
        readyTextForAttack();
        readyTextForFleetStatus();
        addTextToScene(currentScene);
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        redrawAppearingText();
        break;
      }
      case "attack-salvo": {
        currentScene.flushZIndex(zIndexes.tiles, zIndexes.ships, zIndexes.text, zIndexes.altHighlightTiles);
        resetText();
        readyTextForFleetStatus();
        addTextToScene(currentScene);
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        addAltHighlightTilesToScene(currentScene);
        break;
      }
      case "attack-radar": {
        currentScene.flushZIndex(zIndexes.tiles, zIndexes.ships, zIndexes.text, zIndexes.altHighlightTiles);
        resetText();
        readyTextForFleetStatus();
        addTextToScene(currentScene);
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        addAltHighlightTilesToScene(currentScene);
        break;
      }
      case "attack-mines": {
        currentScene.flushZIndex(zIndexes.tiles, zIndexes.ships, zIndexes.text, zIndexes.altHighlightTiles);
        resetText();
        readyTextForFleetStatus();
        addTextToScene(currentScene);
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        addAltHighlightTilesToScene(currentScene);
        break;
      }
      case "attack-airstrike": {
        currentScene.flushZIndex(zIndexes.tiles, zIndexes.ships, zIndexes.text, zIndexes.altHighlightTiles);
        resetText();
        readyTextForFleetStatus();
        addTextToScene(currentScene);
        addTileDesignationsToScene(currentScene);
        addEnemyBoardToScene(currentScene, boards[getEnemyTurn()]);
        addAltHighlightTilesToScene(currentScene);
        break;
      }
    }
    function redrawAppearingText() {
      for (let i = 0; i < appearingTextToDisplayProgressLast; i++) {
        const { img, offset, root } = appearingTextToDisplay[i];
        currentScene.addImgToScene(
          zIndexes.appearingText,
          img,
          new Point(root.start.x + offset.x, root.start.y + offset.y)
        );
      }
    }
  }
  function transformTextToDisplayableFormat(
    displayArray: TextDisplayArray,
    text: string,
    root: { start: Point; end: Point },
    offset: { x: number; y: number } = { x: 3, y: 3 }
  ) {
    const words = text.split(" ");
    let x = root.start.x + offset.x;
    let y = root.start.y + offset.y;
    for (const word of words) {
      if (x + word.length * 8 > root.end.x - 3) {
        y += 9;
        x = root.start.x + offset.x;
      }
      const wordArr = word.split("");
      for (const char of wordArr) {
        if (char === "~") {
          x = root.start.x + offset.x;
          y += 8;
        } else {
          displayArray.push({
            img: sprites.text[char as validTextSpriteAccessor],
            root,
            offset: { x: x - root.start.x, y: y - root.start.y },
          });
          x += 8;
        }
      }
      x += 4;
    }
  }

  //!SCENE FUNCTIONS
  ///GENERIC
  function getScene(): Scene {
    return currentScene.getScene();
  }
  function addTileDesignationsToScene(scene: SceneBuilder): void {
    const { main } = canvas.views;
    for (let i = 0; i < gameConfig.boardConfig.xSize; i++) {
      scene.addImgToScene(
        zIndexes.text,
        sprites.text[String.fromCharCode(i + 65) as validTextSpriteAccessor],
        new Point(16 * i + 4 + main.boardPosition.start.x + 16, main.boardPosition.start.y + 4)
      );
    }
    for (let i = 1; i <= gameConfig.boardConfig.ySize; i++) {
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
    for (let x = 0; x < gameConfig.boardConfig.xSize; x++) {
      for (let y = 0; y < gameConfig.boardConfig.ySize; y++) {
        const searchPoint = new Point(x, y);
        const drawPoint = new Point(x * 16 + main.boardPosition.start.x + 16, y * 16 + main.boardPosition.start.y + 16);
        if (board.getTargeted(searchPoint)) {
          scene.addImgToScene(zIndexes.tiles, sprites.model.damageTiles[(x + y) % 2], drawPoint);
        } else {
          scene.addImgToScene(zIndexes.tiles, sprites.model.waterTiles[(x + y) % 2], drawPoint);
        }
        if (board.isOccupied(searchPoint)) {
          const part: ShipPart = board.getOccupied(searchPoint) as ShipPart;
          const partParent = part.parent;
          scene.addImgToScene(zIndexes.ships, sprites.model[partParent.shipType][part.partNum], drawPoint, {
            rotation: partParent.orientation === "NS" ? 90 : 0,
            transformed: partParent.orientation === "NS" ? true : false,
          });
        }
      }
    }
    if (currentTurn > 0) {
      const targetedTiles = Turns[getEnemyTurn()][currentTurn - 1].targetedTiles.map((tile) => tile.deepCopy());
      if (targetedTiles && targetedTiles.length > 0) {
        targetedTiles.forEach((tile) => {
          const drawPoint = new Point(
            tile.x * 16 + main.boardPosition.start.x + 16,
            tile.y * 16 + main.boardPosition.start.y + 16
          );
          scene.addImgToScene(zIndexes.highlightTiles, sprites.model.highlightTiles[(tile.x + tile.y) % 2], drawPoint);
        });
      }
    }
  }
  function addEnemyBoardToScene(scene: SceneBuilder, board: Board): void {
    const { main } = canvas.views;
    for (let x = 0; x < gameConfig.boardConfig.xSize; x++) {
      for (let y = 0; y < gameConfig.boardConfig.ySize; y++) {
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
    if (currentTurn > 0 && state === "offensiveTurnReview") {
      const targetedTiles = Turns[playerTurn][currentTurn - 1].targetedTiles.map((tile) => tile.deepCopy());
      if (targetedTiles && targetedTiles.length > 0) {
        targetedTiles.forEach((tile) => {
          const drawPoint = new Point(
            tile.x * 16 + main.boardPosition.start.x + 16,
            tile.y * 16 + main.boardPosition.start.y + 16
          );
          scene.addImgToScene(zIndexes.highlightTiles, sprites.model.highlightTiles[(tile.x + tile.y) % 2], drawPoint);
        });
      }
    }
  }
  function addDraggableObjectsToScene(scene: SceneBuilder): void {
    draggableObjects.forEach((obj) => {
      if (obj.visible) {
        scene.addImgToScene(zIndexes.draggableItems, obj.img, obj.start, {
          rotation: obj.rotation,
          transformed: false,
        });
      }
    });
  }
  function addValidForPlacementTilesToScreen(scene: SceneBuilder): void {
    validTilesForPlacement.forEach((tile) => {
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
  function addHighlightTilesToScene(scene: SceneBuilder): void {
    highlightTiles.forEach((tile) => {
      scene.addImgToScene(
        zIndexes.highlightTiles,
        sprites.model.highlightTiles[(tile.x + tile.y) % 2],
        new Point(
          16 + canvas.views.main.boardPosition.start.x + tile.x * 16,
          16 + canvas.views.main.boardPosition.start.y + tile.y * 16
        )
      );
    });
  }
  function addAltHighlightTilesToScene(scene: SceneBuilder): void {
    altHighlightTiles.forEach((tile) => {
      scene.addImgToScene(
        zIndexes.altHighlightTiles,
        sprites.model.altHighlightTiles[(tile.x + tile.y) % 2],
        new Point(
          16 + canvas.views.main.boardPosition.start.x + tile.x * 16,
          16 + canvas.views.main.boardPosition.start.y + tile.y * 16
        )
      );
    });
  }
  function addTextToScene(scene: SceneBuilder): void {
    for (const item of textToDisplay) {
      scene.addImgToScene(
        zIndexes.text,
        item.img,
        new Point(item.root.start.x + item.offset.x, item.root.start.y + item.offset.y)
      );
    }
  }
  function addAppearingTextToScene(scene: SceneBuilder): void {
    if (appearingTextToDisplayProgress < appearingTextToDisplay.length) {
      if (Math.floor(appearingTextToDisplayProgressLast) !== Math.floor(appearingTextToDisplayProgress)) {
        const { img, root, offset } = appearingTextToDisplay[Math.floor(appearingTextToDisplayProgress)];
        scene.addImgToScene(zIndexes.appearingText, img, new Point(root.start.x + offset.x, root.start.y + offset.y));
      }
      appearingTextToDisplayProgressLast = appearingTextToDisplayProgress;
      appearingTextToDisplayProgress += gameConfig.appearingTextSpeed;
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
  function addTransitionTilesToScene(scene: SceneBuilder): void {
    for (let i = 0; i < 480 / 16; i++) {
      for (let j = 0; j < 480 / 16; j++) {
        scene.addImgToScene(
          zIndexes.transitionTiles,
          sprites.model.appearingTiles[Math.floor(transitioningProgress)],
          new Point(i * 16, j * 16)
        );
      }
    }
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
  function emptyDraggableObjects(): void {
    draggableObjects.splice(0, draggableObjects.length);
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
  function resetText(): void {
    textToDisplay.splice(0, textToDisplay.length);
  }
  function emptyClickableObjects(): void {
    clickableObjects.splice(0, clickableObjects.length);
  }
  function createButton(
    type: "green" | "red",
    text: string,
    loc: Point,
    clickFunc: () => void,
    hoverFunc: undefined | (() => void) = undefined
  ): void {
    const wordPixelLength = text.length * 8;
    const spritesBackground = type === "green" ? sprites.model.buttonTiles.green : sprites.model.buttonTiles.red;
    const imgs: Array<{ img: ImageBitmap; zIndex: number; loc: Point; stretchedWidth?: number }> = [];
    imgs.push(
      { img: spritesBackground[0], zIndex: zIndexes.button, loc: new Point(0, 0) },
      { img: spritesBackground[1], zIndex: zIndexes.button, loc: new Point(1, 0) },
      { img: spritesBackground[2], zIndex: zIndexes.button, loc: new Point(2, 0) },
      {
        img: spritesBackground[3],
        zIndex: zIndexes.button,
        loc: new Point(3, 0),
        stretchedWidth: wordPixelLength - 1,
      },
      { img: spritesBackground[4], zIndex: zIndexes.button, loc: new Point(2 + wordPixelLength, 0) },
      { img: spritesBackground[5], zIndex: zIndexes.button, loc: new Point(3 + wordPixelLength, 0) },
      { img: spritesBackground[6], zIndex: zIndexes.button, loc: new Point(4 + wordPixelLength, 0) }
    );
    text.split("").forEach((char, i) => {
      imgs.push({
        img: sprites.text[char as validTextSpriteAccessor],
        zIndex: zIndexes.button,
        loc: new Point(3 + i * 8, 4),
      });
    });
    clickableObjects.push({
      imgs,
      start: loc,
      end: new Point(loc.x + 6 + wordPixelLength, loc.y + 16),
      clickFunc,
      hoverFunc,
      clickable: true,
    });
  }
  function createAbilityButtons() {
    const drawPointStart = canvas.views.drawer.sections[0].start;
    const drawPointEnd = canvas.views.drawer.sections[0].end;
    const associatedShips: Array<Array<ShipType>> = [["submarine"], ["carrier"], ["cruiser", "battleship"]];
    const abilities: Array<AttackTypes> = ["salvo", "radar", "airstrike", "mines"];
    let x = 0;
    for (let i = 0; i < abilities.length; i++) {
      const ability = abilities[i];
      if (ability !== "salvo") {
        const possibleAssociatedShips = associatedShips[i - 1];
        const numAlive = possibleAssociatedShips.reduce((acc, cur) => {
          return acc + (boards[playerTurn].isShipAlive(cur) ? 1 : 0);
        }, 0);
        if (numAlive > 0) {
          addAbilityButton(i);
        }
      } else {
        addAbilityButton(i);
      }
    }
    function addAbilityButton(i: number) {
      const imgs: Array<{ img: ImageBitmap; zIndex: number; loc: Point }> = [];
      const start = new Point(drawPointStart.x, drawPointStart.y + 24 + 24 * x + 4);
      const end = new Point(drawPointEnd.x, drawPointStart.y + 24 + 24 * x + 20);
      let clickable = true;
      imgs.push({
        img: sprites.model.abilities[i],
        zIndex: zIndexes.button,
        loc: new Point(3, 1),
      });
      if (abilities[i] in Cooldowns[playerTurn]) {
        const key = abilities[i] as AttacksWithCooldowns;
        const cd: number = Cooldowns[playerTurn][key];
        if (cd > 0) {
          generateText(abilities[i], new Point(22, -1), imgs);
          generateText(`Cooldown:${cd}`, new Point(22, 9), imgs);
          clickable = false;
        } else {
          generateText(abilities[i], new Point(22, 4), imgs);
        }
      } else {
        generateText(abilities[i], new Point(22, 4), imgs);
      }
      clickableObjects.push({
        imgs,
        start,
        end,
        clickable,
        clickFunc: () => {
          clickAbilityButton(abilities[i]);
        },
        hoverFunc: () => {
          hoverAbilityButton(abilities[i]);
        },
      });
      x++;
    }
    function generateText(
      text: string,
      drawStart: Point,
      imgs: Array<{ img: ImageBitmap; zIndex: number; loc: Point }>
    ) {
      let x = drawStart.x;
      text.split("").forEach((char) => {
        imgs.push({
          img: sprites.text[char as validTextSpriteAccessor],
          zIndex: zIndexes.button,
          loc: new Point(x, drawStart.y),
        });
        x += 8;
      });
    }
  }
  function hoverAbilityButton(ability: AttackTypes) {
    const offsets = { x: 3, y: 10 };

    resetAppearingText();
    switch (ability) {
      case "salvo": {
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          "Launch 1 Attack At The Enemy For Each Remaining Ship In Your Fleet. ~ ~No Cooldown.",
          canvas.views.drawer.sections[1],
          offsets
        );
        break;
      }
      case "radar": {
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          "Requires Submarine: ~Get Report On Number Of Ship Pieces Within Up To 10 Chosen Tiles. ~ ~No Cooldown.",
          canvas.views.drawer.sections[1],
          offsets
        );
        break;
      }
      case "airstrike": {
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          `Requires Carrier: ~Start A Bombing Run Along The Path Of Your Carrier (7 Tiles). ~ ~${CooldownLimits.airstrike} Turn Cooldown.`,
          canvas.views.drawer.sections[1],
          offsets
        );
        break;
      }
      case "mines": {
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          `Requires Cruiser Or Battleship: ~Detonate A Large Blast In A Single Area (5 Tiles). ~ ~${CooldownLimits.mines} Turn Cooldown.`,
          canvas.views.drawer.sections[1],
          offsets
        );
        break;
      }
    }
  }
  function clickAbilityButton(ability: AttackTypes) {
    switch (ability) {
      case "salvo": {
        setState("attack-salvo");
        break;
      }
      case "radar": {
        setState("attack-radar");
        break;
      }
      case "airstrike": {
        setState("attack-airstrike");
        break;
      }
      case "mines": {
        setState("attack-mines");
        break;
      }
    }
    mouse.isHoveringOverClickable = false;
    mouse.isHoveringOverAttackButton = false;
  }
  function emptyHighlightTiles(): void {
    highlightTiles.splice(0, highlightTiles.length);
  }
  function emptyAltHighlightTiles(): void {
    altHighlightTiles.splice(0, altHighlightTiles.length);
  }
  ///!SCENE SPECIFIC
  function readyTextForPlayerSwapScene() {
    {
      transformTextToDisplayableFormat(
        textToDisplay,
        ` Please Swap Control To Player ${playerTurn + 1} ~ ~Click or Tap Anywhere When Ready`,
        {
          start: new Point(canvas.trueSize.width / 2 - 120, canvas.trueSize.height / 2 - 7),
          end: new Point(10000, 10000),
        }
      );
    }
    addTextToScene(currentScene);
  }
  function readyTextForDefensiveTurnReview() {
    const opponentTurnHistory = Turns[getEnemyTurn()];
    if (opponentTurnHistory.length === 0) {
      transformTextToDisplayableFormat(
        appearingTextToDisplay,
        "The Enemy Is Near! ~ ~Vision Is Limited. ~ ~Orders Are To Fire And Listen For Hits!",
        canvas.views.drawer.sections[0]
      );
    } else {
      const opponentActions = opponentTurnHistory[currentTurn - 1];
      const { hitTiles, targetedTiles } = opponentActions;
      switch (opponentActions.attackType) {
        case "airstrike": {
          transformTextToDisplayableFormat(
            appearingTextToDisplay,
            "The Enemy Sent Their Planes Out In The Fog To Make A Bombing Run!",
            canvas.views.drawer.sections[0]
          );
          break;
        }
        case "mines": {
          transformTextToDisplayableFormat(
            appearingTextToDisplay,
            "A Cluster Of Mines The Enemy Left Have Detonated!",
            canvas.views.drawer.sections[0]
          );
          break;
        }
        case "radar": {
          transformTextToDisplayableFormat(
            appearingTextToDisplay,
            "No Ballistics Were Reported. The Enemy Must Scouting...",
            canvas.views.drawer.sections[0]
          );
          break;
        }
        case "salvo": {
          transformTextToDisplayableFormat(
            appearingTextToDisplay,
            "The Enemy Released A Salvo Of Shots In Our Sector!",
            canvas.views.drawer.sections[0]
          );
          break;
        }
      }
      if (targetedTiles.length === 0) {
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          "The Enemy Targetted None Of Our Sectors Location",
          canvas.views.drawer.sections[1]
        );
      } else {
        let message = "We Were Targeted In The Following Locations: ~";
        for (let i = 0; i < targetedTiles.length; i++) {
          message += convertPointToCoords(targetedTiles[i]);
          if (i !== targetedTiles.length - 1) {
            message += ", ";
          }
        }
        transformTextToDisplayableFormat(appearingTextToDisplay, message, canvas.views.drawer.sections[1]);
      }
      if (hitTiles.length === 0) {
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          "We Report No Hits To Any Of The Ships In Our Fleet",
          canvas.views.drawer.sections[2]
        );
      } else {
        let message = "We Were Hit In The Following Locations: ~";
        for (let i = 0; i < hitTiles.length; i++) {
          message += convertPointToCoords(hitTiles[i]);
          if (i !== hitTiles.length - 1) {
            message += ", ";
          }
        }
        transformTextToDisplayableFormat(appearingTextToDisplay, message, canvas.views.drawer.sections[2]);
      }
    }
  }
  function readyTextForOffensiveTurnReview() {
    const playerHistory = Turns[playerTurn];
    if (playerHistory.length === 0) {
      transformTextToDisplayableFormat(
        appearingTextToDisplay,
        "The Enemy Is Near! ~ ~Vision Is Limited. ~ ~Orders Are To Fire And Listen For Hits!",
        canvas.views.drawer.sections[0]
      );
    } else {
      const playerActions = playerHistory[currentTurn - 1];
      const { hitTiles, targetedTiles } = playerActions;
      switch (playerActions.attackType) {
        case "airstrike": {
          transformTextToDisplayableFormat(
            appearingTextToDisplay,
            "We Sent Our Planes Out In The Night For A Bombing Run On Suspected Targets!",
            canvas.views.drawer.sections[0]
          );
          break;
        }
        case "mines": {
          transformTextToDisplayableFormat(
            appearingTextToDisplay,
            "A Cluster Of Mines We Left Have Been Detonated!",
            canvas.views.drawer.sections[0]
          );
          break;
        }
        case "radar": {
          transformTextToDisplayableFormat(
            appearingTextToDisplay,
            "We Sent Out For Scouting. The Report Is In...",
            canvas.views.drawer.sections[0]
          );
          break;
        }
        case "salvo": {
          transformTextToDisplayableFormat(
            appearingTextToDisplay,
            "We Fired A Salvo Of Shots Into The Enemy Sector",
            canvas.views.drawer.sections[0]
          );
          break;
        }
      }
      if (targetedTiles.length === 0) {
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          "We Targeted None Of The Enemy's Locations",
          canvas.views.drawer.sections[1]
        );
      } else {
        let message = "We Targeted The Enemy In The Following Locations: ~";
        for (let i = 0; i < targetedTiles.length; i++) {
          message += convertPointToCoords(targetedTiles[i]);
          if (i !== targetedTiles.length - 1) {
            message += ", ";
          }
        }
        transformTextToDisplayableFormat(appearingTextToDisplay, message, canvas.views.drawer.sections[1]);
      }
      if (hitTiles.length === 0) {
        transformTextToDisplayableFormat(
          appearingTextToDisplay,
          "We Were Unable To Record A Single Hit",
          canvas.views.drawer.sections[2]
        );
      } else {
        let message = "The Enemy Was Struck In The Following Locations: ~";
        for (let i = 0; i < hitTiles.length; i++) {
          message += convertPointToCoords(hitTiles[i]);
          if (i !== hitTiles.length - 1) {
            message += ", ";
          }
        }
        transformTextToDisplayableFormat(appearingTextToDisplay, message, canvas.views.drawer.sections[2]);
      }
    }
  }
  function readyTextForAttack() {
    transformTextToDisplayableFormat(textToDisplay, "Choose Your Attack:", canvas.views.drawer.sections[0]);
  }
  function readyTextForFleetStatus() {
    const ShipTypes: Array<ShipType> = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
    const playerFleetStatus: Array<{ shipType: ShipType; alive: boolean }> = ShipTypes.map((ship) => {
      return {
        shipType: ship,
        alive: boards[playerTurn].isShipAlive(ship),
      };
    });
    const enemyFleetStatus: Array<{ shipType: ShipType; alive: boolean }> = ShipTypes.map((ship) => {
      return {
        shipType: ship,
        alive: boards[getEnemyTurn()].isShipAlive(ship),
      };
    });
    let playerMessage = "Player Fleet: ~";
    playerFleetStatus.forEach((status) => {
      if (status.alive) {
        playerMessage += ` ${status.shipType} ~`;
      }
    });
    let enemyMessage = "Enemy Fleet: ~";
    enemyFleetStatus.forEach((status) => {
      if (status.alive) {
        enemyMessage += ` ${status.shipType} ~`;
      }
    });
    transformTextToDisplayableFormat(textToDisplay, playerMessage, canvas.views.drawer.sections[2], { x: 3, y: 3 });
    transformTextToDisplayableFormat(textToDisplay, enemyMessage, canvas.views.drawer.sections[2], { x: 3, y: 63 });
  }
  function readyHighlightTilesForAttackAirstrike() {
    let carrier;
    let i = 0;
    const fleet = boards[playerTurn].getFleet();
    const { xSize, ySize } = gameConfig.boardConfig;
    while (i < fleet.length && carrier === undefined) {
      if (fleet[i].ship.shipType === "carrier") {
        carrier = fleet[i];
      }
      i++;
    }
    if (carrier) {
      const orientation = carrier.ship.orientation;
      let chooseTilesToHighlightFunction: (startLoc: Point) => void;
      if (orientation === "EW") {
        chooseTilesToHighlightFunction = (startLoc) => {
          const y = startLoc.y;
          const yAbove = y === 0 ? ySize - 1 : y - 1;
          const yBelow = y === ySize - 1 ? 0 : y + 1;
          for (let x = 0; x < xSize; x++) {
            const centerPoint = new Point(x, y);
            const abovePoint = new Point(x, yAbove);
            const belowPoint = new Point(x, yBelow);
            if (!boards[getEnemyTurn()].getTargeted(centerPoint)) {
              highlightTiles.push(centerPoint);
            }
            if (!boards[getEnemyTurn()].getTargeted(abovePoint)) {
              highlightTiles.push(abovePoint);
            }
            if (!boards[getEnemyTurn()].getTargeted(belowPoint)) {
              highlightTiles.push(belowPoint);
            }
          }
        };
      } else {
        chooseTilesToHighlightFunction = (startLoc) => {
          const x = startLoc.x;
          const xLeft = x === 0 ? xSize - 1 : x - 1;
          const xRight = x === xSize - 1 ? 0 : x + 1;
          for (let y = 0; y < ySize; y++) {
            const centerPoint = new Point(x, y);
            const leftPoint = new Point(xLeft, y);
            const rightPoint = new Point(xRight, y);
            if (!boards[getEnemyTurn()].getTargeted(centerPoint)) {
              highlightTiles.push(centerPoint);
            }
            if (!boards[getEnemyTurn()].getTargeted(leftPoint)) {
              highlightTiles.push(leftPoint);
            }
            if (!boards[getEnemyTurn()].getTargeted(rightPoint)) {
              highlightTiles.push(rightPoint);
            }
          }
        };
      }
      chooseTilesToHighlightFunction(carrier.startLoc);
    }
  }
  function isWithinCarrierRange(point: Point): boolean {
    let carrier;
    let i = 0;
    const fleet = boards[playerTurn].getFleet();
    const { xSize, ySize } = gameConfig.boardConfig;
    while (i < fleet.length && carrier === undefined) {
      if (fleet[i].ship.shipType === "carrier") {
        carrier = fleet[i];
      }
      i++;
    }
    if (carrier) {
      const { x: shipX, y: shipY } = carrier.startLoc;
      const { x, y } = point;
      const orientation = carrier.ship.orientation;
      if (orientation === "NS") {
        if (x === 0) {
          return x === shipX || x === xSize - 1 || x === shipX + 1;
        } else if (x === xSize - 1) {
          return x === shipX || x === shipX - 1 || x === 0;
        } else {
          return x === shipX || x === shipX - 1 || x === shipX + 1;
        }
      } else {
        if (y === 0) {
          return y === shipY || y === ySize - 1 || y === shipY + 1;
        } else if (y === ySize - 1) {
          return y === shipY || y === shipY - 1 || y === 0;
        } else {
          return y === shipY || y === shipY - 1 || y === shipY + 1;
        }
      }
    }
    return false;
  }
  //!UTILITY
  function convertPointToCoords(point: Point): string {
    return `(${String.fromCharCode(point.x + 65)},${point.y + 1})`;
  }
  function getEnemyTurn(): number {
    return (playerTurn + 1) % 2;
  }
  function hitTargetedTiles(): void {
    const player1Turn = Turns[0][currentTurn];
    const player2Turn = Turns[1][currentTurn];
    if (player1Turn.attackType !== "radar") {
      player1Turn.targetedTiles.forEach((tile) => {
        boards[1].target(tile);
      });
    }
    if (player2Turn.attackType !== "radar") {
      player2Turn.targetedTiles.forEach((tile) => {
        boards[0].target(tile);
      });
    }
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
    update,
  };
};

export { Game, GameConfig, CanvasConfig, GameState, game };
export default game;
