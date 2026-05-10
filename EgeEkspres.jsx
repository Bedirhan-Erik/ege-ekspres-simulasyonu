import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import "./EgeEkspres.css";

// ─── CONFIG ───
const TEAM_NAME_KEY = "ege_ekspres_team";

// Caesar cipher helpers
const caesarEncrypt = (text, shift) =>
  text
    .split("")
    .map((ch) => {
      const turkishLower = "abcçdefgğhıijklmnoöprsştuüvyz";
      const turkishUpper = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
      let idx = turkishLower.indexOf(ch);
      if (idx !== -1) return turkishLower[(idx + shift) % turkishLower.length];
      idx = turkishUpper.indexOf(ch);
      if (idx !== -1) return turkishUpper[(idx + shift) % turkishUpper.length];
      return ch;
    })
    .join("");

const caesarDecrypt = (text, shift) =>
  text
    .split("")
    .map((ch) => {
      const turkishLower = "abcçdefgğhıijklmnoöprsştuüvyz";
      const turkishUpper = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
      let idx = turkishLower.indexOf(ch);
      if (idx !== -1)
        return turkishLower[
          (idx - shift + turkishLower.length) % turkishLower.length
        ];
      idx = turkishUpper.indexOf(ch);
      if (idx !== -1)
        return turkishUpper[
          (idx - shift + turkishUpper.length) % turkishUpper.length
        ];
      return ch;
    })
    .join("");

// ─── TASK DATA ───
const TASKS = [
   {
    id: 1,
    title: "Kaza Haberi",
    subtitle: "Motor veya Araba Kazası",
    icon: "🚨",
    startTime: "13:30",
    endTime: "14:30",
    startHour: 13,
    endHour: 14,
    location: "Ege Meslek Yüksekokulu",
    locationEncrypted: null,
    locationPuzzle: {
      type: "riddle",
      hint: "Bornova’nın kalbinde, ana kampüsün gölgesinde; sanatın değil, teknik emeğin yükseldiği, Türkiye'nin en köklü ön lisans çınarının bahçesinde haber seni bekliyor.",
    },
    tasks: [
      "Olay yerinin fotoğraflarını çek",
      "Olay yeri röportajlarını yap",
      "Polis açıklamasını al",
      "Mağdur ve tanık ifadelerini kaydet",
      "Kaza haberi metnini yaz",
    ],
    driveLink: "https://drive.google.com/drive/folders/1cUS264_cBMdU8TJqPhUpvxw5pR-nG5Ed?usp=drive_link",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Ege+Meslek+Yüksekokulu+Bornova+İzmir",
    color: "#6366F1",
    qrCode: "22223162",
  },
    {
    id: 2,
    title: "Sokak Röportajı",
    subtitle: "Halkın Nabzını Tut",
    icon: "🎤",
    startTime: "14:30",
    endTime: "15:30",
    startHour: 14,
    endHour: 15,
    location: "Ege Çarşı / Migros",
    locationEncrypted: null,
    locationPuzzle: {
      type: "scramble",
      hint: "Harfleri doğru sıraya koy: EGE ŞIRAÇ / OGRISM ",
    },
    tasks: [
      "Sokak röportajı konusunu belirle",
      "Röportaj süresi 1 dakiyeyi geçmesin",
      "En az 4 kişiyle röportaj yap",
      "Röportaj görüntülerini düzenle",
      "Sokak röportajı haberini hazırla",
    ],
    driveLink: "https://drive.google.com/drive/folders/1tlVOlBzN8W_JyiX7xy1bhSgPZZWPdAWp?usp=drive_link",
    mapLink: "https://www.google.com/maps/place/Migros/@38.4574643,27.2306784,19z/data=!4m10!1m2!2m1!1zRWdlIMOcbml2ZXJzaXRlc2kgw4dhcsWfxLEgTWlncm9zIEJvcm5vdmEgxLB6bWly!3m6!1s0x14b97dd17bc766e9:0xa7f532bb7700b0d8!8m2!3d38.4574766!4d27.2312839!15sCjBFZ2Ugw5xuaXZlcnNpdGVzaSDDh2FyxZ_EsSBNaWdyb3MgQm9ybm92YSDEsHptaXIiA4gBAVoxIi9lZ2Ugw7xuaXZlcnNpdGVzaSDDp2FyxZ_EsSBtaWdyb3MgYm9ybm92YSBpem1pcpIBC3N1cGVybWFya2V0mgEjQ2haRFNVaE5NRzluUzBWSk5ubHpXbTFtTWpRM2RVTlJFQUXgAQD6AQQIABAy!16s%2Fg%2F11s69s_5gw?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D",
    color: "#06B6D4",
    qrCode: "33331621",
  },
  {
    id: 3,
    title: "TDGT Zirvesi Çekimi",
    subtitle: "Türk Dünyası Gençlik ve Kültür Zirvesi",
    icon: "📰",
    startTime: "16:00",
    endTime: "17:00",
    startHour: 16,
    endHour: 17,
    location: "Mötbe",
    locationEncrypted: null, // will be set with puzzle
    locationPuzzle: {
      type: "caesar",
      shift: 1,
      hint: "Her harfi alfabede 1 adım geri al",
    },
    tasks: [
      "İSO hassasiyeti uygulayarak etkinlik fotoğraflarını çek",
      "En az 3 farklı kişi ile etkinlik öncesi ve sonrasında röportaj yap",
      "Etkinlik akışı ile ilgili reels videosu hazırla",
      "Zirve haberini yaz",
    ],
    driveLink: "https://drive.google.com/drive/folders/1WfN5M9tAEnT8PU7YaS_wSy-RY_dwHB4C?usp=drive_link",
    mapLink: "https://maps.app.goo.gl/7XD8wmrYdSpFpcKC9?g_st=ic",
    color: "#3B82F6",
    qrCode: "11114380",
  },
 
];

