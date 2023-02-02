import "./styles/styles.css"; //required to load TailindCSS
import Canvas from "./logic/display/canvas";
import Game from "./logic/game";
import Renderer from "./logic/display/renderer";
import Point from "./logic/data_storage/Point";

const { body } = document;
body.classList.add("bg-stone-800", "flex", "justify-center", "items-center", "min-h-screen", "max-h-screen");

const game = Game();
const canvas = Canvas();
const canvasEL = canvas.getHTMLCanvasElement();
canvasEL.classList.add("cursor-none");
body.append(canvas.getHTMLCanvasElement());
canvas.update();
game.updateViewSizes(canvas.getCanvasData());
const ctx = canvas.get2dRenderingContext();
const renderer = Renderer(ctx, game.getCanvasConfig());

let prevUpdate = 0;
window.requestAnimationFrame(update);
function update(timestamp: number) {
  const elapsed = timestamp - prevUpdate;
  if (elapsed > game.getGameConfig().updateSpeed) {
    prevUpdate = timestamp;
    if (game.areAssetsLoaded()) {
      if (game.getState() === "initializing") {
        game.setState("attack-mines");
      }
      game.update();
      renderer.render(game.getScene());
    }
  }
  window.requestAnimationFrame(update);
}

window.addEventListener("resize", () => {
  canvas.update();
  game.updateViewSizes(canvas.getCanvasData());
  renderer.reRender();
});
canvasEL.addEventListener("touchstart", function (e) {
  game.handleMouseDown(this.getBoundingClientRect(), new Point(e.touches[0].clientX, e.touches[0].clientY));
  e.preventDefault();
});
canvasEL.addEventListener("touchmove", function (e) {
  game.handleMouseMove(this.getBoundingClientRect(), new Point(e.touches[0].clientX, e.touches[0].clientY));
  e.preventDefault();
});
canvasEL.addEventListener("touchend", function (e) {
  //! currently doesnot fire as touchend removes a 'touch' from e.touches. Need to implement touch tracking and only track the first touch if no other touches exist.
  game.handleMouseUp(this.getBoundingClientRect(), new Point(e.touches[0].clientX, e.touches[0].clientY));
  e.preventDefault();
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
