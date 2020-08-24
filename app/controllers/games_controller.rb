class GamesController < ApplicationController

  def index
    @games = Game.all
  end

  def show
    @game = Game.find_by(id: params[:id])
  end

  def create
    @game = GameForm.new(game_params)
    if @game.valid?
      @game.save
      return redirect_to game_path(@game.game)
    else
      render "new"
    end
  end

  def game_params
    params.permit(:stage_img, :player_img, :name, :text).merge(user_id: current_user.id)
  end
end