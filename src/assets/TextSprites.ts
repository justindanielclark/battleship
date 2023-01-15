import SpriteSheet from "./Spritesheet-Text.png";

const textSprites = (): TextSpritesLoaded => {
  const Sprites: TextSprites = {
    loaded: false,
  };
  const textSpriteSheetImage = new Image();
  textSpriteSheetImage.src = SpriteSheet;
  textSpriteSheetImage.addEventListener("load", () => {
    Promise.all([
      //A-Z
      createImageBitmap(textSpriteSheetImage, 8, 16, 8, 8), //A
      createImageBitmap(textSpriteSheetImage, 16, 16, 8, 8), //B
      createImageBitmap(textSpriteSheetImage, 24, 16, 8, 8), //C
      createImageBitmap(textSpriteSheetImage, 32, 16, 8, 8), //D
      createImageBitmap(textSpriteSheetImage, 40, 16, 8, 8), //E
      createImageBitmap(textSpriteSheetImage, 48, 16, 8, 8), //F
      createImageBitmap(textSpriteSheetImage, 56, 16, 8, 8), //G
      createImageBitmap(textSpriteSheetImage, 64, 16, 8, 8), //H
      createImageBitmap(textSpriteSheetImage, 72, 16, 8, 8), //I
      createImageBitmap(textSpriteSheetImage, 80, 16, 8, 8), //J
      createImageBitmap(textSpriteSheetImage, 88, 16, 8, 8), //K
      createImageBitmap(textSpriteSheetImage, 96, 16, 8, 8), //L
      createImageBitmap(textSpriteSheetImage, 104, 16, 8, 8), //M
      createImageBitmap(textSpriteSheetImage, 112, 16, 8, 8), //N
      createImageBitmap(textSpriteSheetImage, 120, 16, 8, 8), //O
      createImageBitmap(textSpriteSheetImage, 0, 24, 8, 8), //P
      createImageBitmap(textSpriteSheetImage, 8, 24, 8, 8), //Q
      createImageBitmap(textSpriteSheetImage, 16, 24, 8, 8), //R
      createImageBitmap(textSpriteSheetImage, 24, 24, 8, 8), //S
      createImageBitmap(textSpriteSheetImage, 32, 24, 8, 8), //T
      createImageBitmap(textSpriteSheetImage, 40, 24, 8, 8), //U
      createImageBitmap(textSpriteSheetImage, 48, 24, 8, 8), //V
      createImageBitmap(textSpriteSheetImage, 56, 24, 8, 8), //W
      createImageBitmap(textSpriteSheetImage, 64, 24, 8, 8), //X
      createImageBitmap(textSpriteSheetImage, 72, 24, 8, 8), //Y
      createImageBitmap(textSpriteSheetImage, 80, 24, 8, 8), //Z
      //a-z
      createImageBitmap(textSpriteSheetImage, 8, 32, 8, 8), //a
      createImageBitmap(textSpriteSheetImage, 16, 32, 8, 8), //b
      createImageBitmap(textSpriteSheetImage, 24, 32, 8, 8), //c
      createImageBitmap(textSpriteSheetImage, 32, 32, 8, 8), //d
      createImageBitmap(textSpriteSheetImage, 40, 32, 8, 8), //e
      createImageBitmap(textSpriteSheetImage, 48, 32, 8, 8), //f
      createImageBitmap(textSpriteSheetImage, 56, 32, 8, 8), //g
      createImageBitmap(textSpriteSheetImage, 64, 32, 8, 8), //h
      createImageBitmap(textSpriteSheetImage, 72, 32, 8, 8), //i
      createImageBitmap(textSpriteSheetImage, 80, 32, 8, 8), //j
      createImageBitmap(textSpriteSheetImage, 88, 32, 8, 8), //k
      createImageBitmap(textSpriteSheetImage, 96, 32, 8, 8), //l
      createImageBitmap(textSpriteSheetImage, 104, 32, 8, 8), //m
      createImageBitmap(textSpriteSheetImage, 112, 32, 8, 8), //n
      createImageBitmap(textSpriteSheetImage, 120, 32, 8, 8), //o
      createImageBitmap(textSpriteSheetImage, 0, 40, 8, 8), //p
      createImageBitmap(textSpriteSheetImage, 8, 40, 8, 8), //q
      createImageBitmap(textSpriteSheetImage, 16, 40, 8, 8), //r
      createImageBitmap(textSpriteSheetImage, 24, 40, 8, 8), //s
      createImageBitmap(textSpriteSheetImage, 32, 40, 8, 8), //t
      createImageBitmap(textSpriteSheetImage, 40, 40, 8, 8), //u
      createImageBitmap(textSpriteSheetImage, 48, 40, 8, 8), //v
      createImageBitmap(textSpriteSheetImage, 56, 40, 8, 8), //w
      createImageBitmap(textSpriteSheetImage, 64, 40, 8, 8), //x
      createImageBitmap(textSpriteSheetImage, 72, 40, 8, 8), //y
      createImageBitmap(textSpriteSheetImage, 80, 40, 8, 8), //z
      //0-9
      createImageBitmap(textSpriteSheetImage, 0, 8, 8, 8), //0
      createImageBitmap(textSpriteSheetImage, 8, 8, 8, 8), //1
      createImageBitmap(textSpriteSheetImage, 16, 8, 8, 8), //2
      createImageBitmap(textSpriteSheetImage, 24, 8, 8, 8), //3
      createImageBitmap(textSpriteSheetImage, 32, 8, 8, 8), //4
      createImageBitmap(textSpriteSheetImage, 40, 8, 8, 8), //5
      createImageBitmap(textSpriteSheetImage, 48, 8, 8, 8), //6
      createImageBitmap(textSpriteSheetImage, 56, 8, 8, 8), //7
      createImageBitmap(textSpriteSheetImage, 64, 8, 8, 8), //8
      createImageBitmap(textSpriteSheetImage, 72, 8, 8, 8), //9
      //Punctuation
      createImageBitmap(textSpriteSheetImage, 64, 0, 8, 8), //(
      createImageBitmap(textSpriteSheetImage, 72, 0, 8, 8), //)
      createImageBitmap(textSpriteSheetImage, 8, 0, 8, 8), // exclamation!
      createImageBitmap(textSpriteSheetImage, 112, 0, 8, 8), //.
      createImageBitmap(textSpriteSheetImage, 96, 0, 8, 8), //,
      createImageBitmap(textSpriteSheetImage, 80, 8, 8, 8), //:
      createImageBitmap(textSpriteSheetImage, 88, 8, 8, 8), //;
      createImageBitmap(textSpriteSheetImage, 120, 8, 8, 8), // questionmark ?
    ]).then((sprites) => {
      Sprites["A"] = sprites[0];
      Sprites["B"] = sprites[1];
      Sprites["C"] = sprites[2];
      Sprites["D"] = sprites[3];
      Sprites["E"] = sprites[4];
      Sprites["F"] = sprites[5];
      Sprites["G"] = sprites[6];
      Sprites["H"] = sprites[7];
      Sprites["I"] = sprites[8];
      Sprites["J"] = sprites[9];
      Sprites["K"] = sprites[10];
      Sprites["L"] = sprites[11];
      Sprites["M"] = sprites[12];
      Sprites["N"] = sprites[13];
      Sprites["O"] = sprites[14];
      Sprites["P"] = sprites[15];
      Sprites["Q"] = sprites[16];
      Sprites["R"] = sprites[17];
      Sprites["S"] = sprites[18];
      Sprites["T"] = sprites[19];
      Sprites["U"] = sprites[20];
      Sprites["V"] = sprites[21];
      Sprites["W"] = sprites[22];
      Sprites["X"] = sprites[23];
      Sprites["Y"] = sprites[24];
      Sprites["Z"] = sprites[25];
      Sprites["a"] = sprites[26];
      Sprites["b"] = sprites[27];
      Sprites["c"] = sprites[28];
      Sprites["d"] = sprites[29];
      Sprites["e"] = sprites[30];
      Sprites["f"] = sprites[31];
      Sprites["g"] = sprites[32];
      Sprites["h"] = sprites[33];
      Sprites["i"] = sprites[34];
      Sprites["j"] = sprites[35];
      Sprites["k"] = sprites[36];
      Sprites["l"] = sprites[37];
      Sprites["m"] = sprites[38];
      Sprites["n"] = sprites[39];
      Sprites["o"] = sprites[40];
      Sprites["p"] = sprites[41];
      Sprites["q"] = sprites[42];
      Sprites["r"] = sprites[43];
      Sprites["s"] = sprites[44];
      Sprites["t"] = sprites[45];
      Sprites["u"] = sprites[46];
      Sprites["v"] = sprites[47];
      Sprites["w"] = sprites[48];
      Sprites["x"] = sprites[49];
      Sprites["y"] = sprites[50];
      Sprites["z"] = sprites[51];
      Sprites["0"] = sprites[52];
      Sprites["1"] = sprites[53];
      Sprites["2"] = sprites[54];
      Sprites["3"] = sprites[55];
      Sprites["4"] = sprites[56];
      Sprites["5"] = sprites[57];
      Sprites["6"] = sprites[58];
      Sprites["7"] = sprites[59];
      Sprites["8"] = sprites[60];
      Sprites["9"] = sprites[61];
      Sprites["("] = sprites[62];
      Sprites[")"] = sprites[63];
      Sprites["!"] = sprites[64];
      Sprites["."] = sprites[65];
      Sprites[","] = sprites[66];
      Sprites[":"] = sprites[67];
      Sprites[";"] = sprites[68];
      Sprites["?"] = sprites[69];
      Sprites.loaded = true;
    });
  });
  return Sprites as TextSpritesLoaded;
};

export { textSprites };
export default textSprites;
