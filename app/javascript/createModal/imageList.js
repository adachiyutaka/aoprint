import CreateController from './createController';

const imageList = () => {
  const mode = {updateImage : 1, newGameObject : 2};
  let currentMode = null;

  // イメージ選択モーダルと表示/非表示する要素
  const imageList = document.getElementById('image_list');
  const background = document.getElementById('modal_background');
  const infoImage = document.getElementById('info_image');
  const imageButton = document.getElementById('add_object_btn');
  const imageModal = document.getElementById('image_modal');
  const imageExitButton = document.getElementById('image_exit_btn');
  const imageBackground = document.getElementById('image_modal_background');
  const submitButton = document.getElementById('image_submit_btn');
  const newGO = document.getElementById('submit_text_new');
  const changeImage = document.getElementById('submit_text_change');


  // イメージ選択モーダルの表示
  const imageDisplay = (mode) => {
    // イメージ選択モーダルのsubmitボタンの表示を切り替える
    updateMode(mode);
    // イメージ選択モーダルを表示する
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

  // イメージ選択モーダルのsubmitボタンの処理
  const submit = () => {
    let base64url;
    base64url = document.getElementsByClassName('gameobject-image selected')[0].src;

    if (currentMode == mode.updateImage){
      CreateController.updateInfoImage(base64url);
    }
    else if (currentMode == mode.newGameObject){
    }
  }

  // 画像選択モーダルのモードを新規作成か画像変更か設定する
  const updateMode = (newMode) => {
    currentMode = newMode;

    // 画像選択モーダルの決定ボタンの表示を変更する
    if (currentMode == mode.updateImage){
      changeImage.classList.remove('hidden');
      newGO.classList.add('hidden');
    }
    else if (currentMode == mode.newGameObject){
      newGO.classList.remove('hidden');
      changeImage.classList.add('hidden');
    }
  }

  // イメージ選択モーダルの表示
  // GameObject新規作成ボタンと、info画像変更ボタンの2通りがある
  infoImage.addEventListener('click', () => {imageDisplay(mode.updateImage)});
  imageButton.addEventListener('click', () => {imageDisplay(mode.newGameObject)});

  // イメージ選択モーダルの非表示
  imageBackground.addEventListener('click', imageExit);
  imageExitButton.addEventListener('click', imageExit);

  submitButton.addEventListener('click', () => {
    submit();
    imageExit();
  });


  // 読み込み処理
  // DBからの読み込みを行い、その後、画像リストの要素にリスナーを設定する
  const loadGameObjects = () => {
    // XMLHttpRequestの作成
    const httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      alert('中断 :( XMLHTTP インスタンスを生成できませんでした');
      return false;
    }

    // JSだけでajax通信する場合は、セキュリティトークンを設定する必要がある
    const token = document.getElementsByName('csrf-token')[0].content;

    // リクエストの内容
    // 読み込みたいgroupe_nameを設定するか
    let data = {"gameObject": {"groupeName": null, "init": false}};
  
    // レスポンス中、レスポンス後の処理
    // 通信に成功した場合、帰ってきたJSONをCreateControllerのpresetGameObjectsにセットする
    const alertContents = () => {
      try {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            // 正常にレスポンスが帰ってきた場合
            // PresetGameObjectをセットする
            CreateController.setPresetGameObjects(httpRequest.response);
  
            // 画像リストにGameObjectのgroupeの分類とGameObjectの画像を表示する
            CreateController.presetGOGroups.forEach(groupe => {
              let groupeName = groupe.name;
              addImageListGroupe(groupeName);
              groupe.gameObjects.forEach(gameObject => {
              addImageList(groupeName, gameObject)
              });
            });

            // 画像リストの画像をクリックできるようにリスナーを設定
            let gameObjectImages = Array.from(document.querySelectorAll('.gameobject-image'));
            gameObjectImages.forEach( (image) => {
              image.addEventListener('click', (e) => addSelected(e.currentTarget));
            });
  
            // 画像リストに画像アップロードボタンを移動
            const stageLabel = document.getElementById('stage_label');
            const imageCardsUpload = document.getElementById('image_cards_upload');
            imageCardsUpload.appendChild(stageLabel);
            stageLabel.classList.remove('hidden');
          } else {
            alert('リクエストに問題が発生しました');
          }
        }
      }
      catch( e ) {
        alert('例外を捕捉: ' + e.description);
      }
    }
  
    // リクエストの内容を作成し、送信
    httpRequest.onreadystatechange = alertContents;
    httpRequest.open('POST', '/games/load_game_object/');
    httpRequest.responseType = "json";
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.setRequestHeader("X-CSRF-Token", token);
    data.gameObject.init = true;
    httpRequest.send(JSON.stringify(data));
    data.gameObject.init = false;
  }
  
  const addImageListGroupe = (groupeName) => {
    let div = document.createElement('div');
    let variableName = groupeName.column;
    let indexName = groupeName.index;
  
    let groupeListHtml =
    `<li class='image-groupe' id='image_groupe_${variableName}'>
      <div class='groupe-name' id='groupe_name_${variableName}'>
        ${indexName}
      </div>
      <div class='image-cards' id='image_cards_${variableName}'>
      </div>
    </li>`;
  
    div.innerHTML = groupeListHtml;
    imageList.appendChild(div);
  }
  
  const addImageList = (groupeName, gameObject) => {
    let div = document.createElement('div');
    let cardContainer = document.getElementById('image_cards_' + groupeName.column);
  
    let imageCardHtml =
    `<div class='image-card'>
    <img src='${gameObject.image.base64url}' class='gameobject-image'>
    <div class='image-name'></div>
      <div class='image-delete-button-wrapper'>
        <div class='image-delete-button'>x</div>
      </div>
    </div>`;
  
    div.innerHTML = imageCardHtml;
    cardContainer.appendChild(div);
  }

  // railsのDBからpresetGameObjectを読み込み
  loadGameObjects();
}

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

window.addEventListener('load', imageList);