const signUp = () => {
  // form、エラー表示の要素を取得
  document.getElementById('user_name').addEventListener('input', (e) => {validation(e)});
  document.getElementById('user_email').addEventListener('input', (e) => {validation(e)});
  document.getElementById('user_password').addEventListener('input', (e) => {validation(e)});
  document.getElementById('user_password_confirmation').addEventListener('input', (e) => {validation(e)});
  document.getElementById('user_password_confirmation').addEventListener('input', (e) => {validation(e)});
  let form = document.getElementById('new_user');
  document.getElementById('user_submit_btn').addEventListener('click', () => {form.submit()});

  const validation = (e) => {
    let id = e.currentTarget.id;
    let value = e.currentTarget.value;
    console.log("input target:", e.currentTarget);
    console.log("input value:", e.currentTarget.value);
    switch (id) {
      case 'user_name':
        console.log('user_name');
        break;
      case 'user_email':
        console.log('user_email');
        break;
      case 'user_password':
        console.log('user_password');
        break;
      case 'user_password_confirmation':
        console.log('user_password_confirmation');
        break
      default:
        console.log('不明なユーザー項目');
    }
  }
};

window.addEventListener('load', signUp);