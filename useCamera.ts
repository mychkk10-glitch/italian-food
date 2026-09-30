import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'starting' | 'live' | 'denied' | 'unavailable';

/**
 * ライブカメラ（背面カメラ）を管理するフック。
 * - active=true の間だけカメラを動かし、false になったら止める（電池の節約）
 * - iOS Safari: <video playsInline muted> が必須。HTTPS（または localhost）でのみ動作
 * - アプリを裏に回して戻ったとき、止まった映像を自動で再開する
 */
export function useCamera(active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('starting');
  const [attempt, setAttempt] = useState(0);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      return;
    }
    let cancelled = false;
    setStatus('starting');

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unavailable');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          // iOS は play() の Promise が reject されることがあるため握りつぶす
          await video.play().catch(() => undefined);
        }
        setStatus('live');
      } catch (err) {
        if (cancelled) return;
        const name = (err as DOMException)?.name;
        setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable');
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [active, attempt, stop]);

  // バックグラウンドから戻ったとき、切れたストリームを再取得する
  useEffect(() => {
    if (!active) return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const track = streamRef.current?.getVideoTracks()[0];
      if (!track || track.readyState === 'ended') setAttempt((n) => n + 1);
      else videoRef.current?.play().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [active]);

  /** 現在のフレームを JPEG の object URL として返す */
  const capture = useCallback((): Promise<string | undefined> => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return Promise.resolve(undefined);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(undefined);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : undefined), 'image/jpeg', 0.9),
    );
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { videoRef, status, capture, retry };
}
