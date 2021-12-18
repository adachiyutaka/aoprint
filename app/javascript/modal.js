import CreateController from './createModal/createController.js';

const modal = () => {
  // ゲーム作成モーダル・イメージ選択モーダルの表示/非表示を制御する

  // モーダル全体
  const modalParent = document.getElementById('modal_parent');

  // ゲーム制作モーダルと表示/非表示する要素
  const gameModal = document.getElementById('game_modal');  
  const gameButton = document.getElementById('create_btn');
  const gameExitButton = document.getElementById('exit_btn');
  const background = document.getElementById('modal_background');

  // イメージ選択モーダルと表示/非表示する要素
  const info = document.getElementById('info_image');
  const imageButton = document.getElementById('add_object_btn');
  const imageModal = document.getElementById('image_modal');
  const imageExitButton = document.getElementById('image_exit_btn');
  const imageBackground = document.getElementById('image_modal_background');
  const submitButton = document.getElementById('image_submit_btn');


  // ゲーム作成モーダルを表示する
  const gameDisplay = () => {
    modalParent.style.display = 'block';
  }

  // ゲーム作成モーダルを非表示にする
  const gameExit = () => {
    modalParent.style.display = 'none';
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

  // ゲーム制作モーダルの表示
  gameButton.addEventListener('click', gameDisplay);
  
  // ゲーム制作モーダルの非表示
  gameExitButton.addEventListener('click',  gameExit);
  background.addEventListener('click', gameExit);

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

window.addEventListener("load", modal)