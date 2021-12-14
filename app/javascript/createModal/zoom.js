import CreateController from './createController';

const zoom = () => {
  // 数値input要素、スライダーinput要素を取得
  const number = document.getElementById('zoom_number');
  const range = document.getElementById('zoom_range');

  // 数値input要素が更新された時、ズーム率とpreview画面を更新する
  range.addEventListener('input', (e) => {
    number.value = range.value;
    CreateController.updateZoom(range.value);
  });

  // スライダーinput要素が更新された時、ズーム率とpreview画面を更新する
  number.addEventListener('input', (e) => {
    range.value = number.value;
    CreateController.updateZoom(number.value);
  });
}

window.addEventListener('load', zoom);