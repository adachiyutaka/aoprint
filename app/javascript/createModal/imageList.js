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
}

window.addEventListener('load', imageList);