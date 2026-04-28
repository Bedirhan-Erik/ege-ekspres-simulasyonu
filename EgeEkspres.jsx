import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";

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
    title: "Haber Simülasyonu",
    subtitle: "Ege'de Amansız Hastalığa Çözüm",
    icon: "📰",
    startTime: "11:00",
    endTime: "12:00",
    startHour: 11,
    endHour: 12,
    location: "Hipokrat Kafe",
    locationEncrypted: null, // will be set with puzzle
    locationPuzzle: {
      type: "caesar",
      shift: 1,
      hint: "Her harfi alfabede 1 adım geri al",
    },
    tasks: [
      "Haber metnini hazırla",
      "Haber fotoğraf ve videoları yüklenecek",
      "Mizanpaj tasarımını oluştur",
      "Haberi küpür formuna dönüştür",
      "Haber dijital arşivine yükle",
    ],
    driveLink: "https://drive.google.com/drive/u/0/folders/1oEzKLeVI1wua6Mbkg6temMXOmmOWpQOc?usp=sharing",
    mapLink: "https://www.google.com/maps/place/Hipokrat+Coffee+Plus/@38.4572938,27.2097014,21z/data=!4m14!1m7!3m6!1s0x14b97d84a24426d5:0x9c06f703883d2992!2sHipokrat+Cafe!8m2!3d38.4562371!4d27.228094!16s%2Fg%2F11kqb_xj_9!3m5!1s0x14b97d001accb5a9:0x6feddcb2c4e7443e!8m2!3d38.4573297!4d27.2096761!16s%2Fg%2F11xkrn4nr0?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D",
    color: "#3B82F6",
    qrCode: "11114380",
  },
  {
    id: 2,
    title: "Kaza Haberi",
    subtitle: "Motor veya Araba Kazası",
    icon: "🚨",
    startTime: "12:00",
    endTime: "13:00",
    startHour: 12,
    endHour: 13,
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
    driveLink: "https://drive.google.com/drive/u/0/folders/1nHTTas0_7r-0J6bfpDNtfx_6NmHJ_4dt?usp=sharing",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Ege+Meslek+Yüksekokulu+Bornova+İzmir",
    color: "#6366F1",
    qrCode: "22223162",
  },
  {
    id: 3,
    title: "Sokak Röportajı",
    subtitle: "Halkın Nabzını Tut",
    icon: "🎤",
    startTime: "13:00",
    endTime: "14:00",
    startHour: 13,
    endHour: 14,
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
    driveLink: "https://drive.google.com/drive/folders/16bpRd9bHt2Ys1vvLIoUS1T2yU2M9eoOJ?usp=sharing",
    mapLink: "https://www.google.com/maps/place/Migros/@38.4574643,27.2306784,19z/data=!4m10!1m2!2m1!1zRWdlIMOcbml2ZXJzaXRlc2kgw4dhcsWfxLEgTWlncm9zIEJvcm5vdmEgxLB6bWly!3m6!1s0x14b97dd17bc766e9:0xa7f532bb7700b0d8!8m2!3d38.4574766!4d27.2312839!15sCjBFZ2Ugw5xuaXZlcnNpdGVzaSDDh2FyxZ_EsSBNaWdyb3MgQm9ybm92YSDEsHptaXIiA4gBAVoxIi9lZ2Ugw7xuaXZlcnNpdGVzaSDDp2FyxZ_EsSBtaWdyb3MgYm9ybm92YSBpem1pcpIBC3N1cGVybWFya2V0mgEjQ2haRFNVaE5NRzluUzBWSk5ubHpXbTFtTWpRM2RVTlJFQUXgAQD6AQQIABAy!16s%2Fg%2F11s69s_5gw?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D",
    color: "#06B6D4",
    qrCode: "33331621",
  },
  {
    id: 4,
    title: "Fen Saha Röportajı",
    subtitle: "Şampiyonluk Kutlaması",
    icon: "⚽",
    startTime: "15:00",
    endTime: "16:00",
    startHour: 15,
    endHour: 16,
    location: "Fen Fakültesi Futbol Sahası",
    locationEncrypted: null,
    locationPuzzle: {
      type: "vowels",
      hint: "Boşlukları doğru tamamla",
    },
    tasks: [
      "Maç öncesi röportajları yap",
      "Maç sonu röportajları yap",
      "Taraftar röportajları kaydet",
      "Maç içi görüntüleri çek",
      "Maç sonu fotoğraflarını çek",
      "Haber metni yaz",
      "Instagram tasarımını oluştur",
    ],
    driveLink: "https://drive.google.com/drive/folders/1f7r_OL6ImsjI6exRi3pfo5BmReWGHx3n?usp=sharing",
    mapLink: "https://www.google.com/maps/place/Fulbol+Sahas%C4%B1/@38.4599287,27.2280284,18z/data=!4m10!1m2!2m1!1sEge+%C3%9Cniversitesi+Fen+Fak%C3%BCltesi+Futbol+Sahas%C4%B1+Bornova+%C4%B0zmir!3m6!1s0x14b97cdb1340a2c9:0x1d48fcbb7206dff0!8m2!3d38.4599288!4d27.2304102!15sCj5FZ2Ugw5xuaXZlcnNpdGVzaSBGZW4gRmFrw7xsdGVzaSBGdXRib2wgU2FoYXPEsSBCb3Jub3ZhIMSwem1pciIDiAEBWj8iPWVnZSDDvG5pdmVyc2l0ZXNpIGZlbiBmYWvDvGx0ZXNpIGZ1dGJvbCBzYWhhc8SxIGJvcm5vdmEgaXptaXKSAQ5mb290YmFsbF9maWVsZJoBRENpOURRVWxSUVVOdlpFTm9kSGxqUmpsdlQyNUNOVlp1Ums1aWJVNDJaVzEwUjFreFNYZE9iRlpvVlZSU2ExWllZeEFC4AEA-gEECAAQHQ!16s%2Fg%2F11dz566tmr?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D",
    color: "#8B5CF6",
    qrCode: "44442035",
  },
];

