const create = () => {
  const form = document.getElementById('game_form');
  form.addEventListener('submit', (e) => {
    // デフォルト動作のデータ送信をキャンセル
    e.preventDefault;
    // 選択されたimg要素を取得
    Array.from(document.getElementsByClassName('object-card')).forEach((card) => {
      let symbolContainer = card.children[0];
      let positionContainer = card.children[1];
      let objectContainer = card.children[2];
      let scriptContainer = card.children[3];

      let symbolInput = Array.from(symbolContainer.children).find((o) => o.id == 'symbolInput').value;
      console.log(symbolInput);

      let positionImage = getImage(positionContainer);
      let positionBase64 = positionImage.src;
      let positions = positionImage.dataset;
      console.log(positionBase64);
      console.log(positions);

      let objectBase64 = getImage(objectContainer).src;
      console.log(objectBase64);

      let script = Array.from(scriptContainer.children).find((o) => o.id == 'scriptSelect').value;
      console.log(script);
    });
    var slectedStage = document.getElementsByClassName('split-img stage selected')[0];
    var slectedPlayer = document.getElementsByClassName('split-img player selected')[0];
    var slectedObject = document.getElementsByClassName('split-img object selected')[0];
    // 選択されたimg要素をinput要素として挿入
    const renderDom = document.getElementById('game_form');
    const stageImg = `<input value=${slectedStage.src} type='hidden' name='stage_img'>`;
    const playerImg = `<input value=${slectedPlayer.src} type='hidden' name='player_img'>`;
    const objectImg = `<input value=${slectedObject.src} type='hidden' name='object_img'>`;
    renderDom.insertAdjacentHTML("beforeend", stageImg);
    renderDom.insertAdjacentHTML("beforeend", playerImg);
    renderDom.insertAdjacentHTML("beforeend", objectImg);
    // デフォルトのinputタグからname属性を削除
    document.getElementById('stage_input').removeAttribute('name');
    document.getElementById('player_input').removeAttribute('name');
    document.getElementById('object_input').removeAttribute('name');
    // データを送信
    // document.getElementById('game_form').submit();
  });
}

const getImage = (container) => {
  return Array.from(container.children).find((o) => o.classList.contains('split-img'))
}

window.addEventListener('load', create);