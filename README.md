![chessGame2](https://github.com/sgatu/chezz-front/assets/11692467/04406350-8231-445e-979e-e0f5ac07622e)

# Chezz Game Front-End


#### Front end for the chezz game found here [Chezz Back](https://github.com/sgatu/chezz-back)

## How to run?

This project is powered by Vite + React. Commands are as usual

```
npm install
npm run dev
```

## Configuration

It requires the following environment variable

```
PUB_API_BASE=http://backend.url
```

## Pages

- Main.tsx - /

  The main page where you can create a new game or join an existing one.

- Game.tsx - /game/:id
  
  The page where the game takes place.

  This page will make a first request to load all game information and after that will connect to the server trough a websocket in order to communicate game movements.

## Run the full game with docker?

**[Chezz](https://github.com/sgatu/chezz)**
