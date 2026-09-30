import type { ReactNode } from 'react';
import { BackIcon } from './icons';

interface Props {
  onBack: () => void;
  title?: string;
  /** 写真の上に重ねる（半透明の丸ボタン） */
  overlay?: boolean;
  right?: ReactNode;
}

export function TopBar({ onBack, title, overlay, right }: Props) {
  if (overlay) {
    return (
      <div className="top-safe pointer-events-none absolute left-0 right-0 z-20 flex items-center justify-between px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="戻る"
          className="pressable pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md"
        >
          <BackIcon className="h-5 w-5" />
        </button>
        {right}
      </div>
    );
  }
  return (
    <div className="pt-safe sticky top-0 z-20 bg-paper/85 backdrop-blur-xl">
      <div className="flex h-12 items-center gap-2 px-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="戻る"
          className="pressable flex h-11 w-11 items-center justify-center rounded-full text-ink"
        >
          <BackIcon className="h-6 w-6" />
        </button>
        {title && <p className="flex-1 truncate text-center text-[16px] font-semibold">{title}</p>}
        <span className="w-11">{right}</span>
      </div>
    </div>
  );
}
