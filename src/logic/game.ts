import Board from "./data_storage/Board";
import Point from "./data_storage/Point";

type BoardConfig = {
  xSize: number;
  ySize: number;
};
type CanvasConfig = {
  orientation: "portrait" | "landscape";
  trueSize: {
    width: number;
    height: number;
  };
  views: {
    main: {
      start: Point;
      end: Point;
    };
    drawer: {
      start: Point;
      end: Point;
    };
  };
  scale: number;
};
type MouseConfig = {
  mouseLoc: {
    onScreen: boolean;
    xPos: number;
    yPos: number;
    xOffset: number;
    yOffset: number;
  };
  mouseClick: {
    bool: boolean;
    x: number;
    y: number;
  };
};
type GameConfig = {
  boardConfig: BoardConfig;
  updateSpeed: number;
};
type GameInfo = {
  state: GameState;
  mouse: MouseConfig;
  canvas: CanvasConfig;
};
type GameState =
  | "initializing"
  | "player1SettingPieces"
  | "player1turnstart"
  | "player1attack"
  | "player2SettingPieces"
  | "player2turnstart"
  | "player2attack"
  | "end";

type Game = {
  getBoard(num: number): Board;
  addBoard(board: Board): void;
  getGameConfig(): GameConfig;
  getGameInfo(): GameInfo;
  getState(): GameState;
  setState(gameState: GameState): void;
  updateViewSizes(canvasData: CanvasData): void;
};

const game = (): Game => {
  const _boards: Array<Board> = [];
  const _gameConfig: GameConfig = {
    boardConfig: {
      xSize: 15,
      ySize: 15,
    },
    updateSpeed: 33.33,
  };
  const _gameInfo: GameInfo = {
    state: "initializing",
    mouse: {
      mouseLoc: {
        onScreen: false,
        xPos: 0,
        xOffset: 0,
        yPos: 0,
        yOffset: 0,
      },
      mouseClick: {
        bool: false,
        x: 0,
        y: 0,
      },
    },
    canvas: {
      orientation: "landscape",
      scale: 1,
      trueSize: {
        width: 480,
        height: 360,
      },
      views: {
        main: {
          start: new Point(0, 0),
          end: new Point(0, 0),
        },
        drawer: {
          start: new Point(0, 0),
          end: new Point(0, 0),
        },
      },
    },
  };
  function addBoard(board: Board) {
    _boards.push(board);
  }
  function getBoard(num: number): Board {
    if (num < _boards.length) {
      return _boards[num];
    } else {
      throw new Error("No Such Board Exists");
    }
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
    const { main, drawer } = _gameInfo.canvas.views;
    if (_gameInfo.canvas.orientation === "landscape") {
      drawer.start.x = 0;
      drawer.start.y = 0;
      drawer.end.x = canvasData.width / 4;
      drawer.end.y = canvasData.height;
      main.start.x = canvasData.width / 4;
      main.start.y = 0;
      main.end.x = canvasData.width;
      main.end.y = canvasData.height;
    }
    if (_gameInfo.canvas.orientation === "portrait") {
      drawer.start.x = 0;
      drawer.start.y = 0;
      drawer.end.x = canvasData.width;
      drawer.end.y = canvasData.height / 4;
      main.start.x = 0;
      main.start.y = canvasData.height / 4;
      main.end.x = canvasData.width;
      main.end.y = canvasData.height;
    }
  }
  return {
    addBoard,
    getBoard,
    getGameConfig,
    getGameInfo,
    getState,
    setState,
    updateViewSizes,
  };
};

export { Game, GameConfig, GameInfo, GameState, game };
export default game;
