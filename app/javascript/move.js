import CreateController from './create-controller';

const move = () => {
  let cursorImage = document.getElementById('cursor_hand');
  document.getElementById('preview_container').addEventListener('mouseover', (e) => {
    cursorImage.style.top = e.clientY;
    cursorImage.style.left = e.clientX;
  });
}

window.addEventListener('load', move);