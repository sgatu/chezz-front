import GameTable from "@/components/GameTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RootStateType } from "@/reducers";
import { GetGameStatus, getGame } from "@/reducers/gameReducer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom"

export default function Game() {
  const params = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const getGameStatus: GetGameStatus = useSelector<RootStateType, GetGameStatus>((state) => state.game.getGame);
  useEffect(() => {
    if (params.id) {
      dispatch(getGame(params.id));
    }
  }, [dispatch, params.id]);
  useEffect(() => {
    console.log(getGameStatus);
  }, [getGameStatus]);
  return (
    <>
      {getGameStatus.inProgress && <LoadingSpinner size={64} />}
      {getGameStatus.game && <GameTable initialGameState={getGameStatus.game} />}
    </>

  )
}
