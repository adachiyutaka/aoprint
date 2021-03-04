const script = () => {
  // 現在選択されているscript_card
  let activeCard = null;

  // script_list, script_fieldのエレメントを取得
  const scriptList = document.getElementById('scriptList');
  const scriptField = document.getElementById('scriptField');

  // スクリプト一覧を読み込み、scriptCardを作成
  // readScript(scriptObj, scriptList);
  readScript(scriptObj, scriptList);
  // let scriptCard = document.createElement('div');
  // scriptCard.classList.add('script-card');
  // scriptCard.insertAdjacentHTML('afterbegin', scriptVX);

  // scriptCard.addEventListener('click', (eList) => {
  //   let cloneCard = eList.currentTarget.cloneNode(true);
  //   cloneCard.addEventListener('click', (eField) => {
  //     if (activeCard != null){
  //       activeCard.classList.remove('active');
  //     }
  //     activeCard = eField.currentTarget;
  //     activeCard.classList.add('active');
  //   })
  //   scriptField.insertAdjacentElement('afterbegin', cloneCard);
  // });

  // scriptList.insertAdjacentElement('afterbegin', scriptCard);
}
let N = 0;

const readScript = (obj, ...container) => {
  // 与えられたobjが配列かどうかを判定する
  if (Object.prototype.toString.call(obj) == '[object Array]'){
    // 配列の場合、各要素についてreadScriptで再起処理する
    if (container.length == 1){
      // 1つのcontainerに複数のobjを配置する場合、同じelementに対してobjを配置する
      obj.map((childObj) => readScript(childObj, container[0]));
    }
    else{
      obj.map((childObj, index) => readScript(childObj, container[index]));
    }
  }
  else{
    // 配列でない場合、cardを生成し配置
    let card = makeScriptCard();
    container[0].insertAdjacentElement('beforeend', card);
    
    // keyの値によってcardの中にパーツを生成する
    Object.keys(obj).map(key => {
      let value = obj[key];
      switch (key) {
        case 'start':
          addName(card, key);
          readScript(value, makeContainer(card));
          break;
        case 'assignment':
          left = makeContainer(card);
          operator = makeContainer(card);
          operator.insertAdjacentText('beforeend', '=');
          operator.classList.add('operator');
          right = makeContainer(card);
          readScript(value, left, right);
          break;
        case 'left':
        case 'right':
          readScript(value, card);
          break;
        case 'member_var':
          card.classList.add('member-var');
          card.insertAdjacentText('beforeend', value);
          break;
        case 'value':
          card.classList.add('value');
          addInput(card, value);
          break;
      }
    });
  }
}

const makeScriptCard = () => {
  let card = document.createElement('div');
  card.classList.add('script-card');
  return card;
}

const makeContainer = (card) => {
  let container = document.createElement('div');
  container.classList.add('script-container');
  card.insertAdjacentElement('beforeend', container);
  return container;
}

const addName = (card, name) => {
  let functionName = document.createElement('div');
  functionName.classList.add('function-name');
  card.insertAdjacentElement('beforeend', functionName);
  functionName.insertAdjacentText('beforeend', name);
}

const addInput = (card, value) => {
  let input = document.createElement('input');
  input.classList.add('script-input');
  input.type = 'text';
  if (value) {
    input.value = value;
  }
  card.insertAdjacentElement('beforeend', input);
}

const scriptObj = {
  start: {
    assignment:
    [
    {
      left:
      [
        {
        member_var: "v"
        },
        {
        member_var: "x"
        }
      ]
    },
    {
      right: {
        value: "10"
      }
    }
    ]
  }
};

const testObj = {
  assignment: 
  [
  {
    left:
    // {member_var: "left"}
    [
      {
        member_var: "left-1"
      },
      {
        member_var: "left-2"
      }
    ]
  },
  {
    right: {member_var: "right"}
  }
  ]
}

let scriptVX = `
<div class='function-name'>
  <p>START</p>
</div>
<div class='script-card row'>
  <div class='script-left'>
    <div class='script-card row'>
      <input type='text' value='V' class='script-input'>
      <div class='script-card'>
        <input type='text' value='X' class='script-input'>
      </div>
    </div>
  </div>
  <div class='script-card'>
    <p>=</p>
  </div>
  <div class='script-right'>
    <input type='text' value='10' class='script-input'>
  </div>
</div>
`

window.addEventListener('load', script);