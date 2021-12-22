import updateInfoPosition from "./updateInfoPosition";

class CreateController {
  constructor() {
    this.presetGameObjects = [];
    this.gameObjects = [];
    this.selectedGameObject = null;
    this.selectedElement = null;
    this.zoomRatio = 1;
    this.handMoveX = null;
    this.handMoveY = null;
    this.info = null;
    this.imageList = null;
    this.mode = {updateImage : 1, newGameObject : 2};
    this.currentMode = null;
  }

  setInfo(element) {
    this.info = element;
  }

  setImageList(element) {
    this.imageList = element;
  }

  // プリセットのGameObjectのグループを追加する
  setPresetGameObjects(json) {
    this.presetGameObjects = json;
    this.presetGameObjects.forEach(gameObjects => {
      let groupeName = gameObjects.groupe;
      this.addImageListGroupe(groupeName);
      gameObjects.game_objects.forEach(gameObject => {
        this.addImageList(groupeName, gameObject)
      });
    });

    // 画像リストに画像アップロードボタンを移動
    const stageLabel = document.getElementById('stage_label');
    const imageCardsUpload = document.getElementById('image_cards_upload');
    imageCardsUpload.appendChild(stageLabel);
    stageLabel.classList.remove('hidden');
  }

  // プリセットのGameObjectを追加する
  addPresetGameObject(groupeName, gameObject) {
    this.presetGameObjects.find(groupe => groupe.name === groupeName).push(gameObject);
  }

  // GameObjectを追加する
  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
  }

  // 画像選択モーダルのモードを新規作成か画像変更か設定する
  updateMode(mode) {
    this.currentMode = mode;
    let newGO = document.getElementById('submit_text_new');
    let changeImage = document.getElementById('submit_text_change');

    // 画像選択モーダルの決定ボタンの表示を変更する
    if (mode == this.mode.updateImage){
      changeImage.classList.remove('hidden');
      newGO.classList.add('hidden');
    }
    else if (mode == this.mode.newGameObject){
      newGO.classList.remove('hidden');
      changeImage.classList.add('hidden');
    }
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

  updateInfoImage(image) {
    this.selectedGameObject.image = image;
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

        image.src = gameObject.image;
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

      image.src = gameObject.image;
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
  
  addImageListGroupe(groupe_name) {
    let div = document.createElement('div');
    let variableName = groupe_name.column;
    let indexName = groupe_name.index;

    let groupeListHtml =
    `<li class='image-groupe' id='image_groupe_${variableName}'>
      <div class='groupe-name' id='groupe_name_${variableName}'>
        ${indexName}
      </div>
      <div class='image-cards' id='image_cards_${variableName}'>
      </div>
    </li>`;

    div.innerHTML = groupeListHtml;
    this.imageList.appendChild(div);
  }

  addImageList(groupeName, gameObject) {
    let div = document.createElement('div');
    let cardContainer = document.getElementById('image_cards_' + groupeName.column);

    let imageCardHtml =
    `<div class='image-card'>
    <img src='data:image/${gameObject.image.type};base64,${gameObject.image.base64}' class='gameobject-image'>
    <div class='image-name'></div>
      <div class='image-delete-button-wrapper'>
        <div class='image-delete-button'>x</div>
      </div>
    </div>`;

    div.innerHTML = imageCardHtml;
    cardContainer.appendChild(div);
  }
}

// create関連のjsをまとめて処理するため、シングルトンとして扱う
const createController = new CreateController();
export default createController;