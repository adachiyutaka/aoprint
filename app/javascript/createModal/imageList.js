import CreateController from './createController';
import splitImageCV from './splitImageCV.js';
import GameObject from './gameObject.js';
import objectMove from './objectMove.js';
import Selected from './selected';

// オブジェクト新規作成ボタン、オブジェクト情報のイメージをクリックでイメージリストを開く
const imageList = () => {
  // 新規作成と既存オブジェクト情報の更新の2通りの場合がある
  const mode = {updateImage : 1, newGameObject : 2};
  let currentMode = null;
  let currentGameObject = null;

  // イメージ選択モーダルと表示/非表示する要素
  const imageList = document.getElementById('image_list');
  const background = document.getElementById('modal_background');
  const infoImage = document.getElementById('info_image');
  const newObjectButton = document.getElementById('add_object_btn');
  const imageModal = document.getElementById('image_modal');
  const imageExitButton = document.getElementById('image_exit_btn');
  const imageBackground = document.getElementById('image_modal_background');
  const submitButton = document.getElementById('image_submit_btn');
  const newGOText = document.getElementById('submit_text_new');
  const changeImageText = document.getElementById('submit_text_change');

  // preview画面
  const previewContainer = document.getElementById('preview_container');

  // canvas
  const canvas = document.getElementById('canvas');

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
    Selected.removeByClassName('gameobject-image');
    imageModal.style.display = 'none';
    imageBackground.style.display = 'none';
    background.style.display = 'block';
  }

  // イメージ選択モーダルのsubmitボタンの処理
  const submit = () => {
    // イメージ更新の場合
    if (currentMode == mode.updateImage){
      CreateController.updateImage(document.getElementsByClassName('gameobject-image selected')[0].src);
    }
    // GameObject新規作成の場合
    else if (currentMode == mode.newGameObject){
      makePreviewObject(currentGameObject);
    }
  }

  // 画像選択モーダルのモードを新規作成か画像変更か設定する
  const updateMode = (newMode) => {
    currentMode = newMode;

    // 画像選択モーダルの決定ボタンの表示を変更する
    if (currentMode == mode.updateImage){
      changeImageText.classList.remove('hidden');
      newGOText.classList.add('hidden');
    }
    else if (currentMode == mode.newGameObject){
      newGOText.classList.remove('hidden');
      changeImageText.classList.add('hidden');
    }
  }

  // イメージ選択モーダルの表示
  // GameObject新規作成ボタンと、info画像変更ボタンの2通りがある
  infoImage.addEventListener('click', () => {imageDisplay(mode.updateImage)});
  newObjectButton.addEventListener('click', () => {imageDisplay(mode.newGameObject)});

  // イメージ選択モーダルの非表示
  imageBackground.addEventListener('click', imageExit);
  imageExitButton.addEventListener('click', imageExit);

  // 決定ボタン
  submitButton.addEventListener('click', () => {
    submit();
    imageExit();
  });


  // プレビュー画面の何もない部分をクリックした際の処理
  previewContainer.addEventListener('click', () => {
    Selected.removeByClassName("preview-image");

    // CreateControllerのSelectedGameObjectを更新する
    CreateController.selectedGameObject = null;

    CreateController.updatePreview();
    CreateController.updateInfoInput();
  });


  // 読み込み処理
  // DBからの読み込みを行い、その後、画像リストの要素にリスナーを設定する
  const loadPresetGOGroups = () => {
    // XMLHttpRequestの作成
    const httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      alert('中断 :( XMLHTTP インスタンスを生成できませんでした');
      return false;
    }

    // JSだけでajax通信する場合は、セキュリティトークンを設定する必要がある
    const token = document.getElementsByName('csrf-token')[0].content;

    // リクエストの内容
    // 初期の読み込み時には "init" : true を設定する
    // 特定のgroupeを読み込む場合は、groupe_nameを設定する
    let data = {"gameObject": {"groupeName": null, "init": false}};
  
    // レスポンス中、レスポンス後の処理
    // 通信に成功した場合、帰ってきたJSONをCreateControllerのpresetGameObjectsにセットする
    const alertContents = () => {
      try {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            // 正常にレスポンスが帰ってきた場合
            // PresetGameObjectをセットする
            CreateController.setPresetGOGroups(httpRequest.response);
  
            // 画像リストにGameObjectのgroupeの分類とGameObjectの画像を表示する
            CreateController.presetGOGroups.forEach(groupe => {
              let groupeName = groupe.name;
              makeImageListGroupe(groupeName);
              groupe.gameObjects.forEach(gameObject => {
                makeImageCard(groupeName, gameObject);
              });
            });
  
            // 画像リストのアップロード欄に画像アップロードボタン（フォームのラベル）を移動
            const imageInputLabel = document.getElementById('image_input_label');
            const imageCardsUpload = document.getElementById('image_cards_upload');
            imageCardsUpload.appendChild(imageInputLabel);
            imageInputLabel.classList.remove('hidden');
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


  // ローカル画像の読み込みボタンの処理
  const imageInputForm = document.getElementById('game_form_image_input');

  // 画像を輪郭で切り取り、PresetGameObjectへ登録する
  imageInputForm.addEventListener('change', (e) => {
    // ユーザーがセットしたファイルから画像ファイルを読み取り
    const file = e.target.files[0];

    const img = new Image();
    img.src = window.URL.createObjectURL(file);

    // splitImageCVで画像をトリミング
    // Promiseを使い、onload発火後に ImageCard 作成を行う
    const imgOnload = new Promise((resolve, reject) => {
      img.onload = () => {
        resolve(splitImageCV(img));
      };
    });

    imgOnload.then((images) => {
      console.log("images:", images);
      images.forEach((image) => {
        console.log("images.forEach splitImage:", image);

        // OpenCVに読み込んでMat型になった画像を再び画像ファイルとして扱うためにimg要素を生成し、トリミングした画像を設定
        cv.imshow(canvas, image['image']);
        let base64url = canvas.toDataURL();

        // GameObjectを生成し、画像、サイズ、位置データを設定、CreateControllerのPresetGameObjectsに格納
        let gameObject = new GameObject();
        gameObject.setImage(null, base64url);
        let vertices = image['vertices'];
        gameObject.setPosition(vertices['x'], vertices['y'], vertices['width'], vertices['height']);
        let groupeName = {column: 'upload', index: 'アップロード'};
        CreateController.addPresetGameObject(groupeName, gameObject);

        // ImageListにカードを追加
        makeImageCard(groupeName, gameObject);
      });
    });
  });


  // ImageList内のGroupe名要素を作成する
  const makeImageListGroupe = (groupeName) => {
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

  // ImageList内のImageCardを作成
  const makeImageCard = (groupeName, gameObject) => {
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

    // 作成したImageCardを配置する
    div.innerHTML = imageCardHtml;
    cardContainer.appendChild(div);

    // クリックできるようにリスナーを設定する
    div.firstChild.getElementsByTagName('img')[0].addEventListener('click', (e) => {
      // 選択された状態を表示する
      Selected.add(e.currentTarget);

      // 選ばれているGameObjectを更新する
      currentGameObject = gameObject;
    });
  }


  // railsのDBからpresetGameObjectを読み込み
  loadPresetGOGroups();
}

// preview内のGameObjectをクリックした際の処理
const selectPreviewImage = (element) => {
  // 選択したimg要素の輪郭を表示するために、指定した要素にのみ"selected"クラスをつける
  Selected.add(element);

  // CreateControllerのSelectedGameObjectを更新する
  CreateController.updateSelectedGameObject(element);

  // preview画面を更新する
  CreateController.updatePreview();
  CreateController.updateInfoInput();
}

// Preview画面にGameObjectを作成する
const makePreviewObject = (gameobject) => {

  CreateController.addGameObject(gameobject);

  // 各データに対応するimg要素とGameObjectを生成する
  // img要素を生成し、分割した画像を設定
  let previewImg = document.createElement('img');
  previewImg.src = gameobject.image.base64url;

  // 生成したimg要素のサイズ、位置、idを設定
  previewImg.style.position = "absolute";
  previewImg.classList.add('preview-image');
  previewImg.classList.add('drag-and-drop');
  previewImg.dataset.gameObjectId = CreateController.gameObjects.length - 1;

  // preview内のgameObjectにリスナーを設定
  previewImg.addEventListener('mousedown', (e) => {
    e.stopPropagation;
    selectPreviewImage(e.currentTarget);
  });

  // 作成したpreview内のオブジェクトを選択した状態にする
  selectPreviewImage(previewImg)

  // preview内のGameObjectにD&Dを設定
  objectMove(previewImg);
  
  // preview画面内にimg要素を配置
  const previewContainer = document.getElementById('preview_container');
  previewContainer.appendChild(previewImg);

  // preview画面を更新する
  CreateController.updatePreview();
}

window.addEventListener('load', imageList);