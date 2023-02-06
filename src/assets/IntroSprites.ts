import TitleScreenText from "./TitlescreenText.png";
import Oceanbackground from "./Oceanbackground.png";

const IntroSprites = (): IntroSprites => {
  const Sprites: Partial<IntroSprites> = {
    loaded: false,
  };
  const TitleSpriteSheet = new Image();
  TitleSpriteSheet.src = Oceanbackground;
  TitleSpriteSheet.addEventListener("load", () => {
    createImageBitmap(TitleSpriteSheet, 0, 0, 480, 480).then((sprite) => {
      Sprites.background = sprite;
      if (Sprites.text) {
        Sprites.loaded = true;
      } else {
        Sprites.loaded = false;
      }
    });
  });
  const TitleTextSpriteSheet = new Image();
  TitleTextSpriteSheet.src = TitleScreenText;
  TitleTextSpriteSheet.addEventListener("load", () => {
    createImageBitmap(TitleTextSpriteSheet, 0, 0, 380, 70).then((sprite) => {
      Sprites.text = sprite;
      if (Sprites.background) {
        Sprites.loaded = true;
      } else {
        Sprites.loaded = false;
      }
    });
  });

  return Sprites as IntroSprites;
};

export { IntroSprites };
export default IntroSprites;
