const create = () => {
  const form = document.getElementById('game_form');
  form.addEventListener('submit', (e) => {
    e.preventDefault;
    var splitPlayer = document.getElementsByClassName('split-img')[1];
    const renderDom = document.getElementById('game_form');
    const playerImg = `<input value=${splitPlayer.src} type='hidden' name='player_img'>`;
    renderDom.insertAdjacentHTML("beforeend", playerImg);
    document.getElementById('player_input').removeAttribute('name');
    document.getElementById('game_form').submit();
  });
}

window.addEventListener('load', create)