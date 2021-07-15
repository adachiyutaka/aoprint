const modal = () => {
  const gameButton = document.getElementById('create_btn');
  const modalBackground = document.getElementById('modal_background');
  const modalParent = document.getElementById('modal_parent');
  const gameExit = document.getElementById('exit_btn');

  gameButton.addEventListener('click', () => {
    modalParent.style.display = 'block';
  });
  
  gameExit.addEventListener('click', () => {
    modalParent.style.display = 'none';
  });
}

window.addEventListener("load", modal)