interface Props {
  photo?: string;
  message: string;
}

/** 認識中の画面：撮影した写真の上をスキャンラインが走る */
export function LoadingView({ photo, message }: Props) {
  return (
    <div className="screen-in pt-safe pb-safe px-safe flex min-h-[100dvh] flex-col items-center justify-center">
      <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-[32px] bg-line shadow-xl">
        {photo && <img src={photo} alt="撮影した写真" className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-black/10" />
        <div className="scan-line absolute left-[6%] right-[6%] h-[3px] rounded-full bg-white shadow-[0_0_24px_6px_rgba(255,255,255,0.7)]" />
      </div>
      <p className="mt-8 text-[17px] font-semibold" role="status" aria-live="polite">
        {message}
      </p>
      <p className="mt-2 text-[14px] text-muted">少しだけお待ちください</p>
    </div>
  );
}
