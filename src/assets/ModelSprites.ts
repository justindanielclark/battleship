import SpriteSheet from "./Spritesheet.png";

type ModelSprites = {
  loaded: boolean;
  carrier: Array<ImageBitmap>;
  battleship: Array<ImageBitmap>;
  cruiser: Array<ImageBitmap>;
  submarine: Array<ImageBitmap>;
  destroyer: Array<ImageBitmap>;
  waterTiles: Array<ImageBitmap>;
  radarTiles: Array<ImageBitmap>;
};
const modelSprites = (): ModelSprites => {
  const Sprites: ModelSprites = {
    loaded: false,
    carrier: [],
    battleship: [],
    cruiser: [],
    submarine: [],
    destroyer: [],
    waterTiles: [],
    radarTiles: [],
  };
  const SpriteSheetImage = new Image();
  SpriteSheetImage.src = SpriteSheet;
  SpriteSheetImage.addEventListener("load", () => {
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
      createImageBitmap(SpriteSheetImage, 48, 48, 16, 16),
      createImageBitmap(SpriteSheetImage, 64, 48, 16, 16),
      //Radar Tiles
      createImageBitmap(SpriteSheetImage, 48, 64, 16, 16),
      createImageBitmap(SpriteSheetImage, 64, 64, 16, 16),
    ]).then((sprites) => {
      Sprites.carrier.push(
        sprites[0],
        sprites[1],
        sprites[2],
        sprites[3],
        sprites[4]
      );
      Sprites.battleship.push(sprites[5], sprites[6], sprites[7], sprites[8]);
      Sprites.cruiser.push(sprites[9], sprites[10], sprites[11]);
      Sprites.submarine.push(sprites[12], sprites[13], sprites[14]);
      Sprites.destroyer.push(sprites[15], sprites[16]);
      Sprites.waterTiles.push(sprites[17], sprites[18]);
      Sprites.radarTiles.push(sprites[19], sprites[20]);
      Sprites.loaded = true;
    });
  });

  return Sprites;
};

export { modelSprites, ModelSprites };
export default modelSprites;
