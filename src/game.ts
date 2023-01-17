import Board from "./logic/Board";

type BoardConfig = {
  xSize: number;
  ySize: number;
};
type GameConfig = {
  boardConfig: BoardConfig;
  gameState: GameState;
  updateSpeed: number;
};
type GameInfo = {
  mouse: {
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
};

const gameConfig: GameConfig = {
  gameState: "initializing",
  boardConfig: {
    xSize: 15,
    ySize: 15,
  },
  updateSpeed: 33.33,
};

const gameInfo: GameInfo = {
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
};

const game = (): Game => {
  const _boards: Array<Board> = [];
  const _gameConfig: GameConfig = gameConfig;
  const _gameInfo: GameInfo = gameInfo;
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
    return gameConfig.gameState;
  }
  function setState(gameState: GameState): void {
    _gameConfig.gameState = gameState;
  }
  return {
    addBoard,
    getBoard,
    getGameConfig,
    getGameInfo,
    getState,
    setState,
  };
};

export { Game, GameConfig, GameInfo, GameState, game };
export default game;
