declare module "*.png";

type CanvasData = {
  orientation: "portrait" | "landscape";
  width: number;
  height: number;
};

type ModelSprites = {
  loaded: boolean;
  reticule: Array<ImageBitmap>;
  carrier: Array<ImageBitmap>;
  battleship: Array<ImageBitmap>;
  cruiser: Array<ImageBitmap>;
  submarine: Array<ImageBitmap>;
  destroyer: Array<ImageBitmap>;
  waterTiles: Array<ImageBitmap>;
  radarTiles: Array<ImageBitmap>;
  damageTiles: Array<ImageBitmap>;
  highlightTiles: Array<ImageBitmap>;
  appearingTiles: Array<ImageBitmap>;
  altHighlightTiles: Array<ImageBitmap>;
  abilities: Array<ImageBitmap>;
  buttonTiles: {
    green: Array<ImageBitmap>;
    red: Array<ImageBitmap>;
  };
};
type TextSprites = {
  loaded: boolean;
} & { [key in validTextSpriteAccessor]: ImageBitmap };

type validTextSpriteAccessor =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "("
  | ")"
  | "!"
  | "."
  | ","
  | ":"
  | ";"
  | "?"
  | "'";
