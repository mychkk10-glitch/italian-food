import type { DishRecommendation } from '../types';
import { DishImage } from './DishImage';
import { TraditionBadge } from './TraditionBadge';
import { ChevronIcon, PinIcon } from './icons';

interface Props {
  rec: DishRecommendation;
  onSelect: () => void;
  /** 大きいカード（現在地の料理）/ 小さい横並びカード（他地域） */
  variant?: 'large' | 'compact';
}

export function DishCard({ rec, onSelect, variant = 'large' }: Props) {
  const { dish, region } = rec;

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="pressable flex w-full items-center gap-4 rounded-2xl bg-card p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-line"
      >
        <DishImage src={dish.imageUrl} alt={dish.nameItalian} className="h-20 w-20 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[17px] font-semibold leading-snug">{dish.nameItalian}</p>
          <p className="mt-0.5 truncate text-[13px] text-muted">{dish.nameJapanese}</p>
          <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-muted">
            <PinIcon className="h-3.5 w-3.5" />
            {region.name}
          </p>
        </div>
        <ChevronIcon className="h-5 w-5 shrink-0 text-muted" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="pressable block w-full overflow-hidden rounded-3xl bg-card text-left shadow-[0_8px_24px_-12px_rgba(60,40,20,0.35)] ring-1 ring-line"
    >
      <DishImage src={dish.imageUrl} alt={dish.nameItalian} className="aspect-[4/3] w-full" />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent">
            <PinIcon className="h-4 w-4" />
            {region.name}
          </span>
          <TraditionBadge tradition={dish.tradition} />
        </div>
        <h3 className="mt-2 font-serif text-[23px] font-semibold leading-tight">{dish.nameItalian}</h3>
        <p className="mt-1 text-[15px] text-muted">{dish.nameJapanese}</p>
        <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed">{dish.description}</p>
        <span className="mt-4 flex h-12 w-full items-center justify-center gap-1 rounded-full bg-ink text-[16px] font-semibold text-paper">
          この料理を見る
          <ChevronIcon className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}
