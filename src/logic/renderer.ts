const renderer = (ctx: CanvasRenderingContext2D) => {
  function render(): void {
    //!
    _clearCanvas();
    ctx.imageSmoothingEnabled = false;
  }
  function reRender(): void {
    //!
  }

  function _clearCanvas(): void {
    //!
    ctx.clearRect(0, 0, 1, 1);
  }

  return {
    render,
    reRender,
  };
};

export default renderer;
