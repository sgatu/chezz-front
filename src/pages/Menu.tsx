import { Button } from "@shadcn/ui/button"
import { SendHorizontal, Users } from "lucide-react"
import { useState } from "react"

export default function Menu() {
  const [selectedOption, setSelectedOption] = useState<'new' | 'join' | null>(null);
  return (
    <>
      <div className="flex items-center min-h-screen">
        <div className="grid-cols-1">
          {!selectedOption && <>
            <div style={{ marginBottom: 10 }}>
              <Button
                className="flex justify-center items-center"
                onClick={() => setSelectedOption("new")}
                style={{ minWidth: 150 }}
              >
                <SendHorizontal width={20} style={{ marginRight: 10 }} /> New Game
              </Button>
            </div>
            <div>
              <Button
                className="flex justify-center items-center"
                onClick={() => setSelectedOption("join")}
                style={{ minWidth: 150 }}
              >
                <Users width={20} style={{ marginRight: 10 }} /> Join Game
              </Button>
            </div>
          </>
          }
          {selectedOption === "new" && <div>New game?</div>}
          {selectedOption === "join" && <div>Join game?</div>}
        </div>
      </div>
    </>
  )
}
