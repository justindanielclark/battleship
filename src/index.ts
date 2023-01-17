import "./styles/styles.css"; //required to load TailindCSS
import ModelSprites from "./assets/ModelSprites";
import TextSprites from "./assets/TextSprites";
import Canvas from "./logic/canvas";
import Game from "./logic/game";
import Renderer from "./logic/renderer";
import Board from "./logic/data_storage/Board";
import Ship from "./logic/data_storage/Ship";
import Point from "./logic/data_storage/Point";

const { body } = document;
body.classList.add(
  "bg-stone-800",
  "flex",
  "justify-center",
  "items-center",
  "min-h-screen",
  "max-h-screen",
  "p-4"
);

const game = Game();
const canvas = Canvas();
const canvasEL = canvas.getHTMLCanvasElement();
canvasEL.classList.add("cursor-none");
body.append(canvas.getHTMLCanvasElement());
canvas.update();
game.updateViewSizes(canvas.getCanvasData());
const ctx = canvas.get2dRenderingContext();
const sprites = {
  model: ModelSprites(),
  text: TextSprites(),
};
const renderer = Renderer(ctx);

const player1Board = new Board(
  game.getGameConfig().boardConfig.xSize,
  game.getGameConfig().boardConfig.ySize
);
game.addBoard(player1Board);
player1Board.addShip(new Point(0, 0), new Ship("carrier", "NS"));
player1Board.target(new Point(0, 0));
player1Board.target(new Point(0, 1));
player1Board.addShip(new Point(2, 1), new Ship("battleship", "EW"));
player1Board.addShip(new Point(5, 5), new Ship("cruiser", "NS"));
player1Board.addShip(new Point(7, 7), new Ship("submarine", "EW"));
player1Board.addShip(new Point(9, 9), new Ship("destroyer", "NS"));

const player2Board = new Board(
  game.getGameConfig().boardConfig.xSize,
  game.getGameConfig().boardConfig.ySize
);
game.addBoard(player2Board);
player2Board.addShip(new Point(9, 4), new Ship("carrier", "NS"));
player2Board.addShip(new Point(3, 3), new Ship("battleship", "EW"));
player2Board.addShip(new Point(1, 8), new Ship("cruiser", "NS"));
player2Board.addShip(new Point(1, 1), new Ship("submarine", "EW"));
player2Board.target(new Point(1, 1));
player2Board.target(new Point(2, 1));
player2Board.target(new Point(3, 1));
player2Board.target(new Point(4, 1));
player2Board.addShip(new Point(10, 2), new Ship("destroyer", "NS"));

let prevUpdate = 0;
window.requestAnimationFrame(update);
function update(timestamp: number) {
  const elapsed = timestamp - prevUpdate;
  if (elapsed > 33.33) {
    prevUpdate = timestamp;
    switch (game.getState()) {
      case "initializing": {
        if (sprites.model.loaded && sprites.text.loaded) {
          game.setState("player1turnstart");
        }
        break;
      }
      case "player1SettingPieces": {
        break;
      }
      case "player1attack": {
        break;
      }
      case "player2SettingPieces": {
        break;
      }
      case "player2attack": {
        break;
      }
    }
    renderer.render();
  }
  window.requestAnimationFrame(update);
}

window.addEventListener("resize", () => {
  canvas.update();
  game.updateViewSizes(canvas.getCanvasData());
  renderer.render();
});
canvasEL.addEventListener("click", function (e) {
  // eslint-disable-next-line no-console
  console.dir(this);
  // eslint-disable-next-line no-console
  console.dir(this.getBoundingClientRect());
  // eslint-disable-next-line no-console
  console.dir(e);
  // eslint-disable-next-line no-console
  console.dir(game.getGameConfig());
});
canvasEL.addEventListener("mousemove", function (e) {
  const { mouseLoc } = game.getGameInfo().mouse;
  const { left: xOffset, top: yOffset } = this.getBoundingClientRect();
  mouseLoc.onScreen = true;
  mouseLoc.xPos = e.clientX;
  mouseLoc.yPos = e.clientY;
  mouseLoc.xOffset = xOffset;
  mouseLoc.yOffset = yOffset;
});
canvasEL.addEventListener("mouseleave", function (e) {
  const { mouseLoc } = game.getGameInfo().mouse;
  const { left: xOffset, top: yOffset } = this.getBoundingClientRect();
  mouseLoc.onScreen = false;
  mouseLoc.xPos = e.clientX;
  mouseLoc.yPos = e.clientY;
  mouseLoc.xOffset = xOffset;
  mouseLoc.yOffset = yOffset;
});
