const canvas = () => {
  const _self = document.createElement("canvas");
  const _data: CanvasData = {
    orientation: "portrait",
    width: 0,
    height: 0,
  };
  function getCanvasData(): CanvasData {
    return _data;
  }
  function getHTMLCanvasElement(): HTMLCanvasElement {
    return _self;
  }
  function get2dRenderingContext(): CanvasRenderingContext2D {
    const renderingContext = _self.getContext("2d");
    if (
      !renderingContext ||
      !(renderingContext instanceof CanvasRenderingContext2D)
    ) {
      throw new Error("Unable to retrieve CanvasRenderingContext2D");
    }
    return renderingContext;
  }
  function _updateCanvasData(): void {
    let greater;
    let lesser;
    if (window.innerHeight > window.innerWidth) {
      ({ innerHeight: greater, innerWidth: lesser } = window);
      _data.orientation = "portrait";
    } else {
      ({ innerHeight: lesser, innerWidth: greater } = window);
      _data.orientation = "landscape";
    }
    while (lesser % 3 !== 0) {
      lesser--;
    }
    if ((lesser * 4) / 3 > greater) {
      while (greater % 4 !== 0) {
        greater--;
      }
      lesser = (greater * 3) / 4;
    } else {
      greater = (lesser / 3) * 4;
    }
    if (_data.orientation === "portrait") {
      _data.height = greater;
      _data.width = lesser;
    } else {
      _data.width = greater;
      _data.height = lesser;
    }
  }
  function _updateSize(): void {
    _self.height = _data.height;
    _self.width = _data.width;
  }
  function update(): void {
    _updateCanvasData();
    _updateSize();
  }
  return {
    get2dRenderingContext,
    getHTMLCanvasElement,
    getCanvasData,
    update,
  };
};

export { canvas };
export default canvas;
