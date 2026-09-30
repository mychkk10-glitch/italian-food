import type { DishTradition } from '../types';

const LABEL: Record<DishTradition, string> = {
  traditional: '郷土料理',
  regional: '地域でよく食べられる',
  modern: '現代的な食べ方',
};

const STYLE: Record<DishTradition, string> = {
  traditional: 'bg-accent-soft text-accent',
  regional: 'bg-olive-soft text-olive',
  modern: 'bg-line text-muted',
};

/**
 * 料理の「伝統度」ラベル。伝統料理と断定できないものは断定しない表現にする。
 */
export function TraditionBadge({ tradition }: { tradition: DishTradition }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${STYLE[tradition]}`}>
      {LABEL[tradition]}
    </span>
  );
}
