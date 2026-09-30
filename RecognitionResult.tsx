import type { Ingredient, LocationState, Recommendations } from '../types';
import { DishCard } from '../components/DishCard';
import { TopBar } from '../components/TopBar';
import { LocationNotice } from '../components/LocationBadge';
import { CameraIcon, PinIcon } from '../components/icons';
import { formatLocationLabel } from '../services/geolocation';

export type RecsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: Recommendations };

interface Props {
  photo?: string;
  ingredient: Ingredient;
  confidence: number;
  isMock: boolean;
  location: LocationState;
  recs: RecsState;
  onBack: () => void;
  onRetake: () => void;
  onRetryRecs: () => void;
  onSelectDish: (dishId: string) => void;
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-8">
      <h2 className="text-[20px] font-bold tracking-tight">{children}</h2>
      {sub && <p className="mt-1 text-[14px] leading-relaxed text-muted">{sub}</p>}
    </div>
  );
}

export function RecognitionResult({
  photo,
  ingredient,
  confidence,
  isMock,
  location,
  recs,
  onBack,
  onRetake,
  onRetryRecs,
  onSelectDish,
}: Props) {
  const region = location.status === 'ready' ? location.region : undefined;
  const locationLabel = formatLocationLabel(location);
  const lowConfidence = confidence < 0.6;

  return (
    <div className="screen-in min-h-[100dvh]">
      <TopBar onBack={onBack} />

      <main className="px-safe pb-safe mx-auto max-w-xl">
        {/* ---- 認識結果 ---- */}
        <section className="flex flex-col items-center pt-2 text-center">
          {photo && (
            <img
              src={photo}
              alt="撮影した写真"
              className="h-24 w-24 rounded-3xl object-cover shadow-md ring-4 ring-card"
            />
          )}
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-[13px] font-bold text-olive">
            <span className="h-1.5 w-1.5 rounded-full bg-olive" />
            認識しました
          </p>
          <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight">{ingredient.nameItalian}</h1>
          {ingredient.reading && <p className="mt-1 text-[17px] font-medium">{ingredient.reading}</p>}
          {ingredient.nameJapanese && ingredient.nameJapanese !== ingredient.reading && (
            <p className="mt-0.5 text-[14px] text-muted">{ingredient.nameJapanese}</p>
          )}
          <span className="mt-3 rounded-full bg-card px-3 py-1 text-[13px] font-semibold ring-1 ring-line">
            {ingredient.category}
          </span>
          {ingredient.description && (
            <p className="mt-4 text-left text-[15px] leading-relaxed">{ingredient.description}</p>
          )}
          {lowConfidence && (
            <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-left text-[13px] leading-relaxed text-accent">
              認識に自信がありません。違う場合は、明るい場所で近づいて撮り直してください。
            </p>
          )}
          {isMock && (
            <p className="mt-3 text-[12px] text-muted">
              {photo ? 'デモモード：画像の色から簡易的に推定しています' : 'デモモード：サンプルの認識結果です'}
            </p>
          )}
        </section>

        {/* ---- 現在地 ---- */}
        <div className="mt-6">
          {location.status === 'ready' ? (
            <p className="flex items-center gap-1.5 text-[16px] font-semibold">
              <PinIcon className="h-5 w-5 text-accent" />
              {locationLabel}
            </p>
          ) : location.status === 'loading' || location.status === 'idle' ? (
            <p className="flex items-center gap-1.5 text-[15px] text-muted">
              <PinIcon className="h-5 w-5 animate-pulse" />
              現在地を取得中…
            </p>
          ) : (
            <LocationNotice location={location} />
          )}
        </div>

        {/* ---- 料理候補 ---- */}
        {recs.status === 'loading' && (
          <div className="mt-8 space-y-4" aria-busy>
            <div className="h-6 w-40 rounded-md bg-line" />
            <div className="shimmer relative aspect-[4/3] overflow-hidden rounded-3xl bg-line" />
          </div>
        )}

        {recs.status === 'error' && (
          <div className="mt-8 rounded-2xl bg-card p-5 text-center ring-1 ring-line">
            <p className="font-semibold">料理情報を取得できませんでした。</p>
            <p className="mt-1 text-[14px] text-muted">もう一度お試しください。</p>
            <button
              type="button"
              onClick={onRetryRecs}
              className="pressable mt-4 h-11 rounded-full bg-ink px-6 text-[15px] font-semibold text-paper"
            >
              再読み込み
            </button>
          </div>
        )}

        {recs.status === 'ready' && (
          <RecommendationList
            data={recs.data}
            regionName={region?.name}
            hasLocation={location.status === 'ready'}
            locationPending={location.status === 'loading' || location.status === 'idle'}
            onSelectDish={onSelectDish}
          />
        )}

        <button
          type="button"
          onClick={onRetake}
          className="pressable mt-10 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-card text-[16px] font-semibold ring-1 ring-line"
        >
          <CameraIcon className="h-5 w-5" />
          別の食材を撮影する
        </button>
      </main>
    </div>
  );
}

function RecommendationList({
  data,
  regionName,
  hasLocation,
  locationPending,
  onSelectDish,
}: {
  data: Recommendations;
  regionName?: string;
  hasLocation: boolean;
  locationPending: boolean;
  onSelectDish: (id: string) => void;
}) {
  const { local, others } = data;

  if (local.length === 0 && others.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-card p-5 text-[15px] leading-relaxed ring-1 ring-line">
        <p className="font-semibold">この食材を使う料理のデータはまだありません。</p>
        <p className="mt-1 text-muted">不確かな料理を表示しないよう、確認できた料理だけを提案しています。</p>
      </div>
    );
  }

  return (
    <>
      {local.length > 0 && (
        <>
          <SectionTitle sub="この食材なら、この地域ではこんな料理があります。">
            {regionName}の料理
          </SectionTitle>
          <div className="space-y-5">
            {local.map((rec) => (
              <DishCard key={rec.dish.id} rec={rec} onSelect={() => onSelectDish(rec.dish.id)} />
            ))}
          </div>
        </>
      )}

      {others.length > 0 && (
        <>
          <SectionTitle
            sub={
              local.length > 0
                ? undefined
                : locationPending
                  ? '現在地を確認しています。取得でき次第、その地域の料理を優先して表示します。'
                  : hasLocation && regionName
                  ? `${regionName}でこの食材を使う料理はまだデータがありません。産地などの料理を紹介します。`
                  : hasLocation
                    ? '現在地の地域の料理データはまだありません。イタリア各地の料理を紹介します。'
                    : '現在地が分からないため、イタリア各地の料理を紹介します。'
            }
          >
            {local.length > 0 ? 'ほかの地域では' : 'この食材を使う料理'}
          </SectionTitle>
          {local.length > 0 ? (
            <div className="space-y-3">
              {others.map((rec) => (
                <DishCard key={rec.dish.id} rec={rec} variant="compact" onSelect={() => onSelectDish(rec.dish.id)} />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {others.map((rec) => (
                <DishCard key={rec.dish.id} rec={rec} onSelect={() => onSelectDish(rec.dish.id)} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
