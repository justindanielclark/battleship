import "./styles/styles.css"; //required to load TailindCSS
import SpriteSheet from './assets/Spritesheet.png';
import BattleshipSprite from './assets/Battleship.png';

interface SpritesInterface {
	carrier: ImageBitmap[],
	battleship: ImageBitmap[],
	cruiser: ImageBitmap[],
	submarine: ImageBitmap[],
	destroyer: ImageBitmap[],
	waterTiles: ImageBitmap[],
	radarTiles: ImageBitmap[],
}

const { body } = document;
body.classList.add("bg-stone-800", "flex", "justify-center", "items-center", "min-h-screen", "max-h-screen");

const CanvasOptions = { // values set with setCanvasWidthAndHeight()
  minDimensions: 352,
	currentHeight: 0,
  currentWidth: 0,
};
const canvas = document.createElement("canvas");
const ctx = get2dRenderingContext(canvas);
setCanvasWidthAndHeight();

let SpritesAreLoaded = false;
const SpriteSheetImage = new Image();
SpriteSheetImage.src = SpriteSheet;
const Sprites: SpritesInterface = {
	carrier: [],
	battleship: [],
	cruiser: [],
	submarine: [],
	destroyer: [],
	waterTiles: [],
	radarTiles: [],
};
SpriteSheetImage.addEventListener('load', () => {
	Promise.all([
		//Carrier Parts
		createImageBitmap(SpriteSheetImage, 0, 0, 16, 16),
		createImageBitmap(SpriteSheetImage, 16, 0, 16, 16),
		createImageBitmap(SpriteSheetImage, 32, 0, 16, 16),
		createImageBitmap(SpriteSheetImage, 48, 0, 16, 16),
		createImageBitmap(SpriteSheetImage, 64, 0, 16, 16),
		//Battleship Parts
		createImageBitmap(SpriteSheetImage, 0, 16, 16, 16),
		createImageBitmap(SpriteSheetImage, 16, 16, 16, 16),
		createImageBitmap(SpriteSheetImage, 32, 16, 16, 16),
		createImageBitmap(SpriteSheetImage, 48, 16, 16, 16),
		//Cruiser Parts
		createImageBitmap(SpriteSheetImage, 0, 32, 16, 16),
		createImageBitmap(SpriteSheetImage, 16, 32, 16, 16),
		createImageBitmap(SpriteSheetImage, 32, 32, 16, 16),
		//Submarine Parts
		createImageBitmap(SpriteSheetImage, 0, 48, 16, 16),
		createImageBitmap(SpriteSheetImage, 16, 48, 16, 16),
		createImageBitmap(SpriteSheetImage, 32, 48, 16, 16),
		//Destoryer Parts
		createImageBitmap(SpriteSheetImage, 0, 64, 16, 16),
		createImageBitmap(SpriteSheetImage, 16, 64, 16, 16),
		//Water Tiles
		createImageBitmap(SpriteSheetImage, 0, 48, 16, 16),
		createImageBitmap(SpriteSheetImage, 16, 48, 16, 16),
		//Radar Tiles
		createImageBitmap(SpriteSheetImage, 0, 64, 16, 16),
		createImageBitmap(SpriteSheetImage, 16, 64, 16, 16),
	]).then((sprites)=>{
		Sprites.carrier.push(
			sprites[0],
			sprites[1],
			sprites[2],
			sprites[3],
			sprites[4]
		);
		Sprites.battleship.push(
			sprites[5],
			sprites[6],
			sprites[7],
			sprites[8],
		);
		Sprites.cruiser.push(
			sprites[9],
			sprites[10],
			sprites[11],
		);
		Sprites.submarine.push(
			sprites[12],
			sprites[13],
			sprites[14],
		);
		Sprites.waterTiles.push(
			sprites[15],
			sprites[16],
		);
		Sprites.radarTiles.push(
			sprites[17],
			sprites[18],
		);
		SpritesAreLoaded = true;
		render();
	});
});

body.append(canvas);

render();

window.addEventListener("resize", () => {
  setCanvasWidthAndHeight();
	render();
});

function render(): void {
  clearCanvas();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, CanvasOptions.currentWidth, CanvasOptions.currentHeight);
	if(SpritesAreLoaded){
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(Sprites.battleship[0], 0, 0, 16, 16, 0, 0, 64, 64);
		ctx.drawImage(Sprites.battleship[1], 0, 0, 16, 16, 64, 0, 64, 64);
		ctx.drawImage(Sprites.battleship[2], 0, 0, 16, 16, 128, 0, 64, 64);
		ctx.drawImage(Sprites.battleship[3], 0, 0, 16, 16, 192, 0, 64, 64);
		ctx.drawImage(Sprites.battleship[4], 0, 0, 16, 16, 256, 0, 64, 64);
	}
}
function clearCanvas(): void {
  ctx.clearRect(0, 0, CanvasOptions.currentWidth, CanvasOptions.currentHeight);
}
function get2dRenderingContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const renderingContext = canvas.getContext("2d");
  if (!renderingContext || !(renderingContext instanceof CanvasRenderingContext2D)) {
    throw new Error("Unable to retrieve CanvasRenderingContext2D");
  }
  return renderingContext;
}
function setCanvasWidthAndHeight(): void {
  let lesser;
  if (window.innerHeight > window.innerWidth) {
    ({ innerWidth: lesser } = window);
  } else {
    ({ innerHeight: lesser } = window);
  }
  if (lesser < CanvasOptions.minDimensions) {
    lesser = CanvasOptions.minDimensions;
  }
	CanvasOptions.currentHeight = lesser;
	CanvasOptions.currentWidth = lesser;
  canvas.height = lesser;
  canvas.width = lesser;
}
