class CreateController {
  constructor() {
    this.gameObjects = [];
    this.zoomRatio = null;
    this.moveX = null;
    this.moveY = null;
  }

  setZoom(zoomValue) {
    // inputの値からズーム倍率を設定
    this.zoomRatio = zoomValue / 100;
    // preview画面の中央（縦横pixelの半分）を中心にズーム
    this.moveX = - ((1 - this.zoomRatio) * (700 / 2));
    this.moveY = - ((1 - this.zoomRatio) * (495 / 2));
    // preview画面を更新する
    this.updatePreview();
  }

  // preview画面の画像の位置、サイズを更新する
  updatePreview() {
    // preview画面の画像要素を取得
    let images = document.querySelectorAll('.preview-image');

    if(this.gameObjects != null && images != null){
      // 全ての画像を更新する
      images.forEach( (image) => {
        // 画像要素のdata属性からgameObjectのidを指定する
        let position = gameObjects[image.dataset.gameObjectId].position;

        // 位置、サイズを更新する
        image.style.left = ((position.modifyScale('x') * this.zoomRatio) - this.moveX).toString() + "px";
        image.style.top = ((position.modifyScale('y') * this.zoomRatio) - this.moveY).toString() + "px";
        image.style.width = (position.modifyScale('width') * this.zoomRatio).toString() + "px";
        image.style.height = (position.modifyScale('height') * this.zoomRatio).toString() + "px";
      });
    }
  }
}

export default CreateController;