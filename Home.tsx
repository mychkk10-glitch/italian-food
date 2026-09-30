import { useCallback, useState } from 'react';
import type { LocationState } from '../types';
import { CameraIcon, PhotoIcon, PinIcon } from '../components/icons';
import { PhotoPicker } from '../components/PhotoPicker';
import { DEMO_INGREDIENTS } from '../services/recognition';
import { formatLocationLabel } from '../services/geolocation';
import { useCamera } from '../hooks/useCamera';

interface Props {
  /** ホームが表示されている間だけカメラを動かす */
  active: boolean;
  location: LocationState;
  onCapture: (src: string) => void;
  onRetryLocation: () => void;
  onOpenAbout: () => void;
  /** APIなし（モック）のときだけ、撮影せずに試せる導線を出す */
  onDemo?: (ingredientId: string) => void;
}

/** 映像の上に載せる、すりガラスのピル */
const glass = 'bg-black/35 text-white backdrop-blur-md ring-1 ring-white/15';

function LocationPill({ location, onRetry }: { location: LocationState; onRetry: () => void }) {
  if (location.status === 'ready') {
    return (
      <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-semibold ${glass}`}>
        <PinIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">{formatLocationLabel(location)}</span>
      </span>
    );
  }
  if (location.status === 'loading' || location.status === 'idle') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] ${glass}`}>
        <PinIcon className="h-4 w-4 animate-pulse" />
        現在地を取得中…
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onRetry}
      className={`pressable inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-left text-[13px] leading-snug ${glass}`}
    >
      <PinIcon className="h-4 w-4 shrink-0" />
      <span>
        現在地を取得できません
        <span className="block text-[11px] text-white/70">位置情報を許可すると、今いる地域の料理を提案できます</span>
      </span>
    </button>
  );
}

/**
 * ホーム画面＝カメラ画面。
 * 開いた瞬間から背面カメラの映像を全画面の背景に映し、そのままシャッターで撮影する。
 */
export function Home({ active, location, onCapture, onRetryLocation, onOpenAbout, onDemo }: Props) {
  const { videoRef, status, capture, retry } = useCamera(active);
  const [flash, setFlash] = useState(false);
  const live = status === 'live';
  const failed = status === 'denied' || status === 'unavailable';

  const shoot = useCallback(async () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    navigator.vibrate?.(10);
    const src = await capture();
    if (src) onCapture(src);
  }, [capture, onCapture]);

  return (
    <main className="fixed inset-0 overflow-hidden bg-black text-white" aria-label="カメラ">
      {/* 背景：ライブ映像 */}
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          live ? 'opacity-100' : 'opacity-0'
        }`}
        playsInline
        muted
        autoPlay
        aria-hidden
      />

      {/* カメラが使えないときの背景 */}
      {!live && (
        <div
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,#3b2a1f_0%,#140f0c_70%)]"
          aria-hidden
        />
      )}

      {/* 文字を読みやすくするための上下のグラデーション */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/75 to-transparent" />

      {flash && <div className="pointer-events-none absolute inset-0 z-30 bg-white/80" />}

      <div className="relative z-10 flex h-full flex-col">
        {/* 上部：タイトルと現在地 */}
        <header className="pt-safe px-safe flex flex-col items-center pt-4 text-center">
          <h1 className="font-serif text-[30px] font-semibold tracking-tight drop-shadow">What’s this?</h1>
          <div className="mt-3 max-w-full">
            <LocationPill location={location} onRetry={onRetryLocation} />
          </div>
        </header>

        {/* 中央：撮影ガイド枠 / 状態メッセージ */}
        <section className="flex min-h-0 flex-1 items-center justify-center px-10 py-5">
          {live && (
            <div className="relative aspect-square h-full max-h-[280px] max-w-full">
              {(
                [
                  'left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl',
                  'right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl',
                  'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-3xl',
                  'right-0 bottom-0 border-r-4 border-b-4 rounded-br-3xl',
                ] as const
              ).map((c) => (
                <span key={c} className={`absolute h-11 w-11 border-white/90 drop-shadow ${c}`} />
              ))}
            </div>
          )}

          {status === 'starting' && (
            <p className="text-[15px] text-white/75" role="status">
              カメラを起動しています…
            </p>
          )}

          {failed && (
            <div className="max-w-[320px] text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <CameraIcon className="h-8 w-8" />
              </div>
              <p className="text-[17px] font-semibold leading-relaxed">カメラを利用できません。</p>
              <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                {status === 'denied' ? (
                  <>
                    ブラウザの設定からカメラへの
                    <br />
                    アクセスを許可してください。
                  </>
                ) : (
                  <>この端末・ブラウザではカメラを起動できませんでした。</>
                )}
              </p>
              {status === 'denied' && (
                <p className="mt-2 text-[12px] leading-relaxed text-white/55">
                  iPhone：設定 › アプリ › Safari › カメラ
                </p>
              )}
              <div className="mt-6 flex flex-col items-center gap-2">
                <PhotoPicker
                  onPick={onCapture}
                  capture
                  className="pressable inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[16px] font-semibold text-black"
                >
                  <CameraIcon className="h-5 w-5" />
                  写真を撮る・選ぶ
                </PhotoPicker>
                <button type="button" onClick={retry} className="pressable h-11 px-4 text-[14px] font-semibold text-white/80">
                  もう一度カメラを起動する
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 下部：ヒント・デモ・シャッター */}
        <footer className="pb-safe">
          {live && (
            <p className="px-safe mb-4 text-center text-[14px] font-medium text-white/90 drop-shadow">
              食材やメニューを撮影して
              <br />
              その土地の料理を見つける
            </p>
          )}

          {onDemo && (
            <div className="mb-4">
              <p className="px-safe mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-white/60">
                デモ：撮影せずに試す
              </p>
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-5">
                {DEMO_INGREDIENTS.map((ing) => (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => onDemo(ing.id)}
                    className={`pressable shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold ${glass}`}
                  >
                    {ing.nameItalian}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-safe flex items-center justify-between">
            <PhotoPicker
              onPick={onCapture}
              className={`pressable flex h-12 w-12 items-center justify-center rounded-full ${glass}`}
              ariaLabel="写真から選ぶ"
            >
              <PhotoIcon className="h-6 w-6" />
            </PhotoPicker>

            <button
              type="button"
              onClick={shoot}
              disabled={!live}
              hidden={failed}
              aria-label="撮影する"
              className="pressable flex h-[78px] w-[78px] items-center justify-center rounded-full border-4 border-white/95 disabled:opacity-30"
            >
              <span className="h-[62px] w-[62px] rounded-full bg-white" />
            </button>

            {failed && <span className="h-[78px] w-[78px]" aria-hidden />}
            <span className="h-12 w-12" aria-hidden />
          </div>

          <p className="px-safe mt-4 text-center text-[11px] text-white/60">
            <button type="button" onClick={onOpenAbout} className="font-semibold underline underline-offset-2">
              このアプリについて・プライバシー
            </button>
            <span className="mx-1.5">·</span>
            地名 © OpenStreetMap
          </p>
        </footer>
      </div>
    </main>
  );
}
