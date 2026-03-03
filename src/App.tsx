import { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   GOOGLE SHEETS
   ============================================================ */
const GOOGLE_SHEET_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxrkgL0lJ8620wHxfvq_iYUet7Z1dEa7ZIlK4NMivxBpMrzMGVbptXl4F5q_6A4cCv2/exec";

/* ============================================================
   TYPES
   ============================================================ */
type Phase = "loading" | "intro" | "main";

/* ============================================================
   TYPEWRITER HOOK
   ============================================================ */
function useTypewriter(text: string, speed: number, active: boolean) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, active]);

  return { displayed, done };
}

/* ============================================================
   FINGERPRINT SVG COMPONENT
   ============================================================ */
function FingerprintSVG({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <svg onClick={onClick} className={className} viewBox="0 0 100 120" fill="none" stroke="currentColor">
      <ellipse cx="50" cy="60" rx="45" ry="54" strokeWidth="1.5" strokeDasharray="6 3" />
      <ellipse cx="50" cy="60" rx="38" ry="46" strokeWidth="1.5" />
      <ellipse cx="50" cy="60" rx="31" ry="38" strokeWidth="1.5" strokeDasharray="8 4" />
      <ellipse cx="50" cy="60" rx="24" ry="30" strokeWidth="1.5" />
      <ellipse cx="50" cy="60" rx="17" ry="22" strokeWidth="1.5" strokeDasharray="5 3" />
      <ellipse cx="50" cy="60" rx="10" ry="14" strokeWidth="1.5" />
      <ellipse cx="50" cy="60" rx="4" ry="6" strokeWidth="1.5" />
    </svg>
  );
}

/* ============================================================
   MAGNIFYING GLASS ICON
   ============================================================ */
