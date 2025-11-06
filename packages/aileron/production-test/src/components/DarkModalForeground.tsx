import {
  type ForwardedRef,
  type PropsWithChildren,
  forwardRef,
  useMemo,
} from "react";
import { useActiveModalCount } from "@lerx/promise-modal";
import type { ModalFrameProps } from "@lerx/promise-modal";

const MAX_MODAL_COUNT = 5;
const MAX_MODAL_LEVEL = 3;

export const DarkModalForeground = forwardRef(
  (
    { id, onChangeOrder, children }: PropsWithChildren<ModalFrameProps>,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const activeCount = useActiveModalCount();
    const [level, offset] = useMemo(() => {
      const stacked = activeCount > 1;
      const level = stacked
        ? (Math.floor(id / MAX_MODAL_COUNT) % MAX_MODAL_LEVEL) * 100
        : 0;
      const offset = stacked ? (id % MAX_MODAL_COUNT) * 35 : 0;
      return [level, offset];
    }, [activeCount, id]);

    return (
      <div
        ref={ref}
        onClick={onChangeOrder}
        style={{
          marginBottom: `calc(25vh + ${level}px)`,
          marginLeft: `${level}px`,
          transform: `translate(${offset}px, ${offset}px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a1a1a",
          color: "#e0e0e0",
          padding: "20px 80px",
          gap: "10px",
          border: "1px solid #555",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
        }}
      >
        {children}
      </div>
    );
  }
);

DarkModalForeground.displayName = "DarkModalForeground";
