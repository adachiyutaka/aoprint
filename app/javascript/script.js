const script = () => {
  // 現在選択されているscript_card
  let activeCard = null;

  // script_list, script_fieldのエレメントを取得
  const scriptList = document.getElementById('scriptList');
  const scriptField = document.getElementById('scriptField');

  // スクリプト一覧からscriptCardを生成し、scriptListに配置する
  readScript(testObj, scriptList);
  let scriptCards = Array.from(scriptList.children)
  scriptCards.map((card) => {
    // scriptCardのリストに'snippet'クラスを与える  
    card.classList.add("snippet");
    // 各snippetのカードにクリック時の処理を設定する
    // card.addEventListener('click', (e) => {
    //   clone = e.currentTarget.cloneNode(true);
    //   scriptField.insertAdjacentElement('beforeend', clone);
    // });
  });

  // 各snippetのカードにクリック時の処理を設定する
  scriptCards
}

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
      card.classList.add(kebabCase(key));
      switch (key) {
        case 'start':
          addName(card, key);
          readScript(value, makeContainer(card));
          break;
        case 'assignment':
          // Containerを3つ作成する
          leftContainer = makeContainer(card);
          operatorContainer = makeContainer(card);
          rightContainer = makeContainer(card);
          // 2番目のContainerに"="を表示したカードを配置する
          operatorCard = makeScriptCard(false); // 引数にfalseを渡して削除ボタンのないcardを作成する
          operatorCard.insertAdjacentText('beforeend', '=');
          operatorContainer.insertAdjacentElement('beforeend', operatorCard);
          // 左辺、右辺のContainerを再起処理する
          readScript(value, leftContainer, rightContainer);
          break;
        case 'snippet':
        case 'left':
        case 'right':
          readScript(value, card);
          break;
        case 'memberVar':
          card.insertAdjacentText('beforeend', value);
          break;
        case 'value':
          addInput(card, value);
          break;
        case 'commentOut':
          addName(card, `# ${value}`)
          break;
      }
    });
    return card
  }
}

const makeScriptCard = (deletable = true) => {
  let card = document.createElement('div');
  card.classList.add('script-card');
  // 引数にfalseを渡した場合、削除ボタンを表示しない
  if (deletable){
    let deleteButton = document.createElement('div');
    deleteButton.insertAdjacentText('afterbegin', 'x');
    deleteButton.classList.add('script-delete-button');
    // 削除ボタンクリックでカードを削除するよう設定
    deleteButton.addEventListener('click', (e) => {
      console.log("clicked");
      e.currentTarget.parentNode.remove;
    });
    card.insertAdjacentElement('afterbegin', deleteButton);
  }
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
  snippet: 
  [
    {commentOut: "横向きの速度を10に設定する"},
    {
      start: {
        assignment:
        [
        {
          left:
          [
            {
            memberVar: "v"
            },
            {
            memberVar: "x"
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
    }
  ]
};

const testObj = [scriptObj, scriptObj];

function kebabCase(str){
  return str.replace(/[A-Z]/g, function(s){
    return "-" + s.charAt(0).toLowerCase();
  });
}

window.addEventListener('load', script);