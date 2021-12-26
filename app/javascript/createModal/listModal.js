// import CreateController from './createController';

// const listModal = () => {
//   const mode = {updateImage : 1, newGameObject : 2};
//   let currentMode = null;

//   // イメージ選択モーダルと表示/非表示する要素
//   const imageList = document.getElementById('image_list');
//   const background = document.getElementById('modal_background');
//   const infoImage = document.getElementById('info_image');
//   const imageButton = document.getElementById('add_object_btn');
//   const imageModal = document.getElementById('image_modal');
//   const imageExitButton = document.getElementById('image_exit_btn');
//   const imageBackground = document.getElementById('image_modal_background');
//   const submitButton = document.getElementById('image_submit_btn');
//   const newGO = document.getElementById('submit_text_new');
//   const changeImage = document.getElementById('submit_text_change');

//   // イメージ選択モーダルの表示
//   const imageDisplay = (mode) => {
//     // イメージ選択モーダルのsubmitボタンの表示を切り替える
//     updateMode(mode);
//     // イメージ選択モーダルを表示する
//     imageModal.style.display = 'block';
//     imageBackground.style.display = 'block';
//     background.style.display = 'none';
//   }

//   // イメージ選択モーダルを非表示にする
//   const imageExit = () => {
//     imageModal.style.display = 'none';
//     imageBackground.style.display = 'none';
//     background.style.display = 'block';
//   }

//   // イメージ選択モーダルのsubmitボタンの処理
//   const submit = () => {
//     let base64url;
//     base64url = document.getElementsByClassName('gameobject-image selected')[0].src;

//     if (currentMode == mode.updateImage){
//       CreateController.updateInfoImage(base64url);
//     }
//     else if (currentMode == mode.newGameObject){
//     }
//   }

//   // 画像選択モーダルのモードを新規作成か画像変更か設定する
//   const updateMode = (newMode) => {
//     currentMode = newMode;
// // 
//     // 画像選択モーダルの決定ボタンの表示を変更する
//     if (currentMode == mode.updateImage){
//       changeImage.classList.remove('hidden');
//       newGO.classList.add('hidden');
//     }
//     else if (currentMode == mode.newGameObject){
//       newGO.classList.remove('hidden');
//       changeImage.classList.add('hidden');
//     }
//   }

//   // イメージ選択モーダルの表示
//   // GameObject新規作成ボタンと、info画像変更ボタンの2通りがある
//   infoImage.addEventListener('click', () => {imageDisplay(mode.updateImage)});
//   imageButton.addEventListener('click', () => {imageDisplay(mode.newGameObject)});

//   // イメージ選択モーダルの非表示
//   imageBackground.addEventListener('click', imageExit);
//   imageExitButton.addEventListener('click', imageExit);

//   submitButton.addEventListener('click', () => {
//     submit();
//     imageExit();
//   });
// }

// window.addEventListener('load', imageList);