// Initialize encrypted locations
TASKS[0].locationEncrypted = caesarEncrypt(TASKS[0].location, 1);
TASKS[1].locationEncrypted = "Kampüsün saklı incisi";
TASKS[2].locationEncrypted = "EGE ŞIRAÇ / OGRISM ";
TASKS[3].locationEncrypted = "F_n F_k_lt_s_ F_tb_l S_h_s_";

// ─── COMPONENTS ───

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

  const canAccess = isUnlocked && !isTimedOut;
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
                allItemsDone && qrVerified ? "step-active" : "step-locked"
              }`}
            >
              <div className="step-header">
                <span className="step-num">4</span>
                <span>Teslim Et</span>
              </div>
              {allItemsDone && qrVerified && (
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

  const currentTaskIndex = completedTasks.length;

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
              <div className="logo-icon">📰</div>
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
          <span className="header-logo">📰</span>
          <div>
            <h1>EGE EKSPRES</h1>
            <p className="header-team">{teamName}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={() => setEntered(false)}>← Geri</button>
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        /* ─────────────────────────────────────────
           RESET & BASE
        ───────────────────────────────────────── */

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --red: #3B82F6;
          --red-dim: rgba(59,130,246,0.15);
          --red-glow: rgba(59,130,246,0.35);
          --teal: #1D4ED8;
          --blue: #60A5FA;
          --gold: #E9C46A;
          --bg: #05091A;
          --surface: #0A1428;
          --surface2: #0E1E3880;
          --border: rgba(59,130,246,0.1);
          --border-bright: rgba(59,130,246,0.22);
          --text: #E8EEFF;
          --muted: #5A7A9E;
          --mono: 'JetBrains Mono', monospace;
          --sans: 'Plus Jakarta Sans', sans-serif;
        }

        html { font-size: 16px; -webkit-text-size-adjust: 100%; }

        body {
          font-family: var(--sans);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          min-height: 100dvh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Particles ── */
        .particles-container {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
        }
        .particle {
          position: absolute;
          background: radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%);
          border-radius: 50%;
          animation: float linear infinite;
        }
        @keyframes float {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: translateY(-120px) translateX(20px) scale(1.4); }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-200px) translateX(-10px) scale(0.5); opacity: 0; }
        }

        /* ══════════════════════════════════════
           ENTRY SCREEN
        ══════════════════════════════════════ */
        .entry-screen {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          position: relative;
          padding: 1.5rem;
        }

        .entry-content {
          position: relative;
          z-index: 1;
          text-align: center;
          width: 100%;
          max-width: 400px;
        }

        .logo-section { margin-bottom: 2.5rem; }

        .logo-icon {
          font-size: 3.5rem;
          display: block;
          margin-bottom: 1.25rem;
          filter: drop-shadow(0 0 24px rgba(59,130,246,0.5));
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(59,130,246,0.4)); }
          50%       { transform: scale(1.08); filter: drop-shadow(0 0 40px rgba(59,130,246,0.7)); }
        }

        .logo-title {
          font-family: var(--mono);
          font-size: clamp(1.6rem, 8vw, 2.4rem);
          font-weight: 700;
          letter-spacing: 0.25em;
          color: var(--red);
          line-height: 1;
        }

        .logo-subtitle {
          font-size: 0.7rem;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 0.6rem;
        }

        .logo-line {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--red), transparent);
          margin: 1.25rem auto 0;
          border-radius: 2px;
        }

        .entry-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .entry-label {
          text-align: left;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .entry-input {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid var(--border-bright);
          border-radius: 14px;
          padding: 1rem 1.2rem;
          color: var(--text);
          font-family: var(--sans);
          font-size: 1.05rem;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          width: 100%;
        }
        .entry-input::placeholder { color: var(--muted); }
        .entry-input:focus {
          border-color: var(--red);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 0 24px rgba(59,130,246,0.12);
        }

        .entry-btn {
          background: var(--red);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 1rem;
          font-family: var(--sans);
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          margin-top: 0.25rem;
          min-height: 52px;
        }
        .entry-btn:active { transform: scale(0.97); }
        .entry-btn:not(:disabled):hover {
          background: #2563EB;
          box-shadow: 0 8px 32px rgba(59,130,246,0.45);
          transform: translateY(-2px);
        }
        .entry-btn:disabled { opacity: 0.25; cursor: not-allowed; }

        .entry-footer {
          margin-top: 2.5rem;
          color: #1a2a4a;
          font-family: var(--mono);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
        }

        /* ══════════════════════════════════════
           APP SHELL
        ══════════════════════════════════════ */
        .app {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          background: rgba(5,9,26,0.88);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid var(--border);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
        }
        .header-logo { font-size: 1.3rem; flex-shrink: 0; }
        .header-left h1 {
          font-family: var(--mono);
          font-size: 0.85rem;
          letter-spacing: 0.18em;
          color: var(--red);
          white-space: nowrap;
        }
        .header-team {
          font-size: 0.68rem;
          color: var(--muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 140px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .progress-ring {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid rgba(59,130,246,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--red);
          background: rgba(59,130,246,0.06);
        }

        .back-btn {
          background: rgba(255,255,255,0.05);
          color: var(--muted);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.45rem 0.8rem;
          font-family: var(--sans);
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 36px;
        }
        .back-btn:active { transform: scale(0.96); }
        .back-btn:hover { background: rgba(255,255,255,0.09); color: #ccc; }

        /* ══════════════════════════════════════
           MAIN CONTENT
        ══════════════════════════════════════ */
        .main-content {
          position: relative;
          z-index: 1;
          flex: 1;
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
          padding: 1.25rem 0.9rem 6rem;
        }

        /* ── Progress Track ── */
        .global-progress {
          margin-bottom: 1.75rem;
          padding: 1rem 0.75rem;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          border-radius: 16px;
        }

        .progress-track {
          display: flex;
          justify-content: space-between;
          position: relative;
        }
        .progress-track::before {
          content: '';
          position: absolute;
          top: 17px;
          left: 18px;
          right: 18px;
          height: 2px;
          background: rgba(255,255,255,0.07);
          border-radius: 1px;
        }
        .progress-line-fill {
          position: absolute;
          top: 17px;
          left: 18px;
          height: 2px;
          background: linear-gradient(90deg, var(--red), #60A5FA);
          transition: width 0.7s cubic-bezier(.4,0,.2,1);
          max-width: calc(100% - 36px);
          border-radius: 1px;
          box-shadow: 0 0 8px rgba(59,130,246,0.5);
        }
        .progress-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          position: relative;
          z-index: 1;
        }
        .node-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--surface);
          border: 2px solid rgba(255,255,255,0.08);
          transition: all 0.4s cubic-bezier(.4,0,.2,1);
        }
        .node-done .node-circle {
          background: var(--node-color);
          border-color: var(--node-color);
          color: #fff;
          box-shadow: 0 0 16px color-mix(in srgb, var(--node-color) 50%, transparent);
        }
        .node-current .node-circle {
          border-color: var(--node-color);
          color: var(--node-color);
          background: color-mix(in srgb, var(--node-color) 10%, transparent);
          animation: currentPulse 2s ease-in-out infinite;
        }
        @keyframes currentPulse {
          0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--node-color) 40%, transparent); }
          50%      { box-shadow: 0 0 0 7px color-mix(in srgb, var(--node-color) 0%, transparent); }
        }
        .node-label {
          font-size: 0.52rem;
          letter-spacing: 0.04em;
          color: #444;
          white-space: nowrap;
          text-align: center;
          max-width: 56px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .node-done .node-label { color: #777; }
        .node-current .node-label { color: #bbb; }

        /* ══════════════════════════════════════
           TASK CARDS
        ══════════════════════════════════════ */
        .tasks-list { display: flex; flex-direction: column; gap: 0.85rem; }

        .task-card {
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.15s;
          position: relative;
          backdrop-filter: blur(8px);
        }
        .task-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%);
          pointer-events: none;
        }
        .task-card:active:not(.task-locked) { transform: scale(0.985); }
        .task-card:hover:not(.task-locked) {
          border-color: var(--border-bright);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        .task-current {
          border-color: color-mix(in srgb, var(--task-color) 50%, transparent);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--task-color) 20%, transparent),
                      0 8px 32px color-mix(in srgb, var(--task-color) 12%, transparent);
        }
        .task-completed { opacity: 0.55; }
        .task-locked { cursor: not-allowed; }

        .task-card-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 1rem 1.1rem;
        }

        .task-number {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: color-mix(in srgb, var(--task-color) 14%, transparent);
          color: var(--task-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
          border: 1px solid color-mix(in srgb, var(--task-color) 25%, transparent);
        }

        .task-info { flex: 1; min-width: 0; }
        .task-info h3 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.15rem;
          line-height: 1.25;
        }
        .task-subtitle {
          font-size: 0.72rem;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-time-badge {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-family: var(--mono);
          font-size: 0.65rem;
          color: #777;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          padding: 0.35rem 0.55rem;
          border-radius: 8px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .time-dash { color: #333; }

        .task-locked-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          background: rgba(0,0,0,0.25);
          font-size: 0.75rem;
          color: #444;
          border-top: 1px solid rgba(255,255,255,0.03);
        }
        .lock-icon { font-size: 0.9rem; }

        .task-card-body {
          padding: 0 1.1rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: slideDown 0.28s cubic-bezier(.4,0,.2,1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Timer ── */
        .timer-widget {
          background: rgba(59,130,246,0.06);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 14px;
          padding: 0.9rem 1rem;
          text-align: center;
          transition: background 0.5s, border-color 0.5s;
        }
        .timer-urgent {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.3);
          animation: urgentPulse 1s ease-in-out infinite;
        }
        .timer-urgent .digit { color: #EF4444; }
        .timer-urgent .timer-sep { color: rgba(239,68,68,0.4); }
        .timer-urgent .timer-progress-fill { background: linear-gradient(90deg, #EF4444, #F87171); }
        @keyframes urgentPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.2); }
          50%      { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        .timer-label {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.5rem;
        }
        .timer-digits {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
        }
        .digit-group { text-align: center; }
        .digit {
          font-family: var(--mono);
          font-size: 1.7rem;
          font-weight: 700;
          color: var(--red);
          line-height: 1;
        }
        .digit-label {
          display: block;
          font-size: 0.5rem;
          color: var(--muted);
          letter-spacing: 0.12em;
          margin-top: 0.1rem;
        }
        .timer-sep {
          font-family: var(--mono);
          font-size: 1.3rem;
          color: rgba(59,130,246,0.35);
          margin-bottom: 0.7rem;
        }
        .timer-progress-bar {
          margin-top: 0.65rem;
          height: 3px;
          background: rgba(255,255,255,0.05);
          border-radius: 2px;
          overflow: hidden;
        }
        .timer-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--red), #60A5FA);
          border-radius: 2px;
          transition: width 1s linear;
        }

        /* ── Task Steps ── */
        .task-step {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
          padding: 0.9rem;
          transition: all 0.25s;
        }
        .step-active {
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
        }
        .step-done {
          border-color: rgba(29,78,216,0.35);
          background: rgba(29,78,216,0.08);
        }
        .step-locked { opacity: 0.3; pointer-events: none; }

        .step-header {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.82rem;
          font-weight: 700;
        }
        .step-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 0.65rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .step-done .step-num {
          background: var(--teal);
          border-color: var(--teal);
          color: #fff;
        }
        .task-counter {
          margin-left: auto;
          font-family: var(--mono);
          font-size: 0.65rem;
          color: var(--muted);
          background: rgba(255,255,255,0.05);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }
        .step-result {
          margin-top: 0.5rem;
          font-size: 0.82rem;
          color: var(--teal);
          padding-left: 2.1rem;
          font-weight: 600;
        }
        .location-solved-block {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .location-solved-block .step-result { margin-top: 0; }
        .map-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(59,130,246,0.1);
          color: var(--red);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 8px;
          padding: 0.3rem 0.7rem;
          font-family: var(--sans);
          font-size: 0.75rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .map-btn:hover {
          background: rgba(59,130,246,0.2);
          transform: translateY(-1px);
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.7rem;
          margin-left: 2.1rem;
          background: var(--red-dim);
          color: var(--red);
          border: 1px solid rgba(59,130,246,0.3);
          border-radius: 10px;
          padding: 0.6rem 1.1rem;
          font-family: var(--sans);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 40px;
        }
        .action-btn:active { transform: scale(0.96); }
        .action-btn:hover {
          background: rgba(59,130,246,0.22);
          box-shadow: 0 4px 16px rgba(59,130,246,0.2);
        }

        /* ── Todo List ── */
        .todo-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-top: 0.65rem;
          padding-left: 2.1rem;
        }
        .todo-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.82rem;
          min-height: 44px;
        }
        .todo-item:hover { background: rgba(255,255,255,0.04); }
        .todo-item input { display: none; }
        .todo-check {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          border: 2px solid rgba(255,255,255,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .todo-done .todo-check {
          background: var(--teal);
          border-color: var(--teal);
          color: #fff;
        }
        .todo-done .todo-text {
          text-decoration: line-through;
          color: #444;
        }

        /* ── Upload Section ── */
        .upload-section {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-top: 0.7rem;
          padding-left: 2.1rem;
        }
        .drive-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(66,133,244,0.1);
          color: #5b9cf6;
          border: 1px solid rgba(66,133,244,0.22);
          border-radius: 10px;
          padding: 0.7rem 1rem;
          text-decoration: none;
          font-family: var(--sans);
          font-size: 0.82rem;
          font-weight: 700;
          transition: all 0.2s;
          min-height: 44px;
        }
        .drive-btn:hover { background: rgba(66,133,244,0.18); transform: translateY(-1px); }

        .complete-btn {
          background: linear-gradient(135deg, #1D4ED8, #1E40AF);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.8rem 1.2rem;
          font-family: var(--sans);
          font-size: 0.88rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 48px;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 16px rgba(29,78,216,0.35);
        }
        .complete-btn:active { transform: scale(0.97); }
        .complete-btn:hover { box-shadow: 0 6px 24px rgba(29,78,216,0.5); transform: translateY(-2px); }

        /* ══════════════════════════════════════
           MODALS
        ══════════════════════════════════════ */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1000;
          padding: 0;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .modal-content {
          background: #08112A;
          border: 1px solid var(--border-bright);
          border-radius: 24px 24px 0 0;
          padding: 1.75rem 1.5rem 2.5rem;
          width: 100%;
          max-width: 480px;
          position: relative;
          animation: sheetUp 0.32s cubic-bezier(.4,0,.2,1);
        }
        .modal-content::before {
          content: '';
          display: block;
          width: 36px;
          height: 4px;
          background: rgba(255,255,255,0.12);
          border-radius: 2px;
          margin: 0 auto 1.5rem;
        }
        @keyframes sheetUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }

        .modal-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: rgba(255,255,255,0.07);
          border: none;
          color: var(--muted);
          width: 34px;
          height: 34px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

        /* Puzzle Modal */
        .puzzle-header { text-align: center; margin-bottom: 1.25rem; }
        .puzzle-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: var(--red-dim);
          color: var(--red);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 20px;
          padding: 0.3rem 0.8rem;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          margin-bottom: 0.6rem;
        }
        .puzzle-header h3 { font-size: 1.15rem; font-weight: 800; }

        .puzzle-cipher {
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 1.25rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        .puzzle-cipher code {
          font-family: var(--mono);
          font-size: 1rem;
          color: var(--gold);
          letter-spacing: 0.12em;
          word-break: break-all;
          white-space: pre-wrap;
          line-height: 1.6;
        }

        .puzzle-hint { text-align: center; margin-bottom: 1rem; }
        .hint-btn {
          background: rgba(233,196,106,0.08);
          color: var(--gold);
          border: 1px solid rgba(233,196,106,0.2);
          border-radius: 10px;
          padding: 0.55rem 1.1rem;
          font-family: var(--sans);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 40px;
        }
        .hint-btn:hover { background: rgba(233,196,106,0.15); }
        .hint-visible p {
          color: var(--gold);
          font-size: 0.82rem;
          line-height: 1.6;
          background: rgba(233,196,106,0.06);
          border: 1px solid rgba(233,196,106,0.14);
          border-radius: 12px;
          padding: 0.85rem;
        }

        .puzzle-input-group { display: flex; gap: 0.5rem; }
        .puzzle-input {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid var(--border-bright);
          border-radius: 12px;
          padding: 0.8rem 1rem;
          color: var(--text);
          font-family: var(--sans);
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          min-height: 48px;
        }
        .puzzle-input::placeholder { color: var(--muted); }
        .puzzle-input:focus {
          border-color: var(--red);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .puzzle-submit {
          background: var(--red);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0.8rem 1.2rem;
          font-family: var(--sans);
          font-size: 0.85rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          min-height: 48px;
        }
        .puzzle-submit:active { transform: scale(0.96); }
        .puzzle-submit:hover { background: #2563EB; }

        .puzzle-error {
          color: var(--red);
          font-size: 0.78rem;
          text-align: center;
          margin-top: 0.75rem;
          animation: shake 0.4s ease;
          font-weight: 600;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }

        .puzzle-solved {
          text-align: center;
          padding: 0.75rem 0;
          animation: fadeIn 0.35s ease;
        }
        .solved-icon {
          font-size: 3.2rem;
          display: block;
          margin-bottom: 0.75rem;
          animation: bounceIn 0.55s cubic-bezier(.4,0,.2,1);
        }
        @keyframes bounceIn {
          0%   { transform: scale(0) rotate(-10deg); }
          60%  { transform: scale(1.2) rotate(4deg); }
          100% { transform: scale(1) rotate(0); }
        }
        .puzzle-solved h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.4rem; }
        .location-reveal {
          font-family: var(--mono);
          font-size: 0.95rem;
          color: var(--teal);
          margin-top: 0.4rem;
          font-weight: 700;
        }

        /* QR Modal */
        .qr-header { text-align: center; margin-bottom: 1.25rem; }
        .qr-icon-large { font-size: 2.8rem; display: block; margin-bottom: 0.5rem; }
        .qr-header h3 { font-size: 1.1rem; font-weight: 800; }
        .qr-header p { color: var(--muted); font-size: 0.8rem; margin-top: 0.4rem; line-height: 1.5; }

        .scan-start-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--red-dim);
          color: var(--red);
          border: 1.5px solid rgba(59,130,246,0.3);
          border-radius: 14px;
          padding: 0.9rem;
          font-family: var(--sans);
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 52px;
          margin-bottom: 0.75rem;
        }
        .scan-start-btn:hover { background: rgba(59,130,246,0.22); }
        .scan-start-btn:active { transform: scale(0.97); }

        .scanner-wrapper {
          position: relative;
          margin-bottom: 0.75rem;
          border-radius: 14px;
          overflow: hidden;
          background: #000;
        }
        .scanner-view { width: 100%; min-height: 260px; }
        .scanner-view video { width: 100% !important; border-radius: 14px; }
        #qr-scanner-view > * { border-radius: 14px !important; }

        .scan-cancel-btn {
          position: absolute;
          top: 0.6rem;
          right: 0.6rem;
          background: rgba(0,0,0,0.6);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.35rem 0.7rem;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          z-index: 10;
        }

        .scan-divider {
          text-align: center;
          position: relative;
          margin: 0.75rem 0;
          color: var(--muted);
          font-size: 0.72rem;
        }
        .scan-divider::before, .scan-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 38%;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .scan-divider::before { left: 0; }
        .scan-divider::after { right: 0; }

        /* ══════════════════════════════════════
           ALL DONE
        ══════════════════════════════════════ */
        .all-done-screen {
          text-align: center;
          padding: 3rem 1.5rem;
          animation: fadeIn 0.6s ease;
        }
        .done-icon {
          font-size: 5rem;
          display: block;
          margin-bottom: 1.25rem;
          animation: bounceIn 0.8s cubic-bezier(.4,0,.2,1);
          filter: drop-shadow(0 0 32px rgba(233,196,106,0.5));
        }
        .all-done-screen h2 {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--gold);
        }
        .all-done-screen p { color: var(--muted); font-size: 0.9rem; }
        .done-team {
          font-family: var(--mono);
          color: var(--blue);
          font-size: 1rem;
          margin-top: 0.75rem;
          letter-spacing: 0.1em;
        }
        .meetup-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          margin-top: 1.75rem;
          padding: 1rem 2rem;
          background: rgba(59,130,246,0.08);
          border: 1.5px solid rgba(59,130,246,0.25);
          border-radius: 16px;
        }
        .meetup-label {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .meetup-place {
          font-family: var(--mono);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--red);
          letter-spacing: 0.08em;
        }
        .reset-btn {
          margin-top: 2rem;
          background: rgba(59,130,246,0.1);
          color: var(--red);
          border: 1.5px solid rgba(59,130,246,0.3);
          border-radius: 14px;
          padding: 0.85rem 2rem;
          font-family: var(--sans);
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 52px;
          letter-spacing: 0.04em;
        }
        .reset-btn:hover {
          background: rgba(59,130,246,0.2);
          box-shadow: 0 6px 24px rgba(59,130,246,0.25);
          transform: translateY(-2px);
        }
        .reset-btn:active { transform: scale(0.97); }

        /* ══════════════════════════════════════
           CONFETTI
        ══════════════════════════════════════ */
        .confetti-container {
          position: fixed; inset: 0; pointer-events: none; z-index: 999;
        }
        .confetti-piece {
          position: absolute;
          top: -12px;
          width: 9px;
          height: 9px;
          border-radius: 2px;
          animation: confettiFall 3.2s ease forwards;
        }
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(800deg) scale(0.5); opacity: 0; }
        }

        /* ══════════════════════════════════════
           RESPONSIVE — TABLET UP
        ══════════════════════════════════════ */
        @media (min-width: 480px) {
          .modal-overlay { align-items: center; padding: 1.5rem; }
          .modal-content {
            border-radius: 24px;
            padding: 2rem;
            animation: modalIn 0.28s cubic-bezier(.4,0,.2,1);
          }
          .modal-content::before { display: none; }
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.94) translateY(12px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          .app-header { padding: 1rem 1.5rem; }
          .main-content { padding: 1.5rem 1.25rem 5rem; }
          .task-card-header { padding: 1.15rem 1.25rem; }
          .digit { font-size: 1.9rem; }
        }

        @media (min-width: 640px) {
          .entry-content { max-width: 440px; }
          .logo-title { font-size: 2.6rem; }
        }
      `}</style>
    </>
  );
}