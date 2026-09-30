import type { ReactNode } from 'react';
import { AlertIcon, BackIcon } from './icons';

interface Props {
  title: string;
  message: ReactNode;
  photo?: string;
  primaryLabel: string;
  onPrimary: () => void;
  onBack: () => void;
}

/** 認識失敗・API エラーなどの全画面メッセージ */
export function ErrorView({ title, message, photo, primaryLabel, onPrimary, onBack }: Props) {
  return (
    <div className="screen-in pt-safe pb-safe px-safe flex min-h-[100dvh] flex-col">
      <div className="h-12">
        <button
          type="button"
          onClick={onBack}
          aria-label="戻る"
          className="pressable -ml-2 flex h-11 w-11 items-center justify-center rounded-full"
        >
          <BackIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {photo ? (
          <img src={photo} alt="撮影した写真" className="mb-6 h-32 w-32 rounded-3xl object-cover opacity-80 ring-1 ring-line" />
        ) : (
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <AlertIcon className="h-8 w-8" />
          </div>
        )}
        <p className="text-[19px] font-bold leading-relaxed">{title}</p>
        <div className="mt-2 text-[15px] leading-relaxed text-muted">{message}</div>
      </div>
      <button
        type="button"
        onClick={onPrimary}
        className="pressable h-14 w-full rounded-full bg-ink text-[17px] font-semibold text-paper"
      >
        {primaryLabel}
      </button>
    </div>
  );
}
