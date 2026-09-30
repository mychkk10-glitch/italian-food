import type { Dish, Region } from '../types';
import { DishImage } from '../components/DishImage';
import { IngredientList } from '../components/IngredientList';
import { TopBar } from '../components/TopBar';
import { TraditionBadge } from '../components/TraditionBadge';
import { CameraIcon, PinIcon } from '../components/icons';

interface Props {
  dish: Dish;
  region: Region;
  highlightIngredientId?: string;
  onBack: () => void;
  onRetake: () => void;
}

export function DishDetail({ dish, region, highlightIngredientId, onBack, onRetake }: Props) {
  return (
    <div className="screen-in min-h-[100dvh]">
      <div className="relative mx-auto max-w-xl">
        <TopBar onBack={onBack} overlay />
        {/* 写真を主役に。ノッチ下まで伸ばす */}
        <DishImage src={dish.imageUrl} alt={dish.nameItalian} className="aspect-[4/3] w-full sm:rounded-b-3xl" eager />
      </div>

      <main className="px-safe pb-safe relative mx-auto -mt-6 max-w-xl rounded-t-[28px] bg-paper pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[15px] font-bold text-accent">
            <PinIcon className="h-4 w-4" />
            {region.name}
            <span className="font-medium text-muted">・{region.nameJapanese}</span>
          </span>
          <TraditionBadge tradition={dish.tradition} />
        </div>

        <h1 className="mt-3 font-serif text-[32px] font-semibold leading-[1.15]">{dish.nameItalian}</h1>
        <p className="mt-2 text-[17px] font-medium text-muted">{dish.nameJapanese}</p>

        <p className="mt-5 text-[15px] leading-relaxed">{dish.description}</p>

        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[20px] font-bold tracking-tight">必要な材料</h2>
            <span className="text-[14px] font-semibold text-muted">{dish.servings}人分</span>
          </div>
          <IngredientList items={dish.ingredients} highlightIngredientId={highlightIngredientId} />
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            分量は目安です。地域や家庭によって材料・分量は異なります。
          </p>
        </section>

        <button
          type="button"
          onClick={onRetake}
          className="pressable mt-10 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-[16px] font-semibold text-paper"
        >
          <CameraIcon className="h-5 w-5" />
          別の食材を撮影する
        </button>
      </main>
    </div>
  );
}
