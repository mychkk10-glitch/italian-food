import { useRef, type ReactNode } from 'react';

interface Props {
  onPick: (imageSrc: string) => void;
  /** true: iOS では端末のカメラが直接起動する */
  capture?: boolean;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

/**
 * 写真の撮影/選択ボタン（<input type="file">）。
 * getUserMedia が使えない環境でも、iOS ではこれで標準カメラが開ける。
 */
export function PhotoPicker({ onPick, capture, className, ariaLabel, children }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className={className} aria-label={ariaLabel} onClick={() => inputRef.current?.click()}>
        {children}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        {...(capture ? { capture: 'environment' as const } : {})}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ''; // 同じ写真を続けて選べるようにする
          if (file) onPick(URL.createObjectURL(file));
        }}
      />
    </>
  );
}
