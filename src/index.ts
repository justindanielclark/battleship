import "./styles/styles.css"; //required to load TailindCSS
import ModelSprites from "./assets/ModelSprites";
import TextSprites from "./assets/TextSprites";
import Canvas from "./canvas";
import Renderer from "./renderer";

//Tailwind CSS for Body
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
const canvas = Canvas();
body.append(canvas.getHTMLCanvasElement());
canvas.update();
const canvasData = canvas.getConfig();
const ctx = canvas.get2dRenderingContext();
const modelSprites = ModelSprites();
const textSprites = TextSprites();
const renderer = Renderer(canvasData, ctx, modelSprites, textSprites);
renderer.updateDimensions();
renderer.render();

window.addEventListener("resize", () => {
  canvas.update();
  renderer.updateDimensions();
  renderer.render();
});
