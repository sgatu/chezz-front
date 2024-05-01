import GameTable, { GameTableHandlers } from "@/components/GameTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RootStateType } from "@/reducers";
import { GetGameStatus, getGame } from "@/reducers/gameReducer";
import { Ref, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom"
import useWebSocket from "react-use-websocket";
import { WebSocketHook } from "react-use-websocket/dist/lib/types";

export default function Game() {
  const params = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const getGameStatus: GetGameStatus = useSelector<RootStateType, GetGameStatus>((state) => state.game.getGame);
  const gameTableRef: Ref<GameTableHandlers> = useRef<GameTableHandlers>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const socket: WebSocketHook = useWebSocket(wsUrl);
  const onTableMove = (move: string) => {
    socket.sendMessage(move, false);
  }
  useEffect(() => {
    if (params.id) {
      dispatch(getGame(params.id));
    }
  }, [dispatch, params.id]);
  useEffect(() => {
    if (gameTableRef.current) {
      console.log(gameTableRef.current, getGameStatus);
    }
    if (getGameStatus.game?.id) {
      setWsUrl("ws://localhost:8888/play/" + getGameStatus.game?.id)
    }
  }, [getGameStatus]);
  useEffect(() => {
    console.log("Last websocket message", socket.lastMessage);
    gameTableRef.current?.processMove(socket.lastMessage?.data);
  }, [socket.lastMessage]);
  return (
    <>
      {getGameStatus.inProgress && <LoadingSpinner size={64} />}
      {getGameStatus.game && <GameTable initialGameState={getGameStatus.game} ref={gameTableRef} onMove={onTableMove} />}
    </>

  )
}
