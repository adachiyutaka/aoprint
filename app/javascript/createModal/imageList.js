import CreateController from './createController';

const imageList = () => {
  // イメージ選択モーダルと表示/非表示する要素
  const imageList = document.getElementById('image_list');
  const background = document.getElementById('modal_background');
  const info = document.getElementById('info_image');
  const imageButton = document.getElementById('add_object_btn');
  const imageModal = document.getElementById('image_modal');
  const imageExitButton = document.getElementById('image_exit_btn');
  const imageBackground = document.getElementById('image_modal_background');
  const submitButton = document.getElementById('image_submit_btn');

  // CreateControllerにImageList要素をセット
  CreateController.setImageList(imageList);

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

  loadGameObjects();
}

const loadGameObjects = () => {
  // 非同期での画像読み込み処理
  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    alert('中断 :( XMLHTTP インスタンスを生成できませんでした');
    return false;
  }

  const token = document.getElementsByName('csrf-token')[0].content;
  let data = {"game_object": {"groupe_name": null, "init": false}};

  // 通信に成功した場合、帰ってきたJSONをCreateControllerのpresetGameObjectsにセットする
  const alertContents = () => {
    try {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          CreateController.setPresetGameObjects(httpRequest.response);
          console.log("httpRequest.response[1].groupe.column;", httpRequest.response[1].groupe.column);
          console.log("httpRequest.response;", httpRequest.response);
        } else {
          alert('リクエストに問題が発生しました');
        }
      }
    }
    catch( e ) {
      alert('例外を捕捉: ' + e.description);
    }
  }

  httpRequest.onreadystatechange = alertContents;
  httpRequest.open('POST', '/games/load_game_object/');
  httpRequest.responseType = "json";
  httpRequest.setRequestHeader("Content-Type", "application/json");
  httpRequest.setRequestHeader("X-CSRF-Token", token);
  data.game_object.init = true;
  httpRequest.send(JSON.stringify(data));
  data.game_object.init = false;
}

window.addEventListener('load', imageList);