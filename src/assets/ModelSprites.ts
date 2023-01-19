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
      //Reticule
      createImageBitmap(SpriteSheetImage, 64, 16, 16, 16),
      //Highlight Tiles
      createImageBitmap(SpriteSheetImage, 48, 80, 16, 16),
      createImageBitmap(SpriteSheetImage, 64, 80, 16, 16),
      //Button Tiles
      //Green
      createImageBitmap(SpriteSheetImage, 0, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 1, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 2, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 3, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 4, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 5, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 6, 80, 1, 16),
      //Red
      createImageBitmap(SpriteSheetImage, 9, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 10, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 11, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 12, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 13, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 14, 80, 1, 16),
      createImageBitmap(SpriteSheetImage, 15, 80, 1, 16),
    ]).then((sprites) => {
      Sprites.carrier = [
        sprites[0],
        sprites[1],
        sprites[2],
        sprites[3],
        sprites[4],
      ];
      Sprites.battleship = [sprites[5], sprites[6], sprites[7], sprites[8]];
      Sprites.cruiser = [sprites[9], sprites[10], sprites[11]];
      Sprites.submarine = [sprites[12], sprites[13], sprites[14]];
      Sprites.destroyer = [sprites[15], sprites[16]];
      Sprites.waterTiles = [sprites[17], sprites[18]];
      Sprites.radarTiles = [sprites[19], sprites[20]];
      Sprites.damageTiles = [sprites[21], sprites[22]];
      Sprites.reticule = sprites[23];
      Sprites.highlightTiles = [sprites[24], sprites[25]];
      Sprites.buttonTiles = {
        green: [
          sprites[26],
          sprites[27],
          sprites[28],
          sprites[29],
          sprites[30],
          sprites[31],
          sprites[32],
        ],
        red: [
          sprites[33],
          sprites[34],
          sprites[35],
          sprites[36],
          sprites[37],
          sprites[38],
          sprites[39],
        ],
      };
      Sprites.loaded = true;
    });
  });
  return Sprites as ModelSpritesLoaded;
};

export { modelSprites };
export default modelSprites;
