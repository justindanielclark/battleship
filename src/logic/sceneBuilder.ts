import Point from "./data_storage/Point";

type drawableObj = {
  img: ImageBitmap;
  loc: Point;
  options: {
    rotation: number;
    transformed: boolean;
  };
};
type SceneMap = Map<string, Array<drawableObj>>;
type Scene = Array<Array<drawableObj>>;
type SceneBuilder = {
  addImgToScene(
    zIndex: number,
    img: ImageBitmap,
    loc: Point,
    options?: {
      rotation: number;
      transformed: boolean;
    }
  ): void;
  getScene(): Scene;
};
const sceneBuilder = (): SceneBuilder => {
  const _self: SceneMap = new Map();
  function addImgToScene(
    zIndex: number,
    img: ImageBitmap,
    loc: Point,
    options: { rotation: number; transformed: boolean } = {
      rotation: 0,
      transformed: false,
    }
  ): void {
    if (!_self.get(zIndex.toString())) {
      _self.set(zIndex.toString(), []);
    }
    const newArray = _self.get(zIndex.toString());
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newArray!.push({ img, loc, options });
  }
  function getScene(): Scene {
    const returnScene: Scene = [];
    const keys = Array.from(_self.keys());
    const sortedKeys = keys.sort((a, b): number => {
      return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
    sortedKeys.forEach((key) => {
      returnScene.push([]);
      const lastArray = returnScene.length - 1;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _self.get(key)!.forEach((drawObj) => {
        returnScene[lastArray].push(drawObj);
      });
    });
    return returnScene;
  }
  return {
    addImgToScene,
    getScene,
  };
};

export { sceneBuilder, Scene, SceneBuilder, drawableObj };
export default sceneBuilder;