// Initialize encrypted locations
TASKS[0].locationEncrypted = "Kampüsün saklı incisi";
TASKS[1].locationEncrypted = "EGE ŞIRAÇ / OGRISM ";
TASKS[2].locationEncrypted = caesarEncrypt(TASKS[2].location, 1);


// ─── COMPONENTS ───

const EgeLogo = ({ style, className, id = "ege" }) => (
  <svg
    viewBox="0 0 150 160"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
    className={className}
    fill="none"
  >
    <defs>
      <linearGradient id={`${id}T`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1A3A8A" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id={`${id}M`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id={`${id}B`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#7EF0FF" />
      </linearGradient>
    </defs>
    {/* Top bar — with bottom-left tab (E top stroke + spine) */}
    <polygon points="28,17 132,5 132,27 28,39 28,53 10,55 10,41" fill={`url(#${id}T)`} />
    {/* Middle bar — full parallelogram */}
    <polygon points="10,75 132,61 132,83 10,97" fill={`url(#${id}M)`} />
    {/* Bottom bar — with top-left tab (E bottom stroke + spine) */}
    <polygon points="10,113 28,125 132,113 132,135 28,147 10,149 10,127" fill={`url(#${id}B)`} />
  </svg>
);

const Particles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));
  return (
    <div className="particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

const Timer = ({ startedAt, onExpire }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  if (!startedAt) return null;

  const elapsed = Math.floor((now - startedAt) / 1000);
  const remaining = Math.max(0, 3600 - elapsed);
  const progress = Math.min((elapsed / 3600) * 100, 100);
  const isUrgent = remaining > 0 && remaining <= 300;

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pad = (n) => String(n).padStart(2, "0");

  useEffect(() => {
    if (remaining === 0) onExpire?.();
  }, [remaining]);

  return (
    <div className={`timer-widget ${isUrgent ? "timer-urgent" : ""}`}>
      <div className="timer-label">{remaining === 0 ? "Süre Doldu" : "Kalan Süre"}</div>
      <div className="timer-digits">
        <span className="digit-group">
          <span className="digit">{pad(h)}</span>
          <span className="digit-label">sa</span>
        </span>
        <span className="timer-sep">:</span>
        <span className="digit-group">
          <span className="digit">{pad(m)}</span>
          <span className="digit-label">dk</span>
        </span>
        <span className="timer-sep">:</span>
        <span className="digit-group">
          <span className="digit">{pad(s)}</span>
          <span className="digit-label">sn</span>
        </span>
      </div>
      <div className="timer-progress-bar">
        <div className="timer-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

const PuzzleModal = ({ task, onSolve, onClose }) => {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const checkAnswer = () => {
    const clean = (s) =>
      s
        .toLowerCase()
        .replace(/[^a-zçğıöşü0-9]/gi, "")
        .trim();
    if (clean(answer) === clean(task.location)) {
      setSolved(true);
      setTimeout(() => onSolve(), 1500);
    } else {
      setError("Yanlış cevap! Tekrar dene.");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content puzzle-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {solved ? (
          <div className="puzzle-solved">
            <div className="solved-icon">🎉</div>
            <h3>Lokasyon Bulundu!</h3>
            <p className="location-reveal">{task.location}</p>
          </div>
        ) : (
          <>
            <div className="puzzle-header">
              <span className="puzzle-type-badge">
                {task.locationPuzzle.type === "caesar"
                  ? "🔐 Sezar Şifresi"
                  : task.locationPuzzle.type === "riddle"
                  ? "🧩 Bulmaca"
                  : task.locationPuzzle.type === "scramble"
                  ? "🔀 Harf Karışıklığı"
                  : "🔤 Sesli Harfler Gizli"}
              </span>
              <h3>Lokasyonu Çöz</h3>
            </div>
            <div className="puzzle-cipher">
              <code>{task.locationEncrypted}</code>
            </div>
            <div className={`puzzle-hint ${showHint ? "hint-visible" : ""}`}>
              {showHint ? (
                <p>💡 {task.locationPuzzle.hint}</p>
              ) : (
                <button className="hint-btn" onClick={() => setShowHint(true)}>
                  İpucu Göster
                </button>
              )}
            </div>
            <div className="puzzle-input-group">
              <input
                type="text"
                placeholder="Çözümü yaz..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                className="puzzle-input"
              />
              <button className="puzzle-submit" onClick={checkAnswer}>
                Kontrol Et
              </button>
            </div>
            {error && <p className="puzzle-error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

const QRModal = ({ task, onVerify, onClose }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5Qrcode("qr-scanner-view");
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          setCode(decoded);
          scanner.stop().then(() => setScanning(false)).catch(() => setScanning(false));
        },
        () => {}
      )
      .catch(() => setScanning(false));
    return () => {
      if (scanner.isScanning) scanner.stop().catch(() => {});
    };
  }, [scanning]);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => {});
    };
  }, []);

  const stopScan = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().then(() => setScanning(false)).catch(() => setScanning(false));
    } else {
      setScanning(false);
    }
  };

  const check = () => {
    if (code.trim() === task.qrCode) {
      setVerified(true);
      setTimeout(() => onVerify(), 1500);
    } else {
      setError("Geçersiz QR kod! Lokasyondaki QR'ı okutun.");
      setTimeout(() => setError(""), 2500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {verified ? (
          <div className="puzzle-solved">
            <div className="solved-icon">✅</div>
            <h3>QR Doğrulandı!</h3>
            <p>Görev paneline erişim sağlandı</p>
          </div>
        ) : (
          <>
            <div className="qr-header">
              <div className="qr-icon-large">📷</div>
              <h3>QR Kod Doğrulama</h3>
              <p>Kameranızı QR koda tutun veya kodu manuel girin</p>
            </div>

            {scanning ? (
              <div className="scanner-wrapper">
                <div id="qr-scanner-view" className="scanner-view" />
                <button className="scan-cancel-btn" onClick={stopScan}>✕ İptal</button>
              </div>
            ) : (
              <button className="scan-start-btn" onClick={() => setScanning(true)}>
                📷 Kamera ile Tara
              </button>
            )}

            <div className="scan-divider"><span>veya manuel gir</span></div>

            <div className="puzzle-input-group">
              <input
                type="text"
                placeholder="QR kodunu girin..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && check()}
                className="puzzle-input"
              />
              <button className="puzzle-submit" onClick={check}>
                Doğrula
              </button>
            </div>
            {error && <p className="puzzle-error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

const TaskCard = ({
  task,
  index,
  isUnlocked,
  isCurrent,
  isCompleted,
  isTimedOut,
  startedAt,
  locationSolved,
  qrVerified,
  completedItems,
  onSolveLocation,
  onVerifyQR,
  onToggleItem,
  onComplete,
  onStartTimer,
  onTimeOut,
}) => {
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const canAccess = isUnlocked && (!isTimedOut || isCompleted);
  const allItemsDone = task.tasks.every((_, i) => completedItems.includes(i));

  const handleCardClick = () => {
    if (!canAccess) return;
    if (!expanded && !startedAt) onStartTimer(task.id);
    setExpanded(!expanded);
  };

  return (
    <>
      <div
        className={`task-card ${isCurrent ? "task-current" : ""} ${
          isCompleted ? "task-completed" : ""
        } ${!canAccess ? "task-locked" : ""}`}
        style={{ "--task-color": task.color }}
        onClick={handleCardClick}
      >
        <div className="task-card-header">
          <div className="task-number">
            {isCompleted ? "✓" : task.id}
          </div>
          <div className="task-info">
            <h3>{task.title}</h3>
            <p className="task-subtitle">{task.subtitle}</p>
          </div>
          <div className="task-time-badge">⏱ 1 saat</div>
        </div>

        {!canAccess && (
          <div className="task-locked-overlay">
            <span className="lock-icon">🔒</span>
            <span>
              {!isUnlocked ? "Önceki görevi tamamla" : "Süre doldu, görev kilitlendi"}
            </span>
          </div>
        )}

        {canAccess && expanded && (
          <div className="task-card-body">
            {isCompleted ? (
              <div className="completed-drive-section">
                <p className="completed-msg">✅ Görev tamamlandı</p>
                <a
                  href={task.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drive-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  📁 Google Drive'a Yükle
                </a>
              </div>
            ) : (
            <>
            <Timer
              startedAt={startedAt}
              onExpire={() => onTimeOut(task.id)}
            />

            {/* Step 1: Solve Location */}
            <div className={`task-step ${locationSolved ? "step-done" : "step-active"}`}>
              <div className="step-header">
                <span className="step-num">{locationSolved ? "✓" : "1"}</span>
                <span>Lokasyonu Çöz</span>
              </div>
              {!locationSolved ? (
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPuzzle(true);
                  }}
                >
                  Bulmacayı Aç
                </button>
              ) : (
                <div className="location-solved-block">
                  <p className="step-result">📍 {task.location}</p>
                  <a
                    href={task.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    🗺️ Haritada Aç
                  </a>
                </div>
              )}
            </div>

            {/* Step 2: QR Verification */}
            <div
              className={`task-step ${
                qrVerified ? "step-done" : locationSolved ? "step-active" : "step-locked"
              }`}
            >
              <div className="step-header">
                <span className="step-num">{qrVerified ? "✓" : "2"}</span>
                <span>QR Kod Doğrulama</span>
              </div>
              {locationSolved && !qrVerified && (
                <button
                  className="action-btn"
                  onClick={(e) => { e.stopPropagation(); setShowQR(true); }}
                >
                  QR Kodu Gir
                </button>
              )}
              {qrVerified && <p className="step-result">✅ Doğrulandı</p>}
            </div>

            {/* Step 3: Tasks */}
            <div
              className={`task-step ${
                qrVerified ? (allItemsDone ? "step-done" : "step-active") : "step-locked"
              }`}
            >
              <div className="step-header">
                <span className="step-num">{allItemsDone && qrVerified ? "✓" : "3"}</span>
                <span>Görevler</span>
                <span className="task-counter">
                  {completedItems.length}/{task.tasks.length}
                </span>
              </div>
              {qrVerified && (
                <div className="todo-list">
                  {task.tasks.map((item, i) => (
                    <label
                      key={i}
                      className={`todo-item ${
                        completedItems.includes(i) ? "todo-done" : ""
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={completedItems.includes(i)}
                        onChange={() => onToggleItem(task.id, i)}
                      />
                      <span className="todo-check">
                        {completedItems.includes(i) ? "✓" : ""}
                      </span>
                      <span className="todo-text">{item}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Step 4: Upload & Complete */}
            <div
              className={`task-step ${
                qrVerified ? "step-active" : "step-locked"
              }`}
            >
              <div className="step-header">
                <span className="step-num">4</span>
                <span>Teslim Et</span>
              </div>
              {qrVerified && (
                <div className="upload-section">
                  <a
                    href={task.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="drive-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📁 Google Drive'a Yükle
                  </a>
                  <button
                    className="complete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete(task.id);
                    }}
                  >
                    Görevi Tamamla ✓
                  </button>
                </div>
              )}
            </div>

            </>
            )}
          </div>
        )}
      </div>

      {showPuzzle && (
        <PuzzleModal
          task={task}
          onSolve={() => {
            setShowPuzzle(false);
            onSolveLocation(task.id);
          }}
          onClose={() => setShowPuzzle(false)}
        />
      )}
      {showQR && (
        <QRModal
          task={task}
          onVerify={() => {
            setShowQR(false);
            onVerifyQR(task.id);
          }}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
};

// ─── PERSISTENCE ───
function loadSavedState() {
  try {
    return JSON.parse(localStorage.getItem("ege_state") || "{}") || {};
  } catch {
    return {};
  }
}


// ─── MAIN APP ───
export default function App() {
  const [saved] = useState(loadSavedState);
  const [teamName, setTeamName] = useState(saved.teamName || "");
  const [entered, setEntered] = useState(saved.entered || false);
  const [solvedLocations, setSolvedLocations] = useState(saved.solvedLocations || []);
  const [verifiedQRs, setVerifiedQRs] = useState(saved.verifiedQRs || []);
  const [completedTasks, setCompletedTasks] = useState(saved.completedTasks || []);
  const [completedItems, setCompletedItems] = useState(saved.completedItems || {});
  const [taskStartTimes, setTaskStartTimes] = useState(saved.taskStartTimes || {});
  const [timedOutTasks, setTimedOutTasks] = useState(saved.timedOutTasks || []);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pendingVerify, setPendingVerify] = useState(null);

  const firstActiveIndex = TASKS.findIndex(
    (t) => !completedTasks.includes(t.id) && !timedOutTasks.includes(t.id)
  );
  const currentTaskIndex = firstActiveIndex === -1 ? TASKS.length : firstActiveIndex;

  useEffect(() => {
    localStorage.setItem(
      "ege_state",
      JSON.stringify({ teamName, entered, solvedLocations, verifiedQRs, completedTasks, completedItems, taskStartTimes, timedOutTasks })
    );
  }, [teamName, entered, solvedLocations, verifiedQRs, completedTasks, completedItems, taskStartTimes, timedOutTasks]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("verify");
    if (token) {
      const task = TASKS.find((t) => t.qrCode === token);
      if (task) {
        if (entered) {
          setSolvedLocations((prev) => prev.includes(task.id) ? prev : [...prev, task.id]);
          setVerifiedQRs((prev) => prev.includes(task.id) ? prev : [...prev, task.id]);

        } else {
          setPendingVerify(task.id);
        }
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleEnter = () => {
    if (!teamName.trim()) return;
    if (pendingVerify !== null) {
      setSolvedLocations((prev) => prev.includes(pendingVerify) ? prev : [...prev, pendingVerify]);
      setVerifiedQRs((prev) => prev.includes(pendingVerify) ? prev : [...prev, pendingVerify]);
      setPendingVerify(null);
    }
    setEntered(true);
  };

  const handleSolveLocation = (taskId) => {
    setSolvedLocations((prev) => [...prev, taskId]);
  };

  const handleVerifyQR = (taskId) => {
    setVerifiedQRs((prev) => [...prev, taskId]);
  };

  const handleToggleItem = (taskId, itemIndex) => {
    setCompletedItems((prev) => {
      const key = taskId;
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.includes(itemIndex)
          ? current.filter((i) => i !== itemIndex)
          : [...current, itemIndex],
      };
    });
  };

  const handleComplete = (taskId) => {
    setCompletedTasks((prev) => [...prev, taskId]);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleStartTimer = (taskId) => {
    setTaskStartTimes((prev) => ({ ...prev, [taskId]: Date.now() }));
  };

  const handleTimeOut = (taskId) => {
    setTimedOutTasks((prev) => prev.includes(taskId) ? prev : [...prev, taskId]);
  };

  const handleReset = () => {
    setSolvedLocations([]);
    setVerifiedQRs([]);
    setCompletedTasks([]);
    setCompletedItems({});
    setTaskStartTimes({});
    setTimedOutTasks([]);
  };

  const allDone = completedTasks.length === TASKS.length;

  return (
    <>
      {!entered ? (
        <div className="entry-screen">
          <Particles />
          <div className="entry-content">
            <div className="logo-section">
              <EgeLogo className="logo-icon" id="entry" />
              <h1 className="logo-title">EGE EKSPRES</h1>
              <p className="logo-subtitle">Haber Simülasyonu</p>
              <div className="logo-line" />
            </div>
            <div className="entry-form">
              <label className="entry-label">Takım Adınız</label>
              <input
                type="text"
                className="entry-input"
                placeholder="Takım adınızı girin..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEnter()}
              />
              <button
                className="entry-btn"
                disabled={!teamName.trim()}
                onClick={handleEnter}
              >
                Başla →
              </button>
            </div>
            <div className="entry-footer">
              <p>2026 • Ege Üniversitesi</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="app">
      <Particles />
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ["#3B82F6", "#6366F1", "#06B6D4", "#8B5CF6", "#60A5FA"][
                  Math.floor(Math.random() * 5)
                ],
              }}
            />
          ))}
        </div>
      )}

      <header className="app-header">
        <div className="header-left">
          <EgeLogo className="header-logo" id="header" />
          <div>
            <h1>EGE EKSPRES</h1>
            <p className="header-team">{teamName}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={() => setEntered(false)}>← Geri</button>
          <button className="reset-header-btn" onClick={() => { if (window.confirm("Oyunu sıfırlamak istediğinden emin misin?")) handleReset(); }}>↺ Sıfırla</button>
          <div className="progress-ring">
            <span>{completedTasks.length}/{TASKS.length}</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Progress bar */}
        <div className="global-progress">
          <div className="progress-track">
            {TASKS.map((t, i) => (
              <div
                key={t.id}
                className={`progress-node ${
                  completedTasks.includes(t.id)
                    ? "node-done"
                    : i === currentTaskIndex
                    ? "node-current"
                    : "node-pending"
                }`}
                style={{ "--node-color": t.color }}
              >
                <div className="node-circle">
                  {completedTasks.includes(t.id) ? "✓" : t.id}
                </div>
                <span className="node-label">{t.title}</span>
              </div>
            ))}
            <div
              className="progress-line-fill"
              style={{
                width: `${(completedTasks.length / (TASKS.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {allDone ? (
          <div className="all-done-screen">
            <div className="done-icon">🏆</div>
            <h2>Tebrikler!</h2>
            <p>Tüm görevleri başarıyla tamamladınız!</p>
            <p className="done-team">{teamName}</p>
            <div className="meetup-box">
              <span className="meetup-label">📍 Toplanma Alanı</span>
              <span className="meetup-place">Number One Kafe</span>
            </div>
            <button className="reset-btn" onClick={handleReset}>
              🔄 Baştan Başla
            </button>
          </div>
        ) : (
          <div className="tasks-list">
            {TASKS.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                isUnlocked={index <= currentTaskIndex}
                isCurrent={index === currentTaskIndex}
                isCompleted={completedTasks.includes(task.id)}
                isTimedOut={timedOutTasks.includes(task.id)}
                startedAt={taskStartTimes[task.id] || null}
                locationSolved={solvedLocations.includes(task.id)}
                qrVerified={verifiedQRs.includes(task.id)}
                completedItems={completedItems[task.id] || []}
                onSolveLocation={handleSolveLocation}
                onVerifyQR={handleVerifyQR}
                onToggleItem={handleToggleItem}
                onComplete={handleComplete}
                onStartTimer={handleStartTimer}
                onTimeOut={handleTimeOut}
              />
            ))}
          </div>
        )}
      </main>

        </div>
      )}

    </>
  );
}