const promotionChars = ["R", "B", "N", "Q"] as const;
type PromotionChar = typeof promotionChars[number];
const promotionNames = ["Rook", "Bishop", "Knight", "Queen"] as const;
type PromotionName = typeof promotionNames[number];
export type PromotionInfo = {
  name: PromotionName
  char: PromotionChar
}
export interface SelectPromoProps {
  onSelectPromo?: (promotionInfo: PromotionInfo) => void;
}
function SelectPromotion({ onSelectPromo }: SelectPromoProps) {

  const onClick = (_event: React.MouseEvent<HTMLDivElement, MouseEvent>, selected: PromotionName, selectedId: PromotionChar) => {
    if (onSelectPromo) {
      onSelectPromo({ name: selected, char: selectedId });
    }
  }
  return (
    <>
      <div className="bg-white basis-full h-6 w-32">Promotion</div>
      <div className="w-32 h-32 bg-[#739756] font-bold flex flex-row select-none color-white">
        <div className="h-16 basis-1/2">
          <div
            className="basis-1/2 h-16 border-2 hover:border-blue-400 cursor-pointer content-center"
            onClick={(event) => onClick(event, "Rook", "R")}>Rook</div>
          <div
            className="basis-1/2 h-16 border-2 hover:border-blue-400 cursor-pointer content-center"
            onClick={(event) => onClick(event, "Bishop", "B")}>Bishop</div>
        </div>
        <div className="h-16 basis-1/2">
          <div
            className="basis-1/2 h-16 border-2 hover:border-blue-400 cursor-pointer content-center"
            onClick={(event) => onClick(event, "Knight", "N")}>Knight</div>
          <div
            className="basis-1/2 h-16 border-2 hover:border-blue-400 cursor-pointer content-center"
            onClick={(event) => onClick(event, "Queen", "Q")}>Queen</div>
        </div>
      </div>
    </>
  )
}
export default SelectPromotion;
