import type { LocationState } from '../types';
import { formatLocationLabel } from '../services/geolocation';
import { PinIcon } from './icons';

interface Props {
  location: LocationState;
  onRetry?: () => void;
}

/** 現在地ピル（ホーム画面・結果画面で共通） */
export function LocationBadge({ location, onRetry }: Props) {
  if (location.status === 'ready') {
    return (
      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[14px] font-semibold ring-1 ring-line">
        <PinIcon className="h-4 w-4 shrink-0 text-accent" />
        <span className="truncate">{formatLocationLabel(location)}</span>
      </span>
    );
  }
  if (location.status === 'loading' || location.status === 'idle') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[14px] text-muted ring-1 ring-line">
        <PinIcon className="h-4 w-4 animate-pulse" />
        現在地を取得中…
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onRetry}
      className="pressable inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[14px] text-muted ring-1 ring-line"
    >
      <PinIcon className="h-4 w-4" />
      現在地を取得できません
      {onRetry && <span className="font-semibold text-accent">再試行</span>}
    </button>
  );
}

/** 位置情報が使えないときの説明 */
export function LocationNotice({ location }: { location: LocationState }) {
  if (location.status !== 'denied' && location.status !== 'unavailable') return null;
  return (
    <div className="rounded-2xl bg-card p-4 text-[14px] leading-relaxed ring-1 ring-line">
      <p className="font-semibold">現在地を取得できません。</p>
      <p className="mt-1 text-muted">
        位置情報を許可すると、
        <br />
        現在いる地域の料理を提案できます。
      </p>
      {location.status === 'denied' && (
        <p className="mt-2 text-[12px] text-muted">
          iPhone：設定 › プライバシーとセキュリティ › 位置情報サービス › Safari Webサイト
        </p>
      )}
    </div>
  );
}
