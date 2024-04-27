import { useToast } from "@/components/shadcn/ui/use-toast";
import { RootStateType } from "@/reducers";
import { CreateGameStatus, createGame/*, getGame*/ } from "@/reducers/gameReducer";
import { ChosenColor } from "@/types";
import { Button } from "@shadcn/ui/button"
import { SendHorizontal, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

type GameOptions = 'new' | 'join';

interface MenuSelectColorProps {
  onSelect?: ((color: ChosenColor) => void),
  disabled?: boolean
}
function MenuSelectColor({ onSelect, disabled = false }: MenuSelectColorProps) {
  const _onSelect = (color: ChosenColor) => {
    if (onSelect) {
      onSelect(color);
    }
  }

  return (
    <div className="grid grid-flow-col auto-cols-auto gap-3">
      <div><Button disabled={disabled} onClick={() => _onSelect("white")}>White</Button></div>
      <div><Button disabled={disabled} onClick={() => _onSelect("black")}>Black</Button></div>
      <div><Button disabled={disabled} onClick={() => _onSelect("random")}>Random</Button></div>
    </div>
  );
}
export default function Menu() {
  const dispatch = useDispatch();
  const createGameStatus: CreateGameStatus = useSelector<RootStateType, CreateGameStatus>((state) => state.game.createGame);
  const [selectedOption, setSelectedOption] = useState<'new' | 'join' | null>(null);
  const selectedOptionRef = useRef<GameOptions | null>(null);
  selectedOptionRef.current = selectedOption;
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape' && selectedOptionRef.current !== null) {
        setSelectedOption(null);
      }
    });
  }, []);
  useEffect(() => {
    if (createGameStatus.error) {
      toast({
        title: "Error",
        description: "Ha habido un error al crear el juego.",
        variant: "destructive"
      });
    } else if (createGameStatus.gameId) {
      navigate(`/game/${createGameStatus.gameId}`)
    }
  }, [createGameStatus, navigate, toast]);

  const onNewGameSelectColor = (color: ChosenColor) => {
    dispatch(createGame(color))
  }
  const updateOption = (option: GameOptions | null) => {
    setSelectedOption(option);
  }
  return (
    <>
      <div className="flex items-center min-h-screen">
        <div className="grid-cols-1">
          {!selectedOption && <>
            <div style={{ marginBottom: 10 }}>
              <Button
                className="flex justify-center items-center"
                onClick={() => updateOption("new")}
                style={{ minWidth: 150 }}
              >
                <SendHorizontal width={20} style={{ marginRight: 10 }} /> New Game
              </Button>
            </div>
            <div>
              <Button
                className="flex justify-center items-center"
                onClick={() => updateOption("join")}
                style={{ minWidth: 150 }}
              >
                <Users width={20} style={{ marginRight: 10 }} /> Join Game
              </Button>
            </div>
          </>
          }
          {selectedOption === "new" && <div><MenuSelectColor disabled={createGameStatus.inProgress} onSelect={(color) => onNewGameSelectColor(color)} /></div>}
          {selectedOption === "join" && <div>Join game?</div>}
        </div>
      </div>
    </>
  )
}
