class GameForm
  include ActiveModel::Model
  attr_accessor :stage, :player, :name, :text

  # with_options presence: true do
  # end

  def save
    game = Game.create(name: name, text: text)
    # gameObject = GameObject.create(images: player, game_id: game.id)
    # Position.create()
    # stage = Stage.create()
    # Line.create()
  end
end