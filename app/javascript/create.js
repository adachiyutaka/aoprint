const create = () => {
  const form = document.getElementById('game_form');
  form.addEventListener('submit', (e) => {
    e.preventDefault;
    var slectedStage = document.getElementsByClassName('split-img stage selected')[0];
    var slectedPlayer = document.getElementsByClassName('split-img player selected')[0];
    const renderDom = document.getElementById('game_form');
    const stageImg = `<input value=${slectedStage.src} type='hidden' name='stage_img'>`;
    const playerImg = `<input value=${slectedPlayer.src} type='hidden' name='player_img'>`;
    renderDom.insertAdjacentHTML("beforeend", stageImg);
    renderDom.insertAdjacentHTML("beforeend", playerImg);
    document.getElementById('stage_input').removeAttribute('name');
    document.getElementById('player_input').removeAttribute('name');
    document.getElementById('game_form').submit();
  });
}

window.addEventListener('load', create)