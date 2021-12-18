import CreateController from './createController';

const info = () => {
  // info欄に入力された際に、GUIを更新するリスナーを設定
  document.getElementById('x').addEventListener('input', (e) => CreateController.updateInfoValue(e));
  document.getElementById('y').addEventListener('input', (e) => CreateController.updateInfoValue(e));
  document.getElementById('width').addEventListener('input', (e) => CreateController.updateInfoValue(e));
  document.getElementById('height').addEventListener('input', (e) => CreateController.updateInfoValue(e));
  document.getElementById('script_select').addEventListener('change', (e) => CreateController.updateInfoValue(e));

  // 画像変更モーダルを呼び出すリスナーを設定
  document.getElementById('info_image').addEventListener('click', () => {
    // 画像変更モードに切り替え
    CreateController.updateMode(CreateController.mode.updateImage);
  });

  // info欄の要素を取得
  let info = document.getElementById('object_info');
  CreateController.setInfo(info);
  
  // preview画面のイベント（preview内imageの選択キャンセル、キー押下）を発火させないために
  // stopPropagationを設定
  info.addEventListener('click', (e) => {e.stopPropagation()});
  info.addEventListener('keydown', (e) => {e.stopPropagation()});
};

window.addEventListener('load', info);