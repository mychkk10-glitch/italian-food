import type { RecipeIngredient } from '../types';

interface Props {
  items: RecipeIngredient[];
  /** 撮影した食材（ハイライト表示する） */
  highlightIngredientId?: string;
}

export function IngredientList({ items, highlightIngredientId }: Props) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card ring-1 ring-line">
      {items.map((item, i) => {
        const highlighted = !!highlightIngredientId && item.ingredientId === highlightIngredientId;
        return (
          <li
            key={`${item.nameItalian}-${i}`}
            className={`flex items-center gap-3 px-4 py-3.5 ${highlighted ? 'bg-accent-soft' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold leading-snug">
                {item.nameItalian}
                {highlighted && (
                  <span className="ml-2 inline-block rounded-full bg-accent px-2 py-0.5 align-middle text-[11px] font-bold text-accent-ink">
                    撮影した食材
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-[13px] text-muted">{item.nameJapanese}</p>
            </div>
            <p className="shrink-0 text-right text-[15px] font-medium tabular-nums">{item.amount}</p>
          </li>
        );
      })}
    </ul>
  );
}
