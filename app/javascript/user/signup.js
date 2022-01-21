const signUp = () => {
  const email_re = null;
  const password_include_alphabet = null;
  const password_include_number = null;
  const password_min = null;
  const password_confirm = null;

  let warnings = {'user_name': {'presence': null},
                  'user_email': {'email_re': null,
                                 'presence': null},
                  'user_password': {'password_include_alphabet': null,
                                    'password_include_number': null,
                                    'password_include_min': null,
                                    'password_confirm': null,
                                    'presence': null},
                  'user_password_confirmation': {'password_confirm': null,
                                                 'presence': null}
                 }

  let rEs = {'presence' : {'re': '',
                           'text': '入力してください'},
             'email_re' : {'re': /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}.[A-Za-z0-9]{1,}$/,
                           'text': '正しいメールアドレスを入力してください'},
             'password_include_alphabet' : {'re': /(?=.*?[a-z])/,
                                            'text': '1文字以上のアルファベットを含めてください'},
             'password_include_number' : {'re': /(?=.*?[0-9])/,
                                          'text': '1文字以上の数字を含めてください'},
             'password_include_min' : {'re': /.{6,}/,
                                       'text': '6文字以上入力してください'},
             'password_confirm' : {'re': '',
                                   'text': 'パスワードが一致しません'}
            }

  // form、inputの要素を取得
  const form = document.getElementById('new_user');
  const user_name = document.getElementById('user_name');
  const user_email = document.getElementById('user_email');
  const password = document.getElementById('user_password');
  const password_confirmation = document.getElementById('user_password_confirmation');

  user_name.addEventListener('input', (e) => {validate(e)});
  user_email.addEventListener('input', (e) => {validate(e)});
  password.addEventListener('input', (e) => {validate(e)});
  password_confirmation.addEventListener('input', (e) => {validate(e)});

  document.getElementById('user_submit_btn').addEventListener('click', () => {
    form.submit()
  });

  const validate = (e) => {
    let id = e.currentTarget.id;
    let value = e.currentTarget.value;
    console.log('input target id:', id);
    console.log('input value:', value);
    console.log('valid keys:', Object.keys(warnings[id]));

    Object.keys(warnings[id]).forEach(validation => {
      console.log('validation:', validation);

      switch (validation) {
        case 'presence':
          if(value == ''){
            resetWarm(id);
            addWarn(id, validation);
          }
          else{
            removeWarn(id, validation);
          }
          break;
        case 'password_confirm':
          if(password.value != password_confirmation.value && password_confirmation.value){
            addWarn('user_password_confirmation', 'password_confirm');
          }
          else{
            removeWarn('user_password_confirmation', 'password_confirm');
          }
          break;
        default:
          if(!value.match(rEs[validation].re)){
            addWarn(id, validation);
          }
          else{
            removeWarn(id, validation);
          }
      }
    });
  }

  const addWarn = (id, validation) => {
    console.log('here');
    let warningElement = warnings[id][validation];
    if(warningElement == null){
      warningElement = document.createElement('div');
      warningElement.classList.add('validation-message');
      warningElement.textContent = rEs[validation].text;
      warnings[id][validation] = warningElement;
    }
    document.getElementById(id + '_warn').appendChild(warningElement);
  }

  const removeWarn = (id, validation) => {
    let warningElement = warnings[id][validation];
    let parent = document.getElementById(id + '_warn');
    if(parent.children && warningElement) {
      if(Array.from(parent.children).find(child => child == warningElement)){
        document.getElementById(id + '_warn').removeChild(warningElement);
      }
    }
  }

  const resetWarm = (id) => {
    let parent = document.getElementById(id + '_warn')
    if(parent.children){
      Array.from(document.getElementById(id + '_warn').children).forEach(child => child.remove());
    }
  }
};

window.addEventListener('load', signUp);