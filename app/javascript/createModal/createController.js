import updateInfoPosition from "./updateInfoPosition";
import GameObject from './gameObject.js';

class CreateController {
  constructor() {
    this.presetGOGroups = [];
    this.gameObjects = [];
    this.selectedGameObject = null;
    this.selectedElement = null;
    this.zoomRatio = 1;
    this.handMoveX = null;
    this.handMoveY = null;
    this.info = null;
  }

  setInfo(element) {
    this.info = element;
  }

  // プリセットのGameObjectのグループを追加する
  setPresetGameObjects(json) {
    json.forEach(groupe => {
      // GameObjectを生成し、画像、サイズ、位置データを設定、presetGOGroupsに格納
      let gameObjects = [];
      groupe.gameObjects.forEach(go => {
        let gameObject = new GameObject();
        // PresetのGameObjectにはサイズ、位置情報がない想定のため
        gameObject.setPosition(0, 0, 0, 0);
        gameObject.setImage(go.image.id, go.image.base64url);
        gameObjects.push(gameObject);
      });
      this.presetGOGroups.push({'name': groupe.name, 'gameObjects': gameObjects});
    });
  }

  // プリセットのGameObjectを追加する
  addPresetGameObject(groupeName, gameObject) {
    this.presetGOGroups.find(groupe => groupe.name.column === groupeName.column).push(gameObject);
  }

  // GameObjectを追加する
  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
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
  updateInfoValue(e) {
    console.log("updateInfoValue");
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

  updateInfoImage(base64url) {
    this.selectedGameObject.image.base64url = base64url;
    this.updatePreview();
    this.updateInfoInput();
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

    // info欄を更新する
    this.updateInfoInput();
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

    // info欄を更新する
    this.updateInfoInput();
  }

  // HandMoveの移動量を設定する
  updateHandMove(x, y) {
    // HandMoveの移動量を設定する
    // mouse moveの入力値をpreview画面の倍率に合わせる
    this.handMoveX = this.handMoveX + (x / this.zoomRatio);
    this.handMoveY = this.handMoveY + (y / this.zoomRatio);

    // preview画面を更新する
    this.updatePreview();

    // info欄を更新する
    this.updateInfoInput();
  }

  // HandMoveの値を四捨五入する
  // mousemoveごとに四捨五入すると誤差が大きくなるため、mouseupにのみ使う
  finishHandMove() {
    // 小数点以下を四捨五入した値に設定する
    this.handMoveX = Math.round(this.handMoveX);
    this.handMoveY = Math.round(this.handMoveY);

    // preview画面を更新する
    this.updatePreview();

    // info欄を更新する
    this.updateInfoInput();
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
        let gameObject = this.gameObjects[image.dataset.gameObjectId];
        let position = this.gameObjects[image.dataset.gameObjectId].position;

        // 位置、サイズ、画像を更新する
        // // preview画面の中心位置
        // let previewCenterX = (document.getElementById('preview_container').clientWidth / 2);
        // let previewCenterY = (document.getElementById('preview_container').clientHeight / 2);
        // // ズームの中心にしたい位置（preview画面の中心位置）
        // let zoomCenterX = previewCenterX - this.handMoveX;
        // let zoomCenterY = previewCenterY - this.handMoveY;
        // // GameObjectの位置をズームの中心にしたい座標に置き換えて(- zoomCenterX)から、ズーム倍率をかけ、元の座標にもどし(+ zoomCenterX)、最後にhandMoveの値を足す
        // let left = (position.x - zoomCenterX) * this.zoomRatio + zoomCenterX + this.handMoveX;
        // let top = (position.y - zoomCenterY) * this.zoomRatio + zoomCenterY + this.handMoveY;
        // 上記の計算をまとめたものが以下
        image.style.left = ((position.x - (700 / 2) + this.handMoveX) * this.zoomRatio + (700 / 2)).toString() + "px";
        image.style.top = ((position.y - (495 / 2) + this.handMoveY) * this.zoomRatio + (495 / 2)).toString() + "px";

        image.style.width = (position.width * this.zoomRatio).toString() + "px";
        image.style.height = (position.height * this.zoomRatio).toString() + "px";

        image.src = gameObject.image.base64url;
      });
    }
  }

  updateInfoInput() {
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

      image.src = gameObject.image.base64url;
      // mousemoveしている間、実際のpositionの値はfloat型で計算するが、見栄えのため表示上は小数点以下を四捨五入する
      x.value = Math.round(position.x);
      y.value = Math.round(position.y);
      width.value = Math.round(position.width);
      height.value = Math.round(position.height);
      script.selectedIndex = scriptIndex[gameObject.script];
      updateInfoPosition();
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