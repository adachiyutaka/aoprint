import CreateController from './createController';

const info = () => {
  // info欄に入力された際に、GUIを更新するリスナーを設定
  document.getElementById('x').addEventListener('input', (e) => CreateController.updateInfo(e));
  document.getElementById('y').addEventListener('input', (e) => CreateController.updateInfo(e));
  document.getElementById('width').addEventListener('input', (e) => CreateController.updateInfo(e));
  document.getElementById('height').addEventListener('input', (e) => CreateController.updateInfo(e));
  document.getElementById('script_select').addEventListener('change', (e) => CreateController.updateInfo(e));

  // info欄の要素を取得
  let info = document.getElementById('object_info');
  CreateController.setInfo(info);
  
  // preview画面のイベント（preview内imageの選択キャンセル）を発火させないために
  // stopPropagationを設定
  info.addEventListener('click', (e) => {e.stopPropagation();});
};

window.addEventListener('load', info);