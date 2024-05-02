import clsx from "clsx"
import { PropsWithChildren, useEffect, useRef } from "react"

export interface PopoverProps {
  open: boolean,
  pos: { x: number, y: number }
}
export default function Popover({ children, open, pos }: PropsWithChildren<PopoverProps>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.top = (pos.y + "px");
      ref.current.style.left = (pos.x + "px");
    }
  }, [pos]);
  return (
    <>
      <div className={clsx("absolute", open ? "block" : "hidden")} ref={ref}>
        {children}
      </div>
    </>
  )
}
