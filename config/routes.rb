Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root 'games#index'
  resources :games, only: [:index, :show, :new, :create] do
    member do
      get 'unity'
    end
    collection do
      post 'read_text'
    end
    collection do
      post 'load_game_object'
    end
  end
end