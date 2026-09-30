import { TopBar } from '../components/TopBar';

interface Props {
  onBack: () => void;
  aiEnabled: boolean;
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-5 ring-1 ring-line">
      <h2 className="text-[17px] font-bold">{title}</h2>
      <div className="mt-2 space-y-2 text-[14px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}

/** このアプリについて / プライバシー */
export function About({ onBack, aiEnabled }: Props) {
  return (
    <div className="screen-in min-h-[100dvh]">
      <TopBar onBack={onBack} title="このアプリについて" />
      <main className="px-safe pb-safe mx-auto max-w-xl space-y-4 pt-2">
        <p className="text-[15px] leading-relaxed">
          What’s this? は、旅先で見つけた食材を撮影して、今いる地域でよく食べられている料理と、その材料を調べるためのアプリです。現在はイタリアの料理に対応しています。
        </p>

        <Block title="写真の扱い">
          {aiEnabled ? (
            <>
              <p>
                撮影した写真は縮小したうえで、食材を判定するために Google の Gemini API に送信されます。本アプリのサーバーは写真を保存しません。
              </p>
              <p>
                Gemini API の無料枠を利用しているため、送信された内容は Google の製品改善に使われる場合があります。人の顔や個人情報が写らないように撮影してください。
              </p>
            </>
          ) : (
            <p>デモ版のため、写真は端末の中だけで処理され、外部には送信されません。</p>
          )}
        </Block>

        <Block title="位置情報の扱い">
          <p>
            現在地の座標は、地域名（例: Milano, Lombardia）を調べるために OpenStreetMap の Nominatim に送信されます。本アプリのサーバーには送信・保存されません。
          </p>
          <p>位置情報を許可しない場合も、イタリア各地の料理を表示して利用できます。</p>
        </Block>

        <Block title="料理情報について">
          <p>
            料理は、確認済みの料理データの中から提案しています。伝統料理と断定できないものは「地域でよく食べられる」「現代的な食べ方」と表示しています。分量は目安です。
          </p>
          <p>AIの認識は間違えることがあります。アレルギーなどが心配な場合は、必ずお店の人に確認してください。</p>
        </Block>

        <Block title="クレジット">
          <p>地名データ © OpenStreetMap contributors（ODbL）</p>
        </Block>

        <p className="pt-2 text-center text-[12px] text-muted">アカウント登録・履歴の保存は行っていません。</p>
      </main>
    </div>
  );
}
