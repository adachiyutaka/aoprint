class CreateController {
  constructor() {
    this.gameObjects = [];
    this.selectedGameObject = null;
    this.zoomRatio = 1;
    this.handMoveX = null;
    this.handMoveY = null;
    this.viewPositionX = null;
    this.viewPositionY = null;
  }

  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
  }

  setZoom(zoomValue) {
    // inputの値からズーム倍率を設定
    this.zoomRatio = zoomValue / 100;
    
    // preview画面を更新する
    this.updatePreview();
  }

  setHandMove(x, y, id) {
    // this.handMoveX = -x / this.zoomRatio;
    // this.handMoveY = -y / this.zoomRatio;

    // gameObjectのpositionを更新する
    // x, yはズーム倍率、プレビュー画面/元画像比率を除いた値に変換する
    let position = this.gameObjects[id].position;
    // position.x = Math.round(position.x + (x / position.xRatio * this.zoomRatio));
    // position.y = Math.round(position.y + (y / position.yRatio * this.zoomRatio));
    // position.x = Math.round(position.x + (x / (this.zoomRatio * position.xRatio)));
    // position.y = Math.round(position.y + (y / (this.zoomRatio * position.yRatio)));
    position.x = Math.round(position.x + (x / this.zoomRatio));
    position.y = Math.round(position.y + (y / this.zoomRatio));

    // preview画面を更新する
    this.updatePreview();

    // info欄を更新する
    this.updateInfo();
  }

  // setViewPosition(x, y) {
    // this.viewPositionX += this.handMoveX;
    // this.viewPositionY += this.handMoveY;
    // this.handMoveX = 0;
    // this.handMoveY = 0;

    // // preview画面を更新する
    // this.updatePreview();
  // }

  // preview画面の画像の位置、サイズを更新する
  updatePreview() {

    // preview画面の画像要素を取得
    let images = document.querySelectorAll('.preview-image');
    console.log(`hand: ${this.handMoveX}, ${this.handMoveY}, view: ${this.viewPositionX}, ${this.viewPositionY}, zoom: ${this.zoomRatio}`);

    if(this.gameObjects != null && images != null){
      // 全ての画像を更新する
      images.forEach( (image) => {
        // 画像要素のdata属性からgameObjectのidを指定する
        let position = this.gameObjects[image.dataset.gameObjectId].position;

        // 位置、サイズを更新する
        // let posX = position.previewSize('x');
        // let posX = position.previewSize('x') - (this.viewPositionX + this.handMoveX);
        // let posY = position.previewSize('y');
        // let posY = position.previewSize('y') - (this.viewPositionY + this.handMoveY);
        
        image.style.left = ((position.x - (700 / 2)) * this.zoomRatio + (700 / 2)).toString() + "px";
        image.style.top = ((position.y - (495 / 2)) * this.zoomRatio + (495 / 2)).toString() + "px";
        image.style.width = (position.width * this.zoomRatio).toString() + "px";
        image.style.height = (position.height * this.zoomRatio).toString() + "px";
        // image.style.left = (position.x * this.zoomRatio + (700 / 2)).toString() + "px";
        // image.style.top = (position.y * this.zoomRatio + (495 / 2)).toString() + "px";
        // image.style.left = (position.x * this.zoomRatio).toString() + "px";
        // image.style.top = (position.y * this.zoomRatio).toString() + "px";
        // image.style.width = (position.width * this.zoomRatio).toString() + "px";
        // image.style.height = (position.height * this.zoomRatio).toString() + "px";
      });
    }

    // // info欄の値を更新する
    // infoX.value = originalX;
    // infoY.value = originalY;
  }

  updateInfo() {
      let gameObject = this.selectedGameObject;
      let position = gameObject.position;
      let roleIndex = {object: 0, player: 1, enemy: 2, item: 3, goal: 3};

      document.getElementById('info_image').src = gameObject.image;
      document.getElementById('x').value = position.x;
      document.getElementById('y').value = position.y;
      document.getElementById('width').value = position.width;
      document.getElementById('height').value = position.height;
      document.getElementById('role_select').selectedIndex = roleIndex[gameObject.script]; 
  }
}

// create関連のjsをまとめて処理するため、シングルトンとして扱う
const createController = new CreateController();
export default createController;