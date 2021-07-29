class CreateController {
  constructor() {
    this.gameObjects = [];
    this.zoomRatio = null;
    this.handMoveX = null;
    this.handMoveY = null;
    this.viewPositionX = null;
    this.viewPositionY = null;
  }

  setZoom(zoomValue) {
    // inputの値からズーム倍率を設定
    this.zoomRatio = zoomValue / 100;

    // preview画面を更新する
    this.updatePreview();
  }

  setHandMove(x, y) {
    this.handMoveX = -x / this.zoomRatio;
    this.handMoveY = -y / this.zoomRatio;

    // preview画面を更新する
    this.updatePreview();
  }

  setViewPosition(x, y) {
    this.viewPositionX += this.handMoveX;
    this.viewPositionY += this.handMoveY;
    this.handMoveX = 0;
    this.handMoveY = 0;

    // preview画面を更新する
    this.updatePreview();
  }

  // preview画面の画像の位置、サイズを更新する
  updatePreview() {
    // preview画面の画像要素を取得
    let images = document.querySelectorAll('.preview-image');
    console.log(`hand: ${this.handMoveX}, ${this.handMoveY}, view: ${this.viewPositionX}, ${this.viewPositionY}`);

    if(this.gameObjects != null && images != null){
      // 全ての画像を更新する
      images.forEach( (image) => {
        // 画像要素のdata属性からgameObjectのidを指定する
        let position = gameObjects[image.dataset.gameObjectId].position;

        // 位置、サイズを更新する
        let posX = position.modifyScale('x') - (this.viewPositionX + this.handMoveX);
        let posY = position.modifyScale('y') - (this.viewPositionY + this.handMoveY);
        
        image.style.left = ((posX - (700 / 2)) * this.zoomRatio + (700 / 2)).toString() + "px";
        image.style.top = ((posY - (495 / 2)) * this.zoomRatio + (495 / 2)).toString() + "px";
        image.style.width = (position.modifyScale('width') * this.zoomRatio).toString() + "px";
        image.style.height = (position.modifyScale('height') * this.zoomRatio).toString() + "px";
      });
    }
  }
}

// create関連のjsをまとめて処理するため、シングルトンとして扱う
export default new CreateController();