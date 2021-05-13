# アプリ名
aoprint
# 概要
手書きイラストでゲームを作ったり、他の人が作ったゲームで遊んだりするWEBアプリ。
# コンセプト（目指した課題解決）
- ゲーム作りをデチューンして、誰でも楽しめるようにする。
- デジタルデバイスがない状態でもできる遊びで、環境によらずプログラミング的なものと親しむ。
# 実装説明
### TOPページ
![TOPページ]()
### ゲームプレイ画面
![ゲームプレイ画面]()

# 使用技術(開発環境)
### Ruby(Ruby on Rails)
WEBページ
### JavaScript
ゲーム作成機能
### Python
画像の輪郭切り取り処理
### C#(Unity)
ゲームプレイ機能
# 実装予定
- ゲーム作成GUI
ゲーム画面を再現したGUIでゲームを作成する
- スクリプト機能
ユーザーオリジナルの敵キャラクターなどの動きを作成する
# DB設計
## users テーブル
| Column         | Type      | Options     |
| -------------- | --------- | ----------- |
| email          | string    | null: false |
| name           | string    | null: false |
| password       | string    | null: false |
| text           | string    |             |
| birthday       | date      |             |

### Association
- has_many :games, dependent: :destroy

## games テーブル
| Column         | Type      | Options     |
| -------------- | --------- | ----------- |
| name           | string    | null: false |
| text           | string    |             |
| user_id        | references| foreign_key: true |

### Association
- has_many :game_objects, dependent: :destroy
- belongs_to :user

## game_objects テーブル
| Column         | Type      | Options     |
| -------------- | --------- | ----------- |
| symbole        | string    |             |
| name           | string    |             |
| text           | string    |             |
| player         | boolean   |             |
| object         | boolean   |             |
| enemy          | boolean   |             |
| item           | boolean   |             |
| goal           | boolean   |             |
| game_id        | references| foreign_key: true |

### Association
- has_one :object_position
- belongs_to :game

## stages テーブル
| Column         | Type      | Options     |
| -------------- | --------- | ----------- |
| width          | string    | null: false |
| height         | string    | null: false |
| game_id        | references| foreign_key: true |

### Association
- has_many :positions, dependent: :destroy
- belongs_to :game

## positions テーブル
| Column         | Type      | Options     |
| -------------- | --------- | ----------- |
| symbole        | string    | null: false |
| x              | string    | null: false |
| y              | string    | null: false |
| width          | string    | null: false |
| height         | string    | null: false |
| text           | string    |             |
| stage_id       | references| foreign_key: true |

### Association
- has_one :object_position
- belongs_to :stage

## object_positions テーブル
| Column         | Type      | Options     |
| -------------- | --------- | ----------- |
| game_object_id | references| foreign_key: true |
| position_id    | references| foreign_key: true |

### Association
- belongs_to :game_object
- belongs_to :position
