import Board from "./logic/Board";

type BoardConfig = {
  xSize: number;
  ySize: number;
};
type GameConfig = {
  boardConfig: BoardConfig;
  gameState: GameState;
  updateSpeed: number;
  mouseInfo: {
    onScreen: boolean;
    xPos: number;
    yPos: number;
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
  mouseInfo: {
    onScreen: false,
    xPos: 0,
    yPos: 0,
  },
};

const game = (): Game => {
  const _boards: Array<Board> = [];
  const _gameConfig: GameConfig = gameConfig;
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
    getState,
    setState,
  };
};

export { Game, GameConfig, GameState, game };
export default game;
