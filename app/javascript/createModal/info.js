import CreateController from './createController';

const info = () => {
  // info欄に入力された際に、GUIを更新するリスナーを設定
  document.getElementById('x').addEventListener('input', (e) => CreateController.setInfo(e));
  document.getElementById('y').addEventListener('input', (e) => CreateController.setInfo(e));
  document.getElementById('width').addEventListener('input', (e) => CreateController.setInfo(e));
  document.getElementById('height').addEventListener('input', (e) => CreateController.setInfo(e));
  document.getElementById('script_select').addEventListener('change', (e) => CreateController.setInfo(e));
}

window.addEventListener('load', info);