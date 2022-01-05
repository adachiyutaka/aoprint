class Role < ActiveHash::Base
  self.data = [
    { id: 1, name: 'ステージ' },
    { id: 2, name: 'プレイヤー' },
    { id: 3, name: '敵' },
    { id: 4, name: 'アイテム' },
    { id: 5, name: 'ゴール' },
  ]
end
