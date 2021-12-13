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

  // GameObjectを追加する
  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
  }

  // ズーム倍率を設定する
  setZoom(zoomValue) {
    // inputの値からズーム倍率を設定
    this.zoomRatio = zoomValue / 100;
    
    // preview画面を更新する
    this.updatePreview();
  }

  // info欄に入力された値を更新する
  setInfo(e) {
    let value = parseFloat(e.currentTarget.value);
    let gameObject = this.selectedGameObject;
    let position = gameObject.position;

    // どの要素が更新されたかidで判定する
    // 更新された要素に合わせてgameObjectの値を更新する
    switch(e.currentTarget.id){
      case 'x':
        position.x = value;
        break
      case 'y':
        position.y = value;
        break
      case 'width':
        position.width = value;
        break
      case 'height':
        position.height = value;
        break
      case 'role_select':
        gameObject.script = value;
        break
    }

    // preview画面を更新する
    this.updatePreview();
  }

  // HandMoveの移動量を設定する
  setHandMove(x, y) {
    // gameObjectのpositionを更新する
    // x, yはズーム倍率を除いた値に変換する
    let position = this.selectedGameObject.position;
    position.x = position.x + (x / this.zoomRatio);
    position.y = position.y + (y / this.zoomRatio);

    // preview画面を更新する
    this.updatePreview();

    // info欄を更新する
    this.updateInfo();
  }

  // preview画面の画像の位置、サイズを更新する
  updatePreview() {
    // preview画面の画像要素を取得
    let images = document.querySelectorAll('.preview-image');

    if(this.gameObjects != null && images != null){
      // 全ての画像を更新する
      images.forEach( (image) => {
        // 画像要素のdata属性からgameObjectのidを指定する
        let position = this.gameObjects[image.dataset.gameObjectId].position;

        // 位置、サイズを更新する
        image.style.left = ((position.x - (700 / 2)) * this.zoomRatio + (700 / 2)).toString() + "px";
        image.style.top = ((position.y - (495 / 2)) * this.zoomRatio + (495 / 2)).toString() + "px";
        image.style.width = (position.width * this.zoomRatio).toString() + "px";
        image.style.height = (position.height * this.zoomRatio).toString() + "px";
      });
    }
  }

  // Info欄を更新する
  updateInfo() {
    let scriptIndex = {object: 0, player: 1, enemy: 2, item: 3, goal: 3};

    let image = document.getElementById('info_image');
    let x = document.getElementById('x');
    let y = document.getElementById('y');
    let width = document.getElementById('width');
    let height = document.getElementById('height');
    let script = document.getElementById('script_select');

    if(this.selectedGameObject != null) {
      let gameObject = this.selectedGameObject;
      let position = gameObject.position;

      image.src = gameObject.image;
      x.value = position.x;
      y.value = position.y;
      width.value = position.width;
      height.value = position.height;
      script.selectedIndex = scriptIndex[gameObject.script]; 
    }
    else {
      image.src = "";
      x.value = null;
      y.value = null;
      width.value = null;
      height.value = null;
      script.selectedIndex = scriptIndex[0];
    }
  }
}

// create関連のjsをまとめて処理するため、シングルトンとして扱う
const createController = new CreateController();
export default createController;