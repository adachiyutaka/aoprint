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
  const imageButton = document.getElementById('add_object_btn');
  const imageModal = document.getElementById('image_modal');
  const imageExitButton = document.getElementById('image_exit_btn');
  const imageBackground = document.getElementById('image_modal_background');


  // ゲーム制作モーダルの表示
  gameButton.addEventListener('click', gameDisplay);
  
  // ゲーム制作モーダルの非表示
  gameExitButton.addEventListener('click',  gameExit);
  background.addEventListener('click', gameExit);

  // イメージ選択モーダルの表示
  imageButton.addEventListener('click', imageDisplay);

  // イメージ選択モーダルの非表示  
  imageBackground.addEventListener('click', imageExit);
  imageExitButton.addEventListener('click', imageExit);


  // ゲーム作成モーダルを表示する
  function gameDisplay() {
    modalParent.style.display = 'block';
  }

  // ゲーム作成モーダルを非表示にする
  function gameExit() {
    modalParent.style.display = 'none';
  }

  // イメージ選択モーダルの表示
  function imageDisplay() {
    imageModal.style.display = 'block';
    imageBackground.style.display = 'block';
    background.style.display = 'none';
  }

  // イメージ選択モーダルを非表示にする
  function imageExit() {
    imageModal.style.display = 'none';
    imageBackground.style.display = 'none';
    background.style.display = 'block';
  }
}

window.addEventListener("load", modal)