import CreateController from './createController';

const info = () => {
  // info欄に入力された際に、GUIを更新するリスナーを設定
  document.getElementById('x').addEventListener('input', (e) => CreateController.updateInfo(e));
  document.getElementById('y').addEventListener('input', (e) => CreateController.updateInfo(e));
  document.getElementById('width').addEventListener('input', (e) => CreateController.updateInfo(e));
  document.getElementById('height').addEventListener('input', (e) => CreateController.updateInfo(e));
  document.getElementById('script_select').addEventListener('change', (e) => CreateController.updateInfo(e));

  // info欄の要素を取得
  CreateController.setInfo(document.getElementById('object_info'));
};

window.addEventListener('load', info);