class CreateController {
  constructor() {
    this.gameObjects = [];
    this.zoomRatio = null;
    this.zoomPositionX = null;
    this.zoomPositionX = null;
    this.handMoveX = null;
    this.handMoveY = null;
    this.viewPositionX = null;
    this.viewPositionY = null;
  }

  setZoom(zoomValue) {
    // inputの値からズーム倍率を設定
    this.zoomRatio = zoomValue / 100;
    // preview画面の中央（縦横pixelの半分）を中心にズーム
    // this.zoomPositionX = - ((1 - this.zoomRatio) * (700 / 2));
    // this.zoomPositionY = - ((1 - this.zoomRatio) * (495 / 2));

    this.zoomPositionX = 0;
    this.zoomPositionY = 0;

    // this.zoomPositionX = - ((1 - this.zoomRatio) * (this.viewPositionX + this.handMoveX + (700 / 2)));
    // this.zoomPositionY = - ((1 - this.zoomRatio) * (this.viewPositionY + this.handMoveY + (495 / 2)));
    // preview画面を更新する
    this.updatePreview();
  }

  setHandMove(x, y) {
    this.handMoveX = -x / this.zoomRatio;
    this.handMoveY = -y / this.zoomRatio;
    this.updatePreview();
  }

  setViewPosition(x, y) {
    this.viewPositionX += this.handMoveX;
    this.viewPositionY += this.handMoveY;
    this.handMoveX = 0;
    this.handMoveY = 0;
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
        // image.style.left = ((position.modifyScale('x') * this.zoomRatio) - this.handMoveX - this.viewPositionX - this.zoomPositionX).toString() + "px";
        // image.style.top = ((position.modifyScale('y') * this.zoomRatio) - this.handMoveY - this.viewPositionY - this.zoomPositionY).toString() + "px";
        image.style.width = (position.modifyScale('width') * this.zoomRatio).toString() + "px";
        image.style.height = (position.modifyScale('height') * this.zoomRatio).toString() + "px";
      });
    }
  }
}

// create関連のjsをまとめて処理するため、シングルトンとして扱う
export default new CreateController();