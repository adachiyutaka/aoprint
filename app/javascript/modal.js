const modal = () => {
  const button = document.getElementById('create-btn');
  const modalBackground = document.getElementById('modal-background');
  const exit = document.getElementById('exit-btn');

  
  button.addEventListener('click', () => {
    modalBackground.style.display = 'block';
  });
  
  exit.addEventListener('click', () => {
    modalBackground.style.display = 'none';
  });
}

window.addEventListener("load", modal)