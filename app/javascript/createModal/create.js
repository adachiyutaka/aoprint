import CreateController from './createController';

const create = () => {
  const gameForm = document.getElementById('game_form');
  const gameFormObjects = document.getElementById('game_form_objects');
  const gameFormCanvas = document.getElementById('game_form_canvas');
  const submitButton = document.getElementById('submit_btn');
  
  submitButton.addEventListener('click', (e) => {
    console.log("CreateController.gameObjects: ", CreateController.gameObjects);
    console.log("JSON.stringify()1: ", JSON.stringify(CreateController.gameObjects));

    if(gameFormObjects) {
      gameFormObjects.remove();
    }

    if(gameFormCanvas) {
      gameFormCanvas.remove();
    }

    let gameInput = `<input value=${JSON.stringify(CreateController.gameObjects)} type='hidden' name='game_form[objects]' id='game_form_objects'>`;
    let canvasInput = `<input value=${JSON.stringify({width: canvas.width, height: canvas.height})} type='hidden' name='game_form[canvas]' id='game_form_canvas'>`;
    gameForm.insertAdjacentHTML("beforeend", gameInput + canvasInput);

    console.log("JSON.stringify()2: ", JSON.stringify(CreateController.gameObjects));

    // デフォルトのinputタグからname属性を削除
    document.getElementById('game_form_stage_input').removeAttribute('name');

    // データを送信
    gameForm.submit();
  });

  gameForm.addEventListener('submit', (e) => {
    // デフォルト動作のデータ送信をキャンセル
    e.preventDefault();
  });
}

const getImage = (container) => {
  return Array.from(container.children).find((o) => o.classList.contains('split-img'))
}

window.addEventListener('load', create);