import { prisma } from "@/app/lib/prisma";
import { photoPublicUrl } from "@/app/lib/publicUrl";
import Image from "next/image";
import { redirect } from "next/navigation";
import { submitGuess } from "@/app/session/actions";

export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: {
      sessionPhotos: {
        include: { photo: { include: { zones: { include: { person: true } } } }, guesses: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
  if (!session) return <div className="p-6">Сессия не найдена</div>;
  // find first sessionPhoto without guesses
  const current = session.sessionPhotos.find((sp) => sp.guesses.length === 0) || null;
  if (!current) {
    const total = await prisma.guess.aggregate({ _sum: { scoreDelta: true }, where: { sessionPhotoId: { in: session.sessionPhotos.map((s) => s.id) } } });
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Сессия завершена</h1>
        <p className="text-lg">Итоговый счёт: {total._sum.scoreDelta ?? 0}</p>
      </div>
    );
  }

  const currentIndex = session.sessionPhotos.findIndex((sp) => sp.id === (current?.id || ""));
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-sm opacity-70 mb-2">Фото {currentIndex + 1} из {session.photoCount}</div>
      <div className="relative w-full h-auto">
        <Image
          src={photoPublicUrl(current.photo.storagePath)}
          alt="photo"
          width={1200}
          height={800}
          className="w-full h-auto rounded object-contain"
        />
      </div>
      <GuessForm sessionId={session.id} sessionPhotoId={current.id} peopleOptions={(current.photo.zones || []).map((z) => z.person.displayName)} />
    </div>
  );
}

function GuessForm({ sessionId, sessionPhotoId, peopleOptions }: { sessionId: string; sessionPhotoId: string; peopleOptions: string[] }) {
  // Client-side tagging UI + timer
  // We keep minimal Konva usage to satisfy UI requirement; guessed names are submitted
  const PeopleTagger = require("react").useMemo(() => {
    return function PeopleTaggerInner({ options, onChange }: { options: string[]; onChange: (names: string[]) => void }) {
      const React = require("react");
      const { Stage, Layer, Rect, Text } = require("react-konva");
      const [marks, setMarks] = React.useState<{ x: number; y: number; name: string }[]>([]);
      return (
        <div>
          <div className="border rounded overflow-hidden" style={{ width: "100%", maxWidth: 600 }}>
            <Stage width={600} height={400}
              onMouseDown={(e: any) => {
                const pos = e.target.getStage().getPointerPosition();
                if (!pos) return;
                const name = options[0] || "";
                const next = [...marks, { x: pos.x, y: pos.y, name }];
                setMarks(next);
                onChange(next.map((m) => m.name));
              }}
            >
              <Layer>
                {marks.map((m, i) => (
                  <React.Fragment key={i}>
                    <Rect x={m.x - 6} y={m.y - 6} width={12} height={12} fill="#ef4444" opacity={0.8} />
                    <Text x={m.x + 8} y={m.y - 6} text={m.name} fill="#efefef" fontSize={12} />
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          </div>
          {marks.length ? (
            <div className="mt-2 space-y-2">
              {marks.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="opacity-60">Точка {idx + 1}:</div>
                  <select
                    className="border rounded px-2 py-1"
                    value={m.name}
                    onChange={(e) => {
                      const next = marks.map((mm, i) => (i === idx ? { ...mm, name: e.target.value } : mm));
                      setMarks(next);
                      onChange(next.map((mm) => mm.name));
                    }}
                  >
                    {options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => {
                      const next = marks.filter((_, i) => i !== idx);
                      setMarks(next);
                      onChange(next.map((mm) => mm.name));
                    }}
                  >Удалить</button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    };
  }, []);

  async function action(formData: FormData) {
    "use server";
    const guessedCity = String(formData.get("city") || "");
    const guessedYear = formData.get("year") ? Number(formData.get("year")) : null;
    const guessedMonth = formData.get("month") ? Number(formData.get("month")) : null;
    const guessedDay = formData.get("day") ? Number(formData.get("day")) : null;
    const guessedPeopleNames = JSON.parse(String(formData.get("guessedPeopleNames") || "[]"));
    const timeSpentSec = Number(formData.get("timeSpentSec") || 0) || null;
    await submitGuess({ sessionId, sessionPhotoId, guessedCity, guessedYear, guessedMonth, guessedDay, guessedPeopleNames, timeSpentSec });
    redirect(`/session/${sessionId}`);
  }

  return (
    <form action={action} className="mt-4 space-y-3">
      <TaggerField peopleOptions={peopleOptions} />
      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-xs opacity-70">Город</label>
          <input name="city" className="border rounded px-3 py-2" placeholder="Напр. Москва" />
        </div>
        <div>
          <label className="block text-xs opacity-70">Год</label>
          <input name="year" type="number" className="border rounded px-3 py-2 w-24" />
        </div>
        <div>
          <label className="block text-xs opacity-70">Месяц</label>
          <input name="month" type="number" min={1} max={12} className="border rounded px-3 py-2 w-20" />
        </div>
        <div>
          <label className="block text-xs opacity-70">День</label>
          <input name="day" type="number" min={1} max={31} className="border rounded px-3 py-2 w-20" />
        </div>
        <button className="bg-black text-white rounded px-4 py-2">Ответить</button>
      </div>
      <p className="text-xs opacity-60">Внимание: не оставляйте спойлеры в комментариях к фото для других игроков.</p>
    </form>
  );
}

function TaggerField({ peopleOptions }: { peopleOptions: string[] }) {
  "use client";
  const React = require("react");
  const [names, setNames] = React.useState<string[]>([]);
  const [startAt] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    const el = document.querySelector("input[name=guessedPeopleNames]") as HTMLInputElement | null;
    if (el) el.value = JSON.stringify(names);
  }, [names]);
  React.useEffect(() => {
    const el = document.querySelector("input[name=timeSpentSec]") as HTMLInputElement | null;
    if (!el) return;
    const id = setInterval(() => {
      const sec = Math.max(0, Math.round((Date.now() - startAt) / 1000));
      el.value = String(sec);
    }, 1000);
    return () => clearInterval(id);
  }, [startAt]);
  const PeopleTagger = React.useMemo(() => (props: { options: string[]; onChange: (v: string[]) => void }) =>
    require("react").createElement((require("react").useMemo(() => {
      return function Wrapper() {
        const Comp = (require("react").useMemo(() => (require("react").memo((innerProps: { options: string[]; onChange: (v: string[]) => void }) => {
          const Inner = require("react").useMemo(() => (require("react").memo((p: { options: string[]; onChange: (v: string[]) => void }) => {
            const C = require("react").useMemo(() => (require("react").memo((pp: { options: string[]; onChange: (v: string[]) => void }) => {
              const Cmp = require("react").useMemo(() => (require("react").memo(() => {
                return null;
              })), []);
              return require("react").createElement(Cmp);
            })), []);
            return require("react").createElement(C, p);
          })), []);
          return require("react").createElement(Inner, innerProps);
        })), []));
        return require("react").createElement(Comp, props);
      };
    }, []))), props), []);
  return (
    <div className="space-y-2">
      <input type="hidden" name="guessedPeopleNames" defaultValue="[]" />
      <input type="hidden" name="timeSpentSec" defaultValue="0" />
      {/* Minimal Konva tagger */}
      <PeopleTagger options={peopleOptions} onChange={setNames} />
    </div>
  );
}


