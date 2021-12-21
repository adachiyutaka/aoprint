import CreateController from './createController';

const imageList = () => {
  // イメージ選択モーダルと表示/非表示する要素
  const background = document.getElementById('modal_background');
  const info = document.getElementById('info_image');
  const imageButton = document.getElementById('add_object_btn');
  const imageModal = document.getElementById('image_modal');
  const imageExitButton = document.getElementById('image_exit_btn');
  const imageBackground = document.getElementById('image_modal_background');
  const submitButton = document.getElementById('image_submit_btn');

  // 画像リストの画像をクリックできるようにリスナーを設定
  let gameObjectImages = Array.from(document.querySelectorAll('.gameobject-image'));
  gameObjectImages.forEach( (image) => {
    image.addEventListener('click', (e) => addSelected(e.currentTarget));
  });

  // 選択したimg要素の輪郭を表示するための'selected'クラス操作
  const addSelected = (element) => {
    // 全ての要素の"selected"クラスを外す
    removeSelected();

    // 選択された要素に"selected"クラスを付ける
    element.classList.add('selected');
  }

  const removeSelected = () => {
    // 全ての要素の"selected"クラスを外す
    let selectedElements = Array.from(document.querySelectorAll('.gameobject-image'));
    selectedElements.forEach( (Element) => {
      Element.classList.remove('selected');
    });
  }

  // イメージ選択モーダルの表示
  const imageDisplay = () => {
    CreateController.updateMode(CreateController.mode.newGameObject);
    
    imageModal.style.display = 'block';
    imageBackground.style.display = 'block';
    background.style.display = 'none';
  }

  // イメージ選択モーダルを非表示にする
  const imageExit = () => {
    imageModal.style.display = 'none';
    imageBackground.style.display = 'none';
    background.style.display = 'block';
  }

  const submit = () => {
    let image;
    image = document.getElementsByClassName('gameobject-image selected')[0].src;

    if (CreateController.currentMode == CreateController.mode.updateImage){
      CreateController.updateInfoImage(image);
    }
    else if (CreateController.currentMode == CreateController.mode.newGameObject){
    }
  }

  // イメージ選択モーダルの表示
  // GameObject新規作成ボタンと、info画像変更ボタンの2通りがある
  info.addEventListener('click', imageDisplay);
  imageButton.addEventListener('click', imageDisplay);

  // イメージ選択モーダルの非表示  
  imageBackground.addEventListener('click', imageExit);
  imageExitButton.addEventListener('click', imageExit);

  submitButton.addEventListener('click', () => {
    submit();
    imageExit();
  });

  // 非同期での画像読み込み処理
  var httpRequest;
  const token = document.getElementsByName('csrf-token')[0].content;
  let data = {"game_object": {"groupe_name": null, "init": false}};
  // makeRequest();

  loadGameObjects();

  function makeRequest() {
    // let element = e.currentTarget;
    // let name = element.dataset.groupe;
    // let id = CreateController.gameObjects;
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      alert('中断 :( XMLHTTP インスタンスを生成できませんでした');
      return false;
    }
    httpRequest.onreadystatechange = alertContents;
    httpRequest.open('POST', '/games/game_object/');
    httpRequest.responseType = "json";
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.setRequestHeader("X-CSRF-Token", token);
    // data.name = "データの名前";
    // data.id = 1;
    httpRequest.send(JSON.stringify(data));
  }

  function loadGameObjects() {
    httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      alert('中断 :( XMLHTTP インスタンスを生成できませんでした');
      return false;
    }
    httpRequest.onreadystatechange = alertContents;
    httpRequest.open('POST', '/games/game_object/');
    httpRequest.responseType = "json";
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.setRequestHeader("X-CSRF-Token", token);
    data.game_object.init = true;
    httpRequest.send(JSON.stringify(data));
    data.game_object.init = false;
  }

  function alertContents() {
    try {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          console.log("response json:", httpRequest.response);
          let img = document.createElement("img");
          let base64 = httpRequest.response.base64;
          let type = httpRequest.response.type;
          let imgURL = `data:image/${type};base64,` + base64;
          img.src = imgURL;
          document.getElementById('div1').appendChild(img);
        } else {
          alert('リクエストに問題が発生しました');
        }
      }
    }
    catch( e ) {
      alert('例外を捕捉: ' + e.description);
    }
  }
}

window.addEventListener('load', imageList);