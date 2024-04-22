import { getGame } from "@/reducers/gameReducer";
import { Button } from "@shadcn/ui/button"
import { SendHorizontal, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux";

type PiecesColor = 'white' | 'black' | 'random';
type GameOptions = 'new' | 'join';
interface MenuSelectColorProps {
  onSelect?: ((color: PiecesColor) => void)
}

function MenuSelectColor({ onSelect }: MenuSelectColorProps) {
  const _onSelect = (color: PiecesColor) => {
    if (onSelect) {
      onSelect(color);
    }
  }

  return (
    <div className="grid grid-flow-col auto-cols-auto gap-3">
      <div><Button onClick={() => _onSelect("white")}>White</Button></div>
      <div><Button onClick={() => _onSelect("black")}>Black</Button></div>
      <div><Button onClick={() => _onSelect("random")}>Random</Button></div>
    </div>
  );
}
export default function Menu() {
  const [selectedOption, setSelectedOption] = useState<'new' | 'join' | null>(null);
  const selectedOptionRef = useRef<GameOptions | null>(null);
  const dispatch = useDispatch();
  selectedOptionRef.current = selectedOption;
  useEffect(() => {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape' && selectedOptionRef.current !== null) {
        setSelectedOption(null);
      }
    });
  }, []);
  const updateOption = (option: GameOptions | null) => {
    setSelectedOption(option);
    dispatch(getGame("5555"));
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
          {selectedOption === "new" && <div><MenuSelectColor onSelect={(color) => console.log(color)} /></div>}
          {selectedOption === "join" && <div>Join game?</div>}
        </div>
      </div>
    </>
  )
}
