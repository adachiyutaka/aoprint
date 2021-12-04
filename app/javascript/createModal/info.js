import CreateController from './createController';

const info = () => {
  
  // info欄のエレメントを取得
  const infoX = document.getElementById('x');
  const infoY = document.getElementById('y');
  const infoWidth = document.getElementById('width');
  const infoHeight = document.getElementById('height');
  const infoScript = document.getElementById('role_select');

  // info欄のエレメントが変更された際に、GUIを更新するリスナーを設定
  infoX.addEventListener('input', (e) => updateValue(e));
  infoY.addEventListener('input', (e) => updateValue(e));
  infoWidth.addEventListener('input', (e) => updateValue(e));
  infoHeight.addEventListener('input', (e) => updateValue(e));
  infoHeight.addEventListener('input', (e) => updateValue(e));
  infoScript.addEventListener('change', (e) => updateValue(e));

  // info欄が更新された際にGUI内の該当するオブジェクトの描画位置を更新する
  const updateValue = (e) => {
    // let image = document.querySelector('.selected');
    // どの要素が更新されたかidで判定する
    let value = e.currentTarget.value;

    let gameObject = gameObjects[image.dataset.gameObjectId];
    let position = gameObject.position;
    
    // 更新された要素に合わせてgameObjectの値を更新する
    switch(e.currentTarget.id){
      case 'x':
        position.x = value;
        // image.style.left = position.previewSize('x').toString() + 'px';
        // image.style.left = position.x.toString() + 'px';
        break
      case 'y':
        position.y = value;
        // image.style.top = position.previewSize('y').toString() + 'px';
        // image.style.top = position.y.toString() + 'px';
        break
      case 'width':
        position.width = value;
        // image.style.width = position.previewSize('width').toString() + 'px';
        // image.style.width = position.width.toString() + 'px';
        break
      case 'height':
        position.height = value;
        // image.style.height = position.previewSize('height').toString() + 'px';
        // image.style.height = position.height.toString() + 'px';
        break
      case 'role_select':
        gameObject.script = value;
        break
    }

    // preview画面を更新する
    CreateController.updatePreview();
  }
}

window.addEventListener('load', info);