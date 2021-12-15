import updateInfoPosition from "./updateInfoPosition";

class CreateController {
  constructor() {
    this.gameObjects = [];
    this.selectedGameObject = null;
    this.selectedElement = null;
    this.zoomRatio = 1;
    this.objectMoveX = null;
    this.objectMoveY = null;
    this.handMoveX = null;
    this.handMoveY = null;
    this.info = null;
  }

  // GameObjectを追加する
  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
  }

  setInfo(element) {
    this.info = element;
  }

  // 選択中のGameObjectを設定する
  updateSelectedGameObject(element) {
    this.selectedGameObject = this.gameObjects[element.dataset.gameObjectId];
    this.selectedElement = element;
  }

  // ズーム倍率を設定する
  updateZoom(zoomValue) {
    // inputの値からズーム倍率を設定
    this.zoomRatio = zoomValue / 100;
    
    // preview画面を更新する
    this.updatePreview();
  }

  // info欄に入力された値を更新する
  updateInfo(e) {
    let value = e.currentTarget.value;
    let gameObject = this.selectedGameObject;
    let position = gameObject.position;

    // どの要素が更新されたかidで判定する
    // 更新された要素に合わせてgameObjectの値を更新する
    switch(e.currentTarget.id){
      case 'x':
        position.x = parseFloat(value);
        break
      case 'y':
        position.y = parseFloat(value);
        break
      case 'width':
        position.width = parseFloat(value);
        break
      case 'height':
        position.height = parseFloat(value);
        break
      case 'script_select':
        gameObject.script = value;
        break
    }

    // preview画面を更新する
    this.updatePreview();
  }

  // ObjectMoveの移動量を設定する
  updateObjectMove(x, y) {
    // gameObjectのpositionを更新する
    // x, yはズーム倍率を除いた値に変換する
    let position = this.selectedGameObject.position;
    position.x = position.x + (x / this.zoomRatio);
    position.y = position.y + (y / this.zoomRatio);

    // preview画面を更新する
    this.updatePreview();
  }

  // positionの値を四捨五入する
  // mousemoveごとに四捨五入すると誤差が大きくなるため、mouseupにのみ使う
  finishObjectMove() {
    // 小数点以下を四捨五入した値に設定する
    let position = this.selectedGameObject.position;
    position.x = Math.round(position.x);
    position.y = Math.round(position.y);

    // preview画面を更新する
    this.updatePreview();
  }

  // HandMoveの移動量を設定する
  updateHandMove(x, y) {
    // HandMoveの移動量を設定する
    this.handMoveX = this.handMoveX + x;
    this.handMoveY = this.handMoveY + y;

    // preview画面を更新する
    this.updatePreview();
  }

  // HandMoveの値を四捨五入する
  // mousemoveごとに四捨五入すると誤差が大きくなるため、mouseupにのみ使う
  finishHandMove() {
    // 小数点以下を四捨五入した値に設定する
    this.handMoveX = Math.round(this.handMoveX);
    this.handMoveY = Math.round(this.handMoveY);

    // preview画面を更新する
    this.updatePreview();
  }

  // preview画面の画像の位置、サイズを更新する
  updatePreview() {
    // img要素の更新
    // img要素を取得
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

    // info欄の更新
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
      // mousemoveしている間、実際のpositionの値はfloat型で計算するが、見栄えのため表示上は小数点以下を四捨五入する
      x.value = Math.round(position.x);
      y.value = Math.round(position.y);
      width.value = Math.round(position.width);
      height.value = Math.round(position.height);
      script.selectedIndex = scriptIndex[gameObject.script];
      updateInfoPosition(this.selectedElement);
      this.info.style.visibility = 'visible';
    }
    else {
      this.info.style.visibility = 'hidden';
    }
  }
}

// create関連のjsをまとめて処理するため、シングルトンとして扱う
const createController = new CreateController();
export default createController;