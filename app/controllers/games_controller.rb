class GamesController < ApplicationController

  # def index
  #   @game = GameForm.new
  # end

  def create
    @game = GameForm.new(game_params)
    if @game.valid?
      @game.save
      return redirect_to root_path
    else
      render "new"
    end
  end

  def game_params
    params.permit(:stage, :player, :name, :text)
  end
end
