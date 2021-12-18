import CreateController from './createController';

const imageList = () => {
  // imageListの画像をクリックできるようにする
  
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
}

window.addEventListener('load', imageList);