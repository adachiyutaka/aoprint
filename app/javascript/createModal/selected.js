class Selected {
  // 選択したimg要素の輪郭を表示するための'selected'クラス操作
  static add(element) {
    // 全ての要素の"selected"クラスを外す
    this.remove(element.classList);

    // 選択された要素に"selected"クラスを付ける
    element.classList.add('selected');
  }

  static remove(className) {
    // 同じクラス名を持つ全ての要素の"selected"クラスを外す
    if (className){
      let selectedElements = Array.from(document.getElementsByClassName(className));
      selectedElements.forEach( (element) => {
        element.classList.remove('selected');
      });
    }
  }
}

export default Selected;