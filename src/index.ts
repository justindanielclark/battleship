import "./styles/styles.css"; //required to load TailindCSS
import Canvas from "./logic/canvas";
import Game from "./logic/game";
import Renderer from "./logic/renderer";
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

const renderer = Renderer(ctx, game);

let prevUpdate = 0;
window.requestAnimationFrame(update);
function update(timestamp: number) {
  const elapsed = timestamp - prevUpdate;
  if (elapsed > game.getGameConfig().updateSpeed) {
    prevUpdate = timestamp;
    switch (game.getState()) {
      case "initializing": {
        if (game.assetsAreLoaded()) {
          game.initializeAfterAssetLoad();
          game.setState("settingPieces");
          // game.setState("turnReview");
          // game.setState("attack");
        }
        break;
      }
    }
    const scene = game.getScene();
    renderer.render(scene);
  }
  window.requestAnimationFrame(update);
}

window.addEventListener("resize", () => {
  canvas.update();
  game.updateViewSizes(canvas.getCanvasData());
  renderer.reRender();
});
canvasEL.addEventListener("mousedown", function (e) {
  game.handleMouseDown(this.getBoundingClientRect(), new Point(e.x, e.y));
});
canvasEL.addEventListener("mouseup", function (e) {
  game.handleMouseUp(this.getBoundingClientRect(), new Point(e.x, e.y));
});
canvasEL.addEventListener("mousemove", function (e) {
  game.handleMouseMove(this.getBoundingClientRect(), new Point(e.x, e.y));
});
canvasEL.addEventListener("mouseleave", function (e) {
  game.handleMouseLeave(this.getBoundingClientRect(), new Point(e.x, e.y));
});
