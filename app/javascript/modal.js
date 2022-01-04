import CreateController from './createModal/createController.js';

const modal = () => {
  // ゲーム作成モーダル・イメージ選択モーダルの表示/非表示を制御する

  // モーダル全体
  const modalParent = document.getElementById('modal_parent');

  // ゲーム制作モーダルと表示/非表示する要素
  const gameButton = document.getElementById('create_btn');
  const gameExitButton = document.getElementById('exit_btn');
  const background = document.getElementById('modal_background');

  // ゲーム作成モーダルを表示する
  const gameDisplay = () => {
    modalParent.style.display = 'block';
  }

  // ゲーム作成モーダルを非表示にする
  const gameExit = () => {
    modalParent.style.display = 'none';
  }

  // ゲーム制作モーダルの表示
  gameButton.addEventListener('click', gameDisplay);
  
  // ゲーム制作モーダルの非表示
  gameExitButton.addEventListener('click',  gameExit);
  background.addEventListener('click', gameExit);
}

window.addEventListener("load", modal)