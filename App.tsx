import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dish, Ingredient, RecognitionResult as Recognition } from './types';
import { AppError } from './types';
import { ErrorView } from './components/ErrorView';
import { LoadingView } from './components/LoadingView';
import { Home } from './pages/Home';
import { RecognitionResult, type RecsState } from './pages/RecognitionResult';
import { DishDetail } from './pages/DishDetail';
import { About } from './pages/About';
import { useLocation } from './hooks/useLocation';
import { mockRecognizeById, recognizeImage } from './services/recognition';
import { getDishById, getRecommendations, regionOfDish } from './services/dishes';
import { USE_MOCK_RECOGNITION } from './services/config';

// ============================================================
// 画面遷移
//   home（＝ライブカメラ） → recognizing → result → detail
// ブラウザ履歴（pushState）と同期し、iOS のスワイプバック / 戻るボタンに対応する。
// 履歴には「ホームから何画面目か（depth）」を持たせ、ホームへ一気に戻れるようにする。
// ============================================================

type Screen = 'home' | 'recognizing' | 'result' | 'not-recognized' | 'error' | 'busy' | 'detail' | 'about';

let historyDepth = 0;

function navigate(screen: Screen, replace = false) {
  try {
    if (!replace) historyDepth += 1;
    const state = { screen, depth: historyDepth };
    if (replace) window.history.replaceState(state, '');
    else window.history.pushState(state, '');
  } catch {
    /* サンドボックス環境では history を操作できないことがある */
  }
}

export default function App() {
  const { location, refresh: refreshLocation, ensure: ensureLocation } = useLocation();

  const [screen, setScreenState] = useState<Screen>('home');
  const [photo, setPhoto] = useState<string>();
  const [recognition, setRecognition] = useState<Extract<Recognition, { kind: 'recognized' }>>();
  const [recs, setRecs] = useState<RecsState>({ status: 'loading' });
  const [dish, setDish] = useState<Dish>();
  const [loadingMessage, setLoadingMessage] = useState('食材を認識しています…');

  const runId = useRef(0);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  const go = useCallback((next: Screen, replace = false) => {
    navigate(next, replace);
    setScreenState(next);
    window.scrollTo(0, 0);
  }, []);

  // 戻る（ブラウザ履歴）
  const back = useCallback(() => {
    const before = screenRef.current;
    try {
      window.history.back();
    } catch {
      /* noop */
    }
    // 履歴が操作できない環境向けのフォールバック
    setTimeout(() => {
      if (screenRef.current === before) setScreenState(before === 'detail' ? 'result' : 'home');
    }, 350);
  }, []);

  useEffect(() => {
    try {
      historyDepth = 0;
      window.history.replaceState({ screen: 'home', depth: 0 }, '');
    } catch {
      /* noop */
    }
    const onPop = (e: PopStateEvent) => {
      const s = (e.state?.screen as Screen | undefined) ?? 'home';
      historyDepth = typeof e.state?.depth === 'number' ? e.state.depth : 0;
      // 認識処理中の画面には戻らない
      setScreenState(s === 'recognizing' ? 'home' : s);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // 古い写真の object URL を解放
  const setNewPhoto = useCallback((src: string | undefined) => {
    setPhoto((prev) => {
      if (prev && prev.startsWith('blob:') && prev !== src) URL.revokeObjectURL(prev);
      return src;
    });
  }, []);

  // ---------------- 料理候補の読み込み ----------------
  const regionId = location.status === 'ready' ? location.region?.id : undefined;

  const loadRecs = useCallback(
    async (ingredient: Ingredient) => {
      const id = ++runId.current;
      setRecs({ status: 'loading' });
      try {
        const region = location.status === 'ready' ? location.region : undefined;
        const data = await getRecommendations(ingredient, region);
        if (id === runId.current) setRecs({ status: 'ready', data });
      } catch {
        if (id === runId.current) setRecs({ status: 'error' });
      }
    },
    // 地域が変わったら（現在地の取得完了時など）再計算する
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [regionId, location.status],
  );

  useEffect(() => {
    if (recognition) loadRecs(recognition.ingredient);
  }, [recognition, loadRecs]);

  // ---------------- 認識の実行 ----------------
  const handleResult = useCallback(
    (result: Recognition) => {
      if (result.kind === 'not-recognized') {
        go('not-recognized', true);
        return;
      }
      setRecognition(result);
      go('result', true);
    },
    [go],
  );

  const handleCapture = useCallback(
    async (src: string) => {
      setNewPhoto(src);
      setRecognition(undefined);
      setLoadingMessage('食材を認識しています…');
      go('recognizing');

      try {
        // 認識と並行して現在地を確定させる
        const locPromise = ensureLocation();
        const result = await recognizeImage(src, location);
        if (result.kind === 'recognized') {
          setLoadingMessage('この地域の料理を探しています…');
          await Promise.race([locPromise, new Promise((r) => setTimeout(r, 4000))]);
        }
        handleResult(result);
      } catch (e) {
        if (e instanceof AppError && e.code === 'not-recognized') go('not-recognized', true);
        else if (e instanceof AppError && e.code === 'busy') go('busy', true);
        else go('error', true);
      }
    },
    [ensureLocation, go, handleResult, location, setNewPhoto],
  );

  const handleDemo = useCallback(
    async (ingredientId: string) => {
      setNewPhoto(undefined);
      setRecognition(undefined);
      setLoadingMessage('食材を認識しています…');
      go('recognizing');
      const result = await mockRecognizeById(ingredientId);
      handleResult(result);
    },
    [go, handleResult, setNewPhoto],
  );

  const handleSelectDish = useCallback(
    async (dishId: string) => {
      const d = await getDishById(dishId);
      if (!d) {
        go('error');
        return;
      }
      setDish(d);
      go('detail');
    },
    [go],
  );

  // 「別の食材を撮影する」：履歴をさかのぼってホーム（カメラ）へ戻る
  const retake = useCallback(() => {
    const depth = historyDepth;
    if (depth > 0) {
      try {
        window.history.go(-depth);
      } catch {
        /* noop */
      }
      // 履歴が操作できない環境向けのフォールバック
      setTimeout(() => {
        if (screenRef.current !== 'home') go('home', true);
      }, 400);
    } else {
      go('home', true);
    }
  }, [go]);

  // ---------------- 描画 ----------------
  switch (screen) {
    case 'recognizing':
      return <LoadingView photo={photo} message={loadingMessage} />;

    case 'not-recognized':
      return (
        <ErrorView
          photo={photo}
          title="この対象を認識できませんでした。"
          message={
            <>
              もう一度、明るい場所で
              <br />
              近づいて撮影してください。
            </>
          }
          primaryLabel="もう一度撮影する"
          onPrimary={retake}
          onBack={back}
        />
      );

    case 'error':
      return (
        <ErrorView
          title="料理情報を取得できませんでした。"
          message="もう一度お試しください。"
          primaryLabel="もう一度試す"
          onPrimary={() => (photo ? handleCapture(photo) : go('home', true))}
          onBack={back}
        />
      );

    case 'busy':
      return (
        <ErrorView
          photo={photo}
          title="ただいま混み合っています。"
          message={
            <>
              少し時間をおいてから
              <br />
              もう一度お試しください。
            </>
          }
          primaryLabel="もう一度試す"
          onPrimary={() => (photo ? handleCapture(photo) : go('home', true))}
          onBack={back}
        />
      );

    case 'about':
      return <About onBack={back} aiEnabled={!USE_MOCK_RECOGNITION} />;

    case 'result':
      if (!recognition) break;
      return (
        <RecognitionResult
          photo={photo}
          ingredient={recognition.ingredient}
          confidence={recognition.confidence}
          isMock={recognition.isMock}
          location={location}
          recs={recs}
          onBack={back}
          onRetake={retake}
          onRetryRecs={() => loadRecs(recognition.ingredient)}
          onSelectDish={handleSelectDish}
        />
      );

    case 'detail':
      if (!dish) break;
      return (
        <DishDetail
          dish={dish}
          region={regionOfDish(dish)}
          highlightIngredientId={recognition?.ingredient.id}
          onBack={back}
          onRetake={retake}
        />
      );

    case 'home':
      break;
  }

  return (
    <Home
      active={screen === 'home'}
      location={location}
      onCapture={handleCapture}
      onRetryLocation={refreshLocation}
      onOpenAbout={() => go('about')}
      onDemo={USE_MOCK_RECOGNITION ? handleDemo : undefined}
    />
  );
}
