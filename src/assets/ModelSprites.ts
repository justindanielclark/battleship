import SpriteSheet from "./Spritesheet.png";

const modelSprites = (): ModelSpritesLoaded => {
  const Sprites: ModelSprites = {
    loaded: false,
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
      //Damage Tiles
      createImageBitmap(SpriteSheetImage, 48, 32, 16, 16),
      createImageBitmap(SpriteSheetImage, 64, 32, 16, 16),
    ]).then((sprites) => {
      Sprites.carrier = [];
      Sprites.carrier.push(
        sprites[0],
        sprites[1],
        sprites[2],
        sprites[3],
        sprites[4]
      );
      Sprites.battleship = [];
      Sprites.battleship.push(sprites[5], sprites[6], sprites[7], sprites[8]);
      Sprites.cruiser = [];
      Sprites.cruiser.push(sprites[9], sprites[10], sprites[11]);
      Sprites.submarine = [];
      Sprites.submarine.push(sprites[12], sprites[13], sprites[14]);
      Sprites.destroyer = [];
      Sprites.destroyer.push(sprites[15], sprites[16]);
      Sprites.waterTiles = [];
      Sprites.waterTiles.push(sprites[17], sprites[18]);
      Sprites.radarTiles = [];
      Sprites.radarTiles.push(sprites[19], sprites[20]);
      Sprites.damageTiles = [];
      Sprites.damageTiles.push(sprites[21], sprites[22]);
      Sprites.loaded = true;
    });
  });
  return Sprites as ModelSpritesLoaded;
};

export { modelSprites };
export default modelSprites;
