import GameTable, { GameTableHandlers } from "@/components/gametable/GameTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { default as GameType, Player } from "@/lib/models/game";
import { RootStateType } from "@/reducers";
import { GetGameStatus, getGame } from "@/reducers/gameReducer";
import { PlayerGameRelation, ServerMessageType, parseServerMessage, pieceTypeToChar } from "@/types";
import clsx from "clsx";
import { Ref, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom"
import useWebSocket from "react-use-websocket";
import { WebSocketHook } from "react-use-websocket/dist/lib/types";
import { Share2 } from "lucide-react";

export default function Game() {
  const params = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const getGameStatus: GetGameStatus = useSelector<RootStateType, GetGameStatus>((state) => state.game.getGame);
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const gameTableRef: Ref<GameTableHandlers> = useRef<GameTableHandlers>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [gameRelation, setGameRelation] = useState<PlayerGameRelation>("observer");
  const socket: WebSocketHook = useWebSocket(wsUrl);
  const { toast } = useToast();
  const singleRequestRef = useRef(false); // used to avoid double api call on strictMode
  const onTableMove = (move: string) => {
    socket.sendMessage(move, false);
  }
  const onShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Game copied to clipboard!",
      variant: "default",
      duration: 2500
    });
  }
  useEffect(() => {
    if (params.id && !singleRequestRef.current) {
      singleRequestRef.current = true;
      dispatch(getGame(params.id));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (getGameStatus.game?.id) {
      setWsUrl(import.meta.env.PUB_API_BASE.replace("http://", "ws://").replace("https://", "wss://") + "/play/" + getGameStatus.game?.id)
      setCurrentGame(getGameStatus.game)
    }
  }, [getGameStatus]);

  useEffect(() => {
    if (socket.lastMessage?.data) {
      const message = parseServerMessage(socket.lastMessage?.data);
      if (message) {
        switch (message.type) {
          case ServerMessageType.MOVE:
            gameTableRef.current?.processMove(message);
            break;
          case ServerMessageType.ERROR:
            toast({
              title: "Invalid move",
              description: message.error,
              variant: "destructive",
              duration: 2500
            });
            break;
          case ServerMessageType.INIT:
            setGameRelation(message.relation);
            break;
        }
      }
    }
  }, [socket.lastMessage, toast]);

  return (
    <>
      {getGameStatus.inProgress && <LoadingSpinner size={64} />}
      {getGameStatus.game &&
        <div className="flex flex-row min-w-[750px] w-min justify-center">
          <div className="basis-52 bg-slate-300/[0.4] mr-5 rounded-sm p-2 items-center text-left text-gray-300 font-bold">
            <div>
              <div className="flex">
                <div className="text-sm flex-grow">Game info</div>
                <div className="self-end"><Share2 className="stroke-[#2ec27e] hover:stroke-[#33d17a] hover:cursor-pointer" onClick={onShare} width={18} height={18} /></div>
              </div>
              <hr className="mb-5 mt-1" />
              <div className="flex items-center">
                <div className="basis-3/4 mr-2">Your color</div>
                <div className={clsx("basis-auto rounded-full w-5 h-5 border-2 border-slate-400", gameRelation === "black" ? "bg-black" : gameRelation === "white" ? "bg-white" : "bg-gray")}></div>
              </div>
              <div className="flex items-center">
                <div className="basis-3/4 mr-2">Player Turn</div>
                <div className={clsx(
                  "basis-auto rounded-full w-5 h-5 border-2 border-slate-400",
                  currentGame?.gameStatus.playerTurn === Player.BLACK_PLAYER ? "bg-black" : "bg-white"
                )}></div>
              </div>
              <div className="flex items-center text-rose-500 justify-center mt-2 min-h-2">
                {currentGame?.gameStatus.checkMate ? "Check mate!" : currentGame?.gameStatus.checkedPlayer !== Player.UNKNOWN_PLAYER ? "Check" : ""}
              </div>
            </div>
            <div className="mt-10">
              <div className="text-sm">Captured</div>
              <hr className="mb-5" />
              <div className="flex bg-black text-white min-h-12 px-2 py-1 items-start">
                {currentGame?.gameStatus.outTable.filter(p => p.player === Player.WHITE_PLAYER).map(p => pieceTypeToChar(p.pieceType))}
              </div>
              <div className="flex bg-white text-black min-h-12 px-2 py-1 items-start">
                {currentGame?.gameStatus.outTable.filter(p => p.player === Player.BLACK_PLAYER).map(p => pieceTypeToChar(p.pieceType))}
              </div>
            </div>
            <div className="mt-10">
              <div className="text-sm">History</div>
              <hr className="mb-5" />
              <div className="flex text-sm">
                {currentGame?.gameStatus.moves.map(m => m + " ")}
              </div>
            </div>
          </div>
          <div className="basis-auto shrink">
            <GameTable gameRelation={gameRelation} initialGameState={getGameStatus.game} ref={gameTableRef} onMove={onTableMove} onGameUpdate={(updatedGame) => setCurrentGame(updatedGame)} />
          </div>
        </div>
      }
    </>

  )
}