function MagnifyingGlass({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export function App() {
  /* ---------- Phase ---------- */
  const [phase, setPhase] = useState<Phase>("loading");
  const [fadeOut, setFadeOut] = useState(false);

  /* ---------- Loading ---------- */
  const [progress, setProgress] = useState(0);

  /* ---------- Puzzle ---------- */
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [code, setCode] = useState(["", "", "", ""]);
  const [codeError, setCodeError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ---------- RSVP ---------- */
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpDone, setRsvpDone] = useState<"none" | "yes" | "no">("none");

  /* ---------- Secrets ---------- */
  const [uvOn, setUvOn] = useState(false);
  const [stampClicks, setStampClicks] = useState(0);
  const [fingerprintClicks, setFingerprintClicks] = useState(0);
  const [secret1, setSecret1] = useState(false); // stamp
  const [secret2, setSecret2] = useState(false); // fingerprint
  const [secret3, setSecret3] = useState(false); // uv
  const [secretMsg, setSecretMsg] = useState("");
  const [redactedRevealed, setRedactedRevealed] = useState(false);

  const secretsCount = [secret1, secret2, secret3].filter(Boolean).length;

  /* ---------- Intro Text ---------- */
  const introText = `ВНИМАНИЕ!\nПеремещение по секретным каналам связи...\n\nАгент под кодовым именем «ИНКОГНИТО»\nинициировала операцию особой важности.\n\nВы включены в список оперативной группы.\nЯвка обязательна. Провал исключён.\n\nГотовы принять дело?`;

  const { displayed: typedIntro, done: introDone } = useTypewriter(introText, 30, phase === "intro");

  /* =========================
     LOADING EFFECT
     ========================= */
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 10 + 4;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              setPhase("intro");
              setFadeOut(false);
            }, 700);
          }, 600);
          return 100;
        }
        return next;
      });
    }, 160);
    return () => clearInterval(timer);
  }, [phase]);

  /* =========================
     SECRET: STAMP
     ========================= */
  useEffect(() => {
    if (stampClicks >= 5 && !secret1) {
      setSecret1(true);
      setSecretMsg("🔍 Штамп идентифицирован! Вы — настоящий детектив!");
      setTimeout(() => setSecretMsg(""), 4000);
    }
  }, [stampClicks, secret1]);

  /* =========================
     SECRET: FINGERPRINT
     ========================= */
  useEffect(() => {
    if (fingerprintClicks >= 3 && !secret2) {
      setSecret2(true);
      setSecretMsg("🕵️ Скрытый отпечаток обнаружен! Улика добавлена в дело.");
      setTimeout(() => setSecretMsg(""), 4000);
    }
  }, [fingerprintClicks, secret2]);

  /* =========================
     SECRET: UV
     ========================= */
  useEffect(() => {
    if (uvOn && !secret3) {
      setSecret3(true);
    }
  }, [uvOn, secret3]);

  /* =========================
     PHASE TRANSITIONS
     ========================= */
  const goToMain = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      setPhase("main");
      setFadeOut(false);
    }, 700);
  }, []);

  /* =========================
     CODE INPUT HANDLERS
     ========================= */
  const handleCodeChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d?$/.test(value)) return;
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setCodeError(false);
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [code]
  );

  const handleCodeKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code]
  );

  const submitCode = useCallback(() => {
    const entered = code.join("");
    if (entered.length < 4) return;
    if (entered === "2703") {
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        setUnlocked(true);
        setShowPuzzle(false);
      }, 2000);
    } else {
      setCodeError(true);
      setTimeout(() => {
        setCodeError(false);
        setCode(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }, 700);
    }
  }, [code]);

  const submitRsvp = useCallback(
    (response: "yes" | "no") => {
      const name = rsvpName.trim();
      if (!name) {
        setRsvpDone(response);
        return;
      }

      // Способ 1: динамическая форма в body (надёжно с любого домена)
      const form = document.createElement("form");
      form.method = "POST";
      form.action = GOOGLE_SHEET_SCRIPT_URL;
      form.target = "rsvp-iframe";
      form.style.display = "none";

      const nameInput = document.createElement("input");
      nameInput.name = "name";
      nameInput.value = name;
      form.appendChild(nameInput);

      const responseInput = document.createElement("input");
      responseInput.name = "response";
      responseInput.value = response;
      form.appendChild(responseInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      setRsvpDone(response);
    },
    [rsvpName]
  );

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={`min-h-screen text-gray-200 relative overflow-x-hidden ${uvOn ? "uv-active" : ""}`}>
      {/* Overlays */}
      <div className="scan-lines" />
      <div className="noise-overlay" />

      {/* UV Toggle */}
      {phase === "main" && (
        <button
          onClick={() => setUvOn(!uvOn)}
          className={`fixed top-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all duration-300 border-2 ${
            uvOn
              ? "bg-purple-700/80 border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.6)]"
              : "bg-gray-900/80 border-gray-700 hover:border-gray-500 hover:bg-gray-800/80"
          }`}
          title="УФ-лампа (ищи скрытые улики!)"
        >
          🔦
        </button>
      )}

      {/* Secrets Counter */}
      {phase === "main" && secretsCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-950/90 border border-amber-500/40 rounded-lg px-3 py-2 text-xs font-mono text-amber-400 backdrop-blur-sm">
          <span className="opacity-60">Улики: </span>
          <span className="font-bold">{secretsCount}</span>
          <span className="opacity-60">/3</span>
          {secretsCount === 3 && <span className="ml-1">🏆</span>}
        </div>
      )}

      {/* Secret Message Popup */}
      {secretMsg && (
        <div className="fixed top-1/2 left-1/2 z-[200] secret-popup bg-gray-950 border-2 border-amber-500 rounded-xl px-6 py-5 text-amber-400 font-mono text-center text-sm sm:text-base shadow-[0_0_40px_rgba(245,158,11,0.25)] max-w-xs sm:max-w-sm w-[90%]">
          {secretMsg}
        </div>
      )}

      {/* ================================
          LOADING PHASE
          ================================ */}
      {phase === "loading" && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f] transition-opacity duration-600 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="text-center px-6 w-full max-w-sm">
            {/* Logo / Icon */}
            <div className="mb-8 flex justify-center">
              <MagnifyingGlass className="w-12 h-12 text-amber-500 opacity-60 flicker" />
            </div>
            <p className="font-mono text-xs sm:text-sm text-amber-500 mb-6 tracking-[0.25em] uppercase">
              Загрузка секретных файлов
            </p>
            {/* Progress bar */}
            <div className="w-full h-[3px] bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-200 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="font-mono text-[10px] text-gray-600 mt-3 tracking-widest">
              {Math.min(Math.floor(progress), 100)}% ЗАВЕРШЕНО
            </p>
            {/* Fake log messages */}
            <div className="mt-6 text-left text-[10px] text-gray-700 font-mono space-y-1">
              {progress > 15 && <p className="animate-fadeIn">&gt; Установка защищённого соединения...</p>}
              {progress > 35 && <p className="animate-fadeIn">&gt; Проверка допуска агента...</p>}
              {progress > 55 && <p className="animate-fadeIn">&gt; Расшифровка оперативных данных...</p>}
              {progress > 75 && <p className="animate-fadeIn">&gt; Подготовка материалов дела...</p>}
              {progress >= 99 && <p className="animate-fadeIn text-green-600">&gt; Готово. Доступ разрешён.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ================================
          INTRO PHASE
          ================================ */}
      {phase === "intro" && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f] p-6 transition-opacity duration-600 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="max-w-lg w-full">
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-4 opacity-40">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-[10px] font-mono text-gray-500">secure_channel_v2.7</span>
            </div>
            {/* Terminal body */}
            <div className="bg-gray-950/80 border border-gray-800 rounded-lg p-5 sm:p-8">
              <pre className="font-typewriter text-green-400 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                {typedIntro}
                {!introDone && <span className="animate-blink text-green-300">▌</span>}
              </pre>
              {introDone && (
                <div className="mt-8 text-center animate-fadeIn">
                  <button
                    onClick={goToMain}
                    className="px-8 py-3 border-2 border-red-600 text-red-400 font-heading text-base sm:text-lg tracking-[0.2em] uppercase hover:bg-red-600/10 active:scale-95 transition-all duration-300 pulse-button"
                  >
                    ПРИНЯТЬ ДЕЛО
                  </button>
                  <p className="text-gray-600 text-[10px] font-mono mt-3 tracking-wider">
                    [ НАЖМИТЕ ДЛЯ ДОСТУПА К МАТЕРИАЛАМ ]
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================
          MAIN PHASE
          ================================ */}
      {phase === "main" && (
        <div className={`transition-opacity duration-700 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
          {/* Скрытый iframe для POST в Google Sheets (избегаем перехода со страницы) */}
          <iframe name="rsvp-iframe" title="RSVP" className="hidden" />

          {/* ---- CRIME TAPE TOP ---- */}
          <div className="crime-tape w-[110%] -ml-[5%]" />

          {/* ---- CASE HEADER ---- */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-6 relative animate-slideUp">
            {/* Classified stamp */}
            <div className="mb-6" onClick={() => setStampClicks((s) => s + 1)}>
              <span className="stamp">СОВЕРШЕННО СЕКРЕТНО</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl text-white tracking-[0.15em] mb-2 glitch-hover">
              ДЕЛО №27-0903
            </h1>
            <p className="font-mono text-[10px] sm:text-xs text-gray-600 tracking-[0.2em] uppercase">
              Оперативное подразделение «Новосибирск» • Гриф: Особой важности
            </p>

            {/* Fingerprint watermark */}
            <div className="absolute top-8 right-3 sm:right-6">
              <FingerprintSVG
                className="w-16 h-20 sm:w-20 sm:h-24 text-white opacity-[0.06] hover:opacity-[0.15] transition-opacity duration-700 cursor-pointer"
                onClick={() => setFingerprintClicks((f) => f + 1)}
              />
            </div>
          </section>

          {/* ---- DIVIDER ---- */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="border-t border-gray-800/60" />
          </div>

          {/* ---- STORY SECTION ---- */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-slideUp" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="evidence-marker">1</div>
              <h2 className="font-heading text-xl sm:text-2xl text-amber-500 tracking-[0.15em] uppercase">
                Оперативная сводка
              </h2>
            </div>
            <div className="bg-gray-900/40 border border-gray-800/60 rounded-lg p-5 sm:p-6 font-typewriter text-gray-300 text-sm sm:text-base leading-relaxed space-y-4">
              <p>
                <span className="text-gray-600 text-xs font-mono block mb-2">[ОПЕРАТИВНАЯ ИНФОРМАЦИЯ]</span>
                9 марта в Новосибирске намечается событие{" "}
                <span className="text-red-400 font-bold">высшей степени секретности</span>. Агент под кодовым именем{" "}
                <span className="text-amber-400 font-bold">«ИНКОГНИТО»</span> отмечает{" "}
                <span className="text-white font-bold">27-й год</span> работы в тени.
              </p>
              <p>
                По данным разведки, агент планирует собрать элитную группу оперативников для проведения спецоперации
                под кодовым названием{" "}
                <span className="text-red-400 font-bold">«ДЕНЬ РОЖДЕНИЯ»</span>.
              </p>
              <p>
                Ваше присутствие на данной операции{" "}
                <span className="underline decoration-red-500 decoration-2 underline-offset-4">обязательно</span>.
                Провал — не вариант. Неявка будет расценена как{" "}
                <span
                  className={`redacted ${redactedRevealed ? "revealed" : ""}`}
                  onClick={() => setRedactedRevealed(true)}
                >
                  предательство
                </span>
                .
              </p>
              {/* UV hidden message */}
              <div className="uv-hidden text-xs italic font-mono">
                🔮 Секретная заметка от агента: «Буду рада сюрпризам и подаркам от души... Но это строго между нами!»
              </div>
            </div>
          </section>

          {/* ---- DETAILS GRID ---- */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-slideUp" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="evidence-marker">2</div>
              <h2 className="font-heading text-xl sm:text-2xl text-amber-500 tracking-[0.15em] uppercase">
                Материалы дела
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Agent */}
              <div className="detail-card">
                <div className="text-gray-500 text-[10px] tracking-[0.2em] mb-1 uppercase">Объект</div>
                <div className="text-white font-heading text-lg sm:text-xl tracking-wider">АЛЕНА ИНКОГНИТО</div>
                <div className="text-amber-400 text-xs sm:text-sm mt-1 font-mono">Кодовое имя: «ИНКОГНИТО»</div>
              </div>
              {/* Age */}
              <div className="detail-card">
                <div className="text-gray-500 text-[10px] tracking-[0.2em] mb-1 uppercase">Возраст агента</div>
                <div className="text-white font-heading text-lg sm:text-xl tracking-wider">27 ЛЕТ</div>
                <div className="text-amber-400 text-xs sm:text-sm mt-1 font-mono">Юбилей оперативной деятельности</div>
              </div>
              {/* Date */}
              <div className="detail-card">
                <div className="text-gray-500 text-[10px] tracking-[0.2em] mb-1 uppercase">Дата операции</div>
                <div className="text-white font-heading text-lg sm:text-xl tracking-wider">9 МАРТА</div>
                <div className="text-amber-400 text-xs sm:text-sm mt-1 font-mono">Воскресенье</div>
              </div>
              {/* Time */}
              <div className="detail-card">
                <div className="text-gray-500 text-[10px] tracking-[0.2em] mb-1 uppercase">Время</div>
                <div className="text-white font-heading text-lg sm:text-xl tracking-wider">18:00 — 00:00</div>
                <div className="text-amber-400 text-xs sm:text-sm mt-1 font-mono">6 часов оперативной работы</div>
              </div>
              {/* Dress code - full width */}
              <div className="detail-card sm:col-span-2">
                <div className="text-gray-500 text-[10px] tracking-[0.2em] mb-1 uppercase">Форма одежды</div>
                <div className="text-white font-heading text-lg sm:text-xl tracking-wider">ДЕТЕКТИВ В ШТАТСКОМ</div>
                <div className="text-amber-400 text-xs sm:text-sm mt-1 font-mono">
                  Базовый стиль: элегантно, загадочно, по-детективному 🕶️
                </div>
              </div>
            </div>
          </section>

          {/* ---- LOCATION SECTION ---- */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-slideUp" style={{ animationDelay: "0.45s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="evidence-marker">3</div>
              <h2 className="font-heading text-xl sm:text-2xl text-amber-500 tracking-[0.15em] uppercase">
                Место проведения
              </h2>
            </div>

            {/* LOCKED STATE */}
            {!unlocked && !scanning && (
              <div className="bg-gray-900/40 border border-gray-800/60 rounded-lg p-5 sm:p-6 text-center">
                <div className="text-red-500 font-heading text-lg sm:text-xl mb-1 tracking-wider flicker">
                  ⛔ ДАННЫЕ ЗАСЕКРЕЧЕНЫ ⛔
                </div>
                <p className="text-gray-500 font-mono text-xs sm:text-sm mb-6">
                  Для получения координат точки сбора необходимо ввести код доступа
                </p>

                {!showPuzzle ? (
                  <button
                    onClick={() => {
                      setShowPuzzle(true);
                      setTimeout(() => inputRefs.current[0]?.focus(), 200);
                    }}
                    className="px-6 sm:px-8 py-3 border-2 border-amber-500 text-amber-400 font-heading text-sm sm:text-base tracking-[0.2em] uppercase hover:bg-amber-500/10 active:scale-95 transition-all duration-300"
                  >
                    🔐 РАЗБЛОКИРОВАТЬ
                  </button>
                ) : (
                  <div className="space-y-5 animate-fadeInScale">
                    {/* Hint */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <p className="text-gray-400 font-mono text-xs sm:text-sm">
                        <span className="text-amber-500 font-bold">ПОДСКАЗКА:</span> Код состоит из 4 цифр.
                      </p>
                      <p className="text-gray-500 font-mono text-xs mt-1">
                        Первые две — возраст агента. Последние две — номер месяца операции.
                      </p>
                    </div>

                    {/* Code inputs */}
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {code.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            inputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          className={`code-input ${codeError ? "error shake" : ""}`}
                        />
                      ))}
                    </div>

                    {/* Submit */}
                    <button
                      onClick={submitCode}
                      disabled={code.some((d) => !d)}
                      className="px-6 py-2.5 bg-amber-600 text-black font-heading text-sm tracking-[0.15em] uppercase hover:bg-amber-500 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                    >
                      ВВЕСТИ КОД
                    </button>

                    {/* Error message */}
                    {codeError && (
                      <p className="text-red-500 font-mono text-xs sm:text-sm animate-fadeIn">
                        ❌ КОД НЕВЕРНЫЙ. ПОПРОБУЙТЕ СНОВА.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SCANNING STATE */}
            {scanning && (
              <div className="bg-gray-900/40 border border-green-500/50 rounded-lg p-6 sm:p-8 text-center relative overflow-hidden scan-animation glow-green">
                <div className="text-green-400 font-mono text-sm sm:text-base">
                  <span className="inline-flex items-center gap-2">
                    ✅ КОД ПРИНЯТ
                    <span className="flex gap-1">
                      <span className="typing-dot w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                      <span className="typing-dot w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                      <span className="typing-dot w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    </span>
                  </span>
                </div>
                <p className="text-green-500/60 font-mono text-xs mt-2 tracking-wider">РАСШИФРОВКА КООРДИНАТ...</p>
              </div>
            )}

            {/* UNLOCKED STATE */}
            {unlocked && (
              <div className="bg-gray-900/40 border border-green-500/30 rounded-lg p-5 sm:p-6 animate-fadeInScale">
                <div className="text-green-400 font-mono text-xs sm:text-sm mb-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  ДОСТУП РАЗРЕШЁН
                </div>
                <div className="text-center">
                  <div className="text-white font-heading text-2xl sm:text-3xl tracking-wider mb-1">
                    ЛОФТ №1 «ШАЙН»
                  </div>
                  <div className="text-gray-300 font-mono text-sm sm:text-base mt-2">
                    г. Новосибирск
                  </div>
                  <div className="text-gray-400 font-mono text-sm sm:text-base">
                    ул. Фабричная, 10к6
                  </div>
                  <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="https://yandex.ru/maps/?text=Новосибирск+ул+Фабричная+10к6+ЛОФТ+ШАЙН"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-800 text-amber-400 font-mono text-xs sm:text-sm hover:bg-gray-700 transition-all rounded border border-gray-700"
                    >
                      📍 Яндекс Карты
                    </a>
                    <a
                      href="https://2gis.ru/novosibirsk/search/ул+Фабричная+10к6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-800 text-amber-400 font-mono text-xs sm:text-sm hover:bg-gray-700 transition-all rounded border border-gray-700"
                    >
                      🗺️ 2ГИС
                    </a>
                  </div>
                </div>
                {/* UV hidden message */}
                <div className="uv-hidden text-xs italic font-mono text-center">
                  🔮 Парковка рядом бесплатная. Но это вы не от меня узнали.
                </div>
              </div>
            )}
          </section>

          {/* ---- CRIME TAPE DIVIDER ---- */}
          <div className="crime-tape w-[110%] -ml-[5%] my-2 sm:my-4" />

          {/* ---- RSVP SECTION ---- */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-slideUp" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="evidence-marker">4</div>
              <h2 className="font-heading text-xl sm:text-2xl text-amber-500 tracking-[0.15em] uppercase">
                Подтверждение явки
              </h2>
            </div>

            {rsvpDone === "none" ? (
              <div className="bg-gray-900/40 border border-gray-800/60 rounded-lg p-5 sm:p-6">
                <p className="text-gray-400 font-mono text-xs sm:text-sm mb-5">
                  Агент, подтвердите ваше участие в операции. Это важно для планирования.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-500 text-[10px] tracking-[0.2em] uppercase block mb-2">
                      Ваше кодовое имя (настоящее имя)
                    </label>
                    <input
                      type="text"
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Введите имя..."
                      className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm placeholder:text-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => submitRsvp("yes")}
                      disabled={!rsvpName.trim()}
                      className="flex-1 px-5 py-3 bg-green-600/15 border-2 border-green-600 text-green-400 font-heading text-sm tracking-[0.15em] uppercase hover:bg-green-600/25 active:scale-[0.98] transition-all disabled:opacity-25 disabled:cursor-not-allowed rounded"
                    >
                      ✅ Подтверждаю явку
                    </button>
                    <button
                      onClick={() => submitRsvp("no")}
                      disabled={!rsvpName.trim()}
                      className="flex-1 px-5 py-3 bg-red-600/10 border-2 border-red-800 text-red-400 font-heading text-sm tracking-[0.15em] uppercase hover:bg-red-600/20 active:scale-[0.98] transition-all disabled:opacity-25 disabled:cursor-not-allowed rounded"
                    >
                      ❌ Не смогу
                    </button>
                  </div>
                </div>
              </div>
            ) : rsvpDone === "yes" ? (
              <div className="bg-gray-900/40 border border-green-500/30 rounded-lg p-5 sm:p-6 text-center animate-fadeInScale">
                <div className="text-5xl mb-4">🕵️</div>
                <div className="text-green-400 font-heading text-xl sm:text-2xl mb-2 tracking-wider">
                  АГЕНТ {rsvpName.toUpperCase()}
                </div>
                <div className="text-green-500 font-heading text-lg tracking-wider mb-3">ЗАРЕГИСТРИРОВАН</div>
                <div className="w-16 h-0.5 bg-green-500/30 mx-auto mb-4" />
                <p className="text-gray-400 font-mono text-xs sm:text-sm">
                  Ждём вас на операции 9 марта в 18:00.
                </p>
                <p className="text-gray-500 font-mono text-xs mt-1">Не опаздывайте. Время — ключевая улика.</p>
              </div>
            ) : (
              <div className="bg-gray-900/40 border border-red-500/20 rounded-lg p-5 sm:p-6 text-center animate-fadeInScale">
                <div className="text-5xl mb-4">😔</div>
                <div className="text-red-400 font-heading text-xl sm:text-2xl mb-2 tracking-wider">
                  АГЕНТ {rsvpName.toUpperCase()}
                </div>
                <p className="text-gray-400 font-mono text-xs sm:text-sm">
                  Жаль, что не сможете присоединиться к операции.
                </p>
                <p className="text-gray-500 font-mono text-xs mt-1">Надеемся на совместные дела в будущем!</p>
                <button
                  onClick={() => setRsvpDone("none")}
                  className="mt-4 text-amber-400 font-mono text-xs underline underline-offset-4 hover:text-amber-300 transition-colors"
                >
                  Передумали? Нажмите здесь
                </button>
              </div>
            )}
          </section>

          {/* ---- HIDDEN UV SECTION ---- */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-2">
            <div className="uv-hidden text-center text-xs sm:text-sm font-typewriter italic">
              🔮 Суперсекретное послание: «Лучший подарок — это ваше присутствие, улыбка и хорошее настроение! А если
              ещё и что-то приятное захватите — агент «ИНКОГНИТО» будет на седьмом небе от счастья!»
            </div>
          </section>

          {/* ---- CASE NOTES SECTION ---- */}
          <section
            className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-slideUp"
            style={{ animationDelay: "0.75s" }}
          >
            <div className="bg-gray-900/30 border border-gray-800/40 rounded-lg p-5 sm:p-6">
              <h3 className="font-heading text-base sm:text-lg text-gray-400 tracking-wider uppercase mb-3">
                📋 Заметки следователя
              </h3>
              <ul className="space-y-2 text-gray-500 font-mono text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">▸</span>
                  <span>Операция начинается ровно в <span className="text-white">18:00</span> — пунктуальность ценится</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">▸</span>
                  <span>Дресс-код: выглядите как <span className="text-white">настоящий детектив</span> — стильно и загадочно</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">▸</span>
                  <span>Захватите <span className="text-white">хорошее настроение</span> — это обязательная часть экипировки</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">▸</span>
                  <span>На месте вас ждут <span className="text-white">расследования, загадки и веселье</span></span>
                </li>
              </ul>
            </div>
          </section>

          {/* ---- FOOTER ---- */}
          <footer className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
            <div className="border-t border-gray-800/40 pt-6">
              {/* All secrets found */}
              {secretsCount === 3 && (
                <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 animate-fadeInScale">
                  <p className="text-amber-400 font-heading text-base sm:text-lg tracking-wider">
                    🏆 ВСЕ УЛИКИ НАЙДЕНЫ!
                  </p>
                  <p className="text-amber-500/60 font-mono text-xs mt-1">
                    Вы — детектив высшего класса. Агент «ИНКОГНИТО» гордится вами!
                  </p>
                </div>
              )}
              <p className="text-gray-700 font-mono text-[10px] tracking-wider">
                ДОКУМЕНТ СОЗДАН ОПЕРАТИВНЫМ ШТАБОМ • 2025
              </p>
              <p className="text-gray-800 font-mono text-[10px] mt-1">
                Все совпадения случайны. Или нет. 🕵️
              </p>

              {/* Easter egg hint */}
              <p className="text-gray-800 font-mono text-[9px] mt-4 opacity-40 hover:opacity-100 transition-opacity duration-700">
                Подсказка: на сайте спрятано 3 секретных улики. Используйте 🔦 и нажимайте на подозрительные элементы...
              </p>
            </div>
          </footer>

          {/* ---- CRIME TAPE BOTTOM ---- */}
          <div className="crime-tape w-[110%] -ml-[5%]" />
        </div>
      )}
    </div>
  );
}
