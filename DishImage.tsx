import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

/** 料理写真。読み込めない場合は落ち着いたプレースホルダーを表示する */
export function DishImage({ src, alt, className = '', eager }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-accent-soft to-olive-soft ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="text-5xl" aria-hidden>
          🍝
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-line ${className}`}>
      {!loaded && <div className="shimmer absolute inset-0 overflow-hidden" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
