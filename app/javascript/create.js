const create = () => {
  const form = document.getElementById('game_form');
  form.addEventListener('submit', (e) => {
    // デフォルト動作のデータ送信をキャンセル
    e.preventDefault;

    // 選択されたimg要素を取得
    let objectData = [];
    
    // TODO: 1object対多positionに対応する必要あり
    Array.from(document.getElementsByClassName('object-card')).forEach((card) => {
      let symbolContainer = card.children[0];
      let positionContainer = card.children[1];
      let objectContainer = card.children[2];
      let scriptContainer = card.children[3];

      // 入力されたsymbolの値を取得
      let symbolInput = Array.from(symbolContainer.children).find((o) => o.id == 'symbolInput').value;

      // position表示画像と値を取得
      let positionBase64 = getImage(positionContainer).src;
      let positions = Array.from(positionContainer.children).find((o) => o.id == 'vertices').dataset;

      // objectの画像を取得
      let objectBase64 = getImage(objectContainer).src;

      // scriptの値を取得
      let script = Array.from(scriptContainer.children).find((o) => o.id == 'scriptSelect').value;

      // JSONとして配列に加える
      const gameObject = {symbol: symbolInput, position: {height: positions.height, width: positions.width, x: positions.x, y: positions.y, image: positionBase64}, object: objectBase64, script: script};
      objectData.push(gameObject);
    });
    
    const renderDom = document.getElementById('game_form');
    const gameInput = `<input value=${JSON.stringify(objectData)} type='hidden' name='game_form[objects]'>`;
    const canvasInput = `<input value=${JSON.stringify({width: canvas.width, height: canvas.height})} type='hidden' name='game_form[canvas]'>`;
    renderDom.insertAdjacentHTML("beforeend", gameInput+canvasInput);
    // デフォルトのinputタグからname属性を削除
    document.getElementById('game_form_stage_input').removeAttribute('name');
    document.getElementById('game_form_player_input').removeAttribute('name');
    document.getElementById('game_form_object_input').removeAttribute('name');
    // データを送信
    // document.getElementById('game_form').submit();
  });
}

const getImage = (container) => {
  return Array.from(container.children).find((o) => o.classList.contains('split-img'))
}

window.addEventListener('load', create);