/* global React, ReactDOM, lucide */
const { useState, useEffect, useRef, useMemo } = React;

// ---------- Icons (from lucide global) ----------
const I = lucide ? lucide.icons : {};
const Icon = ({ name, size = 16, className = "", strokeWidth = 1.75 }) => {
  const node = I[name];
  if (!node) return null;
  // lucide icons global export shape: { name: [tag, attrs, children] }
  // Build SVG manually so we don't need a wrapper lib.
  const [, attrs, children] = node.iconNode ? ["svg", { ...node }, node.iconNode] : node;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {(children || []).map(([tag, a], i) =>
        React.createElement(tag, { key: i, ...a })
      )}
    </svg>
  );
};

// ---------- Mock data ----------
const COMPETITORS = ["Mobiliar", "Helvetia", "Zurich", "Baloise", "Allianz"];

const KUNDENTYP = ["Single", "Paar", "Familie", "Pensioniert"];
const WOHNSITUATION = ["Miete", "Eigentum", "Zweitwohnsitz"];
const PRIORITAET = ["Preissensibel", "Mehr Leistung", "Alles bei uns", "Cyber wichtig"];

const ADVANTAGES = {
  Familie: [
    "Kinder bis 25 J. in der Familienpolice mitversichert — auch im Studium auswärts.",
    "Rundumschutz Elektronik deckt Schäden an Laptops & Tablets der ganzen Familie.",
    "Haftpflicht inkl. Schäden durch Mietsachen und Lehrlinge — höhere Deckungssumme.",
    "Cyber-Baustein schützt vor Online-Betrug bei Käufen der Kinder.",
    "Notfallservice 24/7 mit Handwerkervermittlung in unter 60 Minuten.",
  ],
  Single: [
    "Schlanker Grundtarif ohne Leistungen, die du nicht brauchst — fairer Einstiegspreis.",
    "Cyber-Schutz inkl. Identitätsdiebstahl und Online-Shopping-Betrug bis CHF 20'000.",
    "Mobiles Hab und Gut weltweit gedeckt — auch Velo, Laptop und Smartphone.",
    "Notfallservice 24/7 — Schlüsseldienst, Handwerker, Sofortübernachtung.",
  ],
  Paar: [
    "Eine Police für beide Partner — keine doppelten Verträge, keine Lücken.",
    "Rundumschutz Elektronik für alle gemeinsamen Geräte ohne Einzelnachweis.",
    "Haftpflicht inkl. Schäden des Partners gegenüber dem anderen (intern).",
    "Cyber-Baustein schützt gemeinsame Online-Konten und Streaming-Dienste.",
  ],
  Pensioniert: [
    "Reduzierte Prämie ab 65 J. bei gleichbleibender Leistung — Senior-Tarif.",
    "Erweiterter Schutz bei Reisen (länger als 90 Tage) — wichtig für Langzeit-Aufenthalte.",
    "Notfallservice priorisiert — durchschnittliche Reaktionszeit unter 30 Minuten.",
    "Persönlicher Berater statt Hotline — feste Ansprechperson für alle Anliegen.",
  ],
};

const TABLE_ROWS_BASE = [
  {
    baustein: "Hausrat Grunddeckung",
    own: "CHF 150'000 inkl. Diebstahl auswärts",
    comp: "CHF 120'000, Diebstahl auswärts +CHF 80",
    rating: "vorteil",
    detail: "Höhere Versicherungssumme im Standard, Diebstahl auswärts ohne Aufpreis enthalten.",
  },
  {
    baustein: "Rundumschutz Elektronik",
    own: "Inklusive bis CHF 10'000",
    comp: "Optional, +CHF 120/Jahr",
    rating: "vorteil",
    detail: "Bei uns als fester Bestandteil — beim Mitbewerber nur als kostenpflichtige Option.",
  },
  {
    baustein: "Cyber-Schutz",
    own: "Bis CHF 20'000, Identitätsdiebstahl inkl.",
    comp: "Bis CHF 15'000, ohne Identitätsdiebstahl",
    rating: "vorteil",
    detail: "Höhere Deckung und zusätzlicher Schutz bei Identitätsdiebstahl.",
  },
  {
    baustein: "Privathaftpflicht",
    own: "CHF 10 Mio.",
    comp: "CHF 10 Mio.",
    rating: "gleich",
    detail: "Beide Anbieter bieten 10 Mio. Standard-Deckung — gleichwertig.",
  },
  {
    baustein: "Notfallservice 24/7",
    own: "Inklusive, Reaktion < 60 Min.",
    comp: "Inklusive, Reaktion < 120 Min.",
    rating: "vorteil",
    detail: "Schnellere Reaktionszeit dank dichterem Handwerker-Netzwerk.",
  },
];

const TABLE_ROWS_MORE = [
  {
    baustein: "Glasbruch Mobiliar",
    own: "Inklusive",
    comp: "Optional, +CHF 60",
    rating: "vorteil",
    detail: "Bei uns Standard, beim Mitbewerber kostenpflichtig.",
  },
  {
    baustein: "Schäden durch Haustiere",
    own: "Bis CHF 5'000",
    comp: "Bis CHF 8'000",
    rating: "nachteil",
    detail: "Mitbewerber bietet höhere Deckung für Tierschäden — Achtung bei Hundebesitzer:innen.",
  },
  {
    baustein: "Reise-Rückführung",
    own: "Bis CHF 50'000",
    comp: "Bis CHF 30'000",
    rating: "vorteil",
    detail: "Höhere medizinische Rückführungs-Pauschale.",
  },
];

const TALKING_POINTS = (kunde, comp) => [
  `Beim ${comp}-Vertrag fehlt der Rundumschutz Elektronik im Standard — bei uns inklusive, das spart deinem Kunden CHF 120/Jahr und schliesst eine reale Lücke (Laptop-Sturzschaden, Wasserschaden Tablet).`,
  `Cyber-Deckung ist der grösste Hebel: CHF 20'000 vs. CHF 15'000 und Identitätsdiebstahl exklusiv bei uns. Für ${kunde === "Familie" ? "eine Familie mit Online-aktiven Kindern" : "den heutigen Alltag"} ein klares Argument.`,
  `Der einzige Punkt, an dem ${comp} besser ist: Haustier-Deckung. Wenn der Kunde Hund/Katze hat, ehrlich ansprechen und mit Notfallservice + Reaktionszeit kontern.`,
];

const DEEP_DIVE_AREAS = [
  {
    key: "hausrat",
    label: "Hausrat Grunddeckung",
    icon: "Home",
    text: [
      "Die AXA-Hausratpolice versichert den gesamten Haushaltsinhalt bis CHF 150'000 — das sind CHF 30'000 mehr als beim Mitbewerber im Standardumfang. Diebstahl ausserhalb der Wohnung (z.B. Velo, Koffer auf Reisen) ist ohne Aufpreis mitversichert.",
      "Beim Mitbewerber ist Diebstahl auswärts nur mit einem Zusatzbaustein für CHF 80/Jahr abgedeckt. Bei einer durchschnittlichen Haushaltssumme von CHF 120'000–150'000 macht die höhere Versicherungssumme der AXA einen echten Unterschied — gerade bei Familien oder Umzug in grössere Verhältnisse.",
    ],
  },
  {
    key: "rundumschutz",
    label: "Rundumschutz Elektronik",
    icon: "Laptop",
    text: [
      "Der Rundumschutz Elektronik ist bei AXA im Standard enthalten und deckt alle elektronischen Geräte im Haushalt: Laptops, Smartphones, Tablets, TV, Spielkonsolen — ohne Geräteliste, ohne Einzelnachweis.",
      "Versichert sind Sturz- und Bruchschäden, Flüssigkeitsschäden, Bedienungsfehler sowie Diebstahl ausserhalb der Wohnung. Selbstbehalt CHF 200 pro Schaden, Maximum CHF 10'000 pro Jahr. Beim Mitbewerber kostet diese Leistung CHF 120/Jahr extra — und erfordert eine detaillierte Geräteliste bei Abschluss.",
    ],
  },
  {
    key: "cyber",
    label: "Cyber-Schutz",
    icon: "ShieldCheck",
    text: [
      "Der AXA Cyber-Baustein deckt drei klar abgegrenzte Risiken: Online-Betrug beim Einkaufen (bis CHF 20'000), Identitätsdiebstahl inkl. Anwaltskosten und Wiederherstellungsaufwand sowie Cybermobbing und Rufschädigung mit psychologischer Beratung.",
      "Der Mitbewerber limitiert auf CHF 15'000 und schliesst Identitätsdiebstahl aus dem Standard aus. Für Haushalte mit aktiver Online-Nutzung — ob Banking, Shopping oder Social Media — ist die höhere Deckung und der Identitätsschutz ein konkreter, alltagsrelevanter Vorteil.",
    ],
  },
  {
    key: "haftpflicht",
    label: "Privathaftpflicht",
    icon: "Scale",
    text: [
      "Beide Anbieter bieten eine Privathaftpflicht mit CHF 10 Mio. Deckungssumme. Die AXA-Police schliesst Schäden durch Mietsachen, Lehrlinge und — bei Familienpolicen — auch Schäden durch Kinder im Ausbildungsverhältnis mit ein.",
      "Ein Unterschied besteht bei der Haftpflicht für Schäden zwischen Partnern: Bei AXA sind gegenseitige Schäden unter Mitversicherten in der Police geregelt. Das ist relevant für Paare, die gemeinsam zur Miete wohnen.",
    ],
  },
  {
    key: "notfall",
    label: "Notfallservice 24/7",
    icon: "Zap",
    text: [
      "Der AXA Notfallservice ist rund um die Uhr erreichbar und vermittelt Handwerker, Schlüsseldienst und im Notfall auch eine Sofortübernachtung — mit einer durchschnittlichen Reaktionszeit unter 60 Minuten dank dem dichten AXA-Partnernetz.",
      "Der Mitbewerber garantiert eine Reaktionszeit unter 120 Minuten. In einem echten Notfall — Wassereinbruch, Einbruch, Heizungsausfall — ist der Zeitunterschied spürbar. Dieser Vorteil ist im Kundengespräch einfach und glaubwürdig zu kommunizieren.",
    ],
  },
];

const PROSE = (kunde, wohn, prio, comp) => {
  const wohnText = wohn === "Eigentum" ? "als Eigentümer:in" : wohn === "Zweitwohnsitz" ? "mit Zweitwohnsitz" : "im Mietverhältnis";
  const preisHinweis = prio?.includes("Preissensibel")
    ? "Obwohl der Preis ein wichtiges Kriterium ist, zeigt der direkte Vergleich: AXA liegt im Jahresbeitrag zwar leicht höher, schliesst dafür aber Leistungen ein, die beim Mitbewerber CHF 180–300 extra kosten würden."
    : "Der Leistungsumfang der AXA-Police ist auf die aktuelle Lebenssituation abgestimmt — ohne teure Zusatzbausteine.";

  const kundeMap = {
    Familie: `Als Familie ${wohnText} steht ein breiter, lückenloser Schutz im Vordergrund. Kinder, gemeinsame Elektronik, ein höherer Haushaltsinhalt und die Haftpflicht für alle Familienmitglieder — das alles unter einer Police, ohne versteckte Einschränkungen.`,
    Single: `Als Single ${wohnText} zählt ein schlankes, aber vollständiges Paket. Keine überflüssigen Bausteine, aber klarer Schutz für Elektronik, Cyber und mobiles Hab und Gut — inklusive dem, was im Alltag wirklich passiert.`,
    Paar: `Als Paar ${wohnText} profitierst du von einer gemeinsamen Police, die beide Partner vollständig abdeckt — ohne Doppelversicherungen und mit einer klar geregelten Haftpflicht auch im Verhältnis zueinander.`,
    Pensioniert: `${wohnText.charAt(0).toUpperCase() + wohnText.slice(1)} und in der Pensionsphase rücken Reiseschutz, ein persönlicher Ansprechpartner und ein schneller Notfallservice in den Fokus — Leistungen, bei denen AXA messbar besser abschneidet.`,
  };

  const intro = kundeMap[kunde] || kundeMap.Familie;

  return [
    intro,
    `Im Vergleich mit ${comp} zeigen sich mehrere konkrete Unterschiede zugunsten von AXA: Die Hausratsumme ist im Standard höher angesetzt, der Rundumschutz für Elektronik ist ohne Aufpreis enthalten, und die Cyber-Deckung geht mit Identitätsschutz einen wichtigen Schritt weiter als die Konkurrenz.`,
    preisHinweis,
  ];
};

// ---------- Subcomponents ----------
function MessageBubble({ from, children, time, animate = true }) {
  const isBot = from === "bot";
  return (
    <div
      className={`msg-row ${isBot ? "msg-bot" : "msg-user"}`}
      style={{ animation: animate ? "fadeUp .35s ease both" : "none" }}
    >
      {isBot && <div className="avatar"><Icon name="Bot" size={14} /></div>}
      <div className="msg-stack">
        <div className={`bubble ${isBot ? "bubble-bot" : "bubble-user"}`}>{children}</div>
        {time && <div className="msg-time">{time}</div>}
      </div>
      {!isBot && <div className="avatar avatar-user">JM</div>}
    </div>
  );
}

function Chip({ active, onClick, children, variant = "default" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip chip-${variant} ${active ? "chip-active" : ""}`}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick, icon, variant = "primary", disabled, full }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${full ? "btn-full" : ""}`}
    >
      {icon && <Icon name={icon} size={15} />}
      <span>{children}</span>
    </button>
  );
}

// ---------- Step components ----------
function WelcomeCard({ onStart, onAsk }) {
  return (
    <div className="card welcome">
      <div className="welcome-eyebrow">
        <span className="dot" /> Internes Tool · Aussendienst
      </div>
      <h2 className="welcome-title">Leistungsvergleich Haushalt</h2>
      <p className="welcome-sub">
        Vergleiche Konkurrenz-Policen mit unserem Hausrat-, Haftpflicht- und Cyber-Angebot.
        Lade eine PDF hoch oder beschreibe die Situation — du bekommst Vorteile, eine
        Vergleichstabelle und Talking Points fürs Kundengespräch.
      </p>
      <div className="welcome-actions">
        <PrimaryButton onClick={onStart} icon="Plus" variant="primary">
          Neuen Leistungsvergleich starten
        </PrimaryButton>
        <PrimaryButton onClick={onAsk} icon="MessageSquare" variant="ghost">
          Fragen zu einem bestehenden Vergleich
        </PrimaryButton>
      </div>
      <div className="welcome-meta">
        <div><span className="k">3</span><span className="v">Bausteine: Hausrat · Haftpflicht · Cyber</span></div>
        <div><span className="k">5</span><span className="v">Mitbewerber abgedeckt</span></div>
        <div><span className="k">~2 Min.</span><span className="v">Pro Vergleich</span></div>
      </div>
    </div>
  );
}

function SituationCard({ onSubmit }) {
  const [text, setText] = useState("");
  const [chips, setChips] = useState({ kundentyp: null, wohn: null, prio: [] });

  const togglePrio = (p) => {
    setChips((c) => ({
      ...c,
      prio: c.prio.includes(p) ? c.prio.filter((x) => x !== p) : [...c.prio, p],
    }));
  };

  const ready = chips.kundentyp || text.trim().length > 5;

  return (
    <div className="card">
      <div className="card-h">Lebenssituation erfassen</div>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="z.B. Junge Familie mit zwei Kindern, lebt zur Miete in Zürich, beide arbeiten remote..."
        className="textarea"
      />
      <div className="chip-group">
        <div className="chip-label">Kundentyp</div>
        <div className="chip-row">
          {KUNDENTYP.map((k) => (
            <Chip key={k} active={chips.kundentyp === k} onClick={() => setChips((c) => ({ ...c, kundentyp: k }))}>
              {k}
            </Chip>
          ))}
        </div>
      </div>
      <div className="chip-group">
        <div className="chip-label">Wohnsituation</div>
        <div className="chip-row">
          {WOHNSITUATION.map((k) => (
            <Chip key={k} active={chips.wohn === k} onClick={() => setChips((c) => ({ ...c, wohn: k }))}>
              {k}
            </Chip>
          ))}
        </div>
      </div>
      <div className="chip-group">
        <div className="chip-label">Priorität <span className="muted">(Mehrfach)</span></div>
        <div className="chip-row">
          {PRIORITAET.map((k) => (
            <Chip key={k} active={chips.prio.includes(k)} onClick={() => togglePrio(k)}>
              {k}
            </Chip>
          ))}
        </div>
      </div>
      <div className="card-actions">
        <PrimaryButton
          disabled={!ready}
          icon="ArrowRight"
          onClick={() => onSubmit({ text, ...chips })}
        >
          Weiter
        </PrimaryButton>
      </div>
    </div>
  );
}

function UploadCard({ onUploaded, title = "Konkurrenz-Police hochladen", mockFile = { name: "Mobiliar_Hausrat_Police_2026.pdf", size: "342 KB" }, mockDetected = "Mobiliar" }) {
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(null);

  const trigger = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(mockFile);
      onUploaded({ detected: mockDetected });
    }, 1400);
  };

  return (
    <div className="card">
      <div className="card-h">{title}</div>
      {!uploaded && (
        <div
          className={`drop ${drag ? "drop-active" : ""} ${uploading ? "drop-busy" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); trigger(); }}
          onClick={trigger}
        >
          {!uploading ? (
            <>
              <Icon name="UploadCloud" size={28} />
              <div className="drop-title">PDF hier hineinziehen oder klicken</div>
              <div className="drop-sub">Max. 10 MB · Hausrat / Haftpflicht / Kombinations-Policen</div>
            </>
          ) : (
            <>
              <div className="spinner" />
              <div className="drop-title">PDF wird gelesen…</div>
              <div className="drop-sub">Texterkennung läuft</div>
            </>
          )}
        </div>
      )}
      {uploaded && (
        <div className="file-pill">
          <Icon name="FileText" size={18} />
          <div className="file-meta">
            <div className="file-name">{uploaded.name}</div>
            <div className="file-sub">{uploaded.size} · erkannt</div>
          </div>
          <Icon name="Check" size={18} className="file-check" />
        </div>
      )}
    </div>
  );
}

function DetectedCard({ detected, onConfirm, onChange }) {
  const [picking, setPicking] = useState(false);
  const [pick, setPick] = useState(detected);
  return (
    <div className="card">
      <div className="card-h">Mitbewerber erkannt</div>
      {!picking ? (
        <>
          <div className="detected">
            <div className="detected-logo">{detected[0]}</div>
            <div>
              <div className="detected-name">Ich habe erkannt: <b>{detected}</b></div>
              <div className="detected-sub">Stimmt das?</div>
            </div>
          </div>
          <div className="card-actions row">
            <PrimaryButton icon="Check" onClick={() => onConfirm(detected)}>Ja, korrekt</PrimaryButton>
            <PrimaryButton icon="X" variant="ghost" onClick={() => setPicking(true)}>Nein, ändern</PrimaryButton>
          </div>
        </>
      ) : (
        <>
          <div className="muted small mb">Wähle den Mitbewerber:</div>
          <div className="select-grid">
            {COMPETITORS.map((c) => (
              <button
                key={c}
                className={`select-pill ${pick === c ? "select-pill-active" : ""}`}
                onClick={() => setPick(c)}
              >
                <span className="select-logo">{c[0]}</span>
                <span>{c}</span>
              </button>
            ))}
          </div>
          <div className="card-actions">
            <PrimaryButton icon="Check" onClick={() => onChange(pick)}>Bestätigen</PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}

function AnalyseStartCard({ onStart, running }) {
  return (
    <div className="card">
      <div className="card-h">Bereit zur Analyse</div>
      <div className="analyse-row">
        <div className="analyse-meta">
          <div className="meta-pill"><Icon name="FileCheck" size={13} /> Police gelesen</div>
          <div className="meta-pill"><Icon name="User" size={13} /> Kundenkontext erfasst</div>
          <div className="meta-pill"><Icon name="ShieldCheck" size={13} /> 3 Bausteine bereit</div>
        </div>
      </div>
      {!running ? (
        <PrimaryButton full icon="Sparkles" onClick={onStart}>Analyse starten</PrimaryButton>
      ) : (
        <div className="progress">
          <div className="progress-row">
            <span className="spinner spinner-sm" />
            <span>Analyse läuft…</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" /></div>
          <div className="progress-steps">
            <span className="ps ps-done">Deckungen extrahiert</span>
            <span className="ps ps-active">Lücken & Vorteile berechnet</span>
            <span className="ps">Empfehlungen generiert</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AdvantagesCard({ kunde, onTable, onDeep }) {
  const list = ADVANTAGES[kunde] || ADVANTAGES.Familie;
  return (
    <div className="card card-result">
      <div className="result-h">
        <div className="result-h-eyebrow">Top Vorteile · für {kunde || "Familie"}</div>
        <div className="result-h-title">5 klare Argumente, die AXA vorne sehen</div>
      </div>
      <ul className="adv-list">
        {list.map((a, i) => (
          <li key={i} className="adv-item">
            <span className="adv-badge"><Icon name="Check" size={11} strokeWidth={3} /> Vorteil</span>
            <span className="adv-text">{a}</span>
          </li>
        ))}
      </ul>
      <div className="card-actions row">
        <PrimaryButton icon="Table" onClick={onTable}>Detaillierte Tabelle anzeigen</PrimaryButton>
        <PrimaryButton icon="ZoomIn" variant="ghost" onClick={onDeep}>Bestimmten Bereich vertiefen</PrimaryButton>
      </div>
    </div>
  );
}

function CompareTable({ comp, onDownload }) {
  const [more, setMore] = useState(false);
  const rows = more ? [...TABLE_ROWS_BASE, ...TABLE_ROWS_MORE] : TABLE_ROWS_BASE;
  return (
    <div className="card card-table">
      <div className="result-h">
        <div className="result-h-eyebrow">Vergleichstabelle · AXA vs. {comp}</div>
        <div className="result-h-title">Baustein-für-Baustein-Gegenüberstellung</div>
      </div>
      <div className="tbl">
        <div className="tbl-head">
          <div>Baustein</div>
          <div>AXA</div>
          <div>{comp}</div>
          <div>Bewertung</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="tbl-row">
            <div className="tbl-baustein">{r.baustein}</div>
            <div className="tbl-cell mono">{r.own}</div>
            <div className="tbl-cell mono">{r.comp}</div>
            <div>
              {r.rating === "vorteil" && <span className="rating rating-vorteil">Vorteil</span>}
              {r.rating === "gleich" && <span className="rating rating-gleich">Gleich</span>}
              {r.rating === "nachteil" && <span className="rating rating-nachteil">Nachteil</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="tbl-footer">
        <button className="more-toggle" onClick={() => setMore((v) => !v)}>
          <Icon name={more ? "Minus" : "Plus"} size={13} />
          {more ? "Weniger anzeigen" : "+ Mehr anzeigen"}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onDownload}>
          <Icon name="Download" size={13} /> Vergleich herunterladen
        </button>
      </div>
    </div>
  );
}

function PrepCard({ kunde, comp }) {
  const points = TALKING_POINTS(kunde || "Familie", comp);
  return (
    <div className="card card-prep">
      <div className="prep-h">
        <Icon name="Mic" size={14} /> Für dein Kundengespräch
      </div>
      <ol className="prep-list">
        {points.map((p, i) => (
          <li key={i} className="prep-item">
            <div className="prep-num">{String(i + 1).padStart(2, "0")}</div>
            <div className="prep-text">{p}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ProseCard({ situation, comp }) {
  const kunde = situation?.kundentyp || "Familie";
  const wohn = situation?.wohn || "Miete";
  const prio = situation?.prio || [];
  const paragraphs = PROSE(kunde, wohn, prio, comp || "Mitbewerber");
  return (
    <div className="card card-prose">
      <div className="result-h">
        <div className="result-h-eyebrow">Beurteilung · {kunde} · {wohn}</div>
        <div className="result-h-title">Warum diese AXA-Offerte passt</div>
      </div>
      <div className="prose-body">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}

function DeepDiveCard({ area }) {
  return (
    <div className="card card-deepdive">
      <div className="deepdive-h">
        <Icon name={area.icon} size={14} />
        <span>{area.label} — vertieft</span>
      </div>
      <div className="prose-body">
        {area.text.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}

function DeepDiveSelector({ openedKeys, onSelect }) {
  return (
    <div className="card card-deepselect">
      <div className="card-h">Welchen Bereich möchtest du vertiefen?</div>
      <div className="deepselect-grid">
        {DEEP_DIVE_AREAS.map((a) => (
          <button
            key={a.key}
            className={`deepselect-pill ${openedKeys.includes(a.key) ? "deepselect-done" : ""}`}
            onClick={() => !openedKeys.includes(a.key) && onSelect(a.key)}
          >
            <Icon name={openedKeys.includes(a.key) ? "Check" : a.icon} size={14} />
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function downloadVergleich({ situation, comp, advantages, prose }) {
  const kunde = situation?.kundentyp || "Familie";
  const wohn = situation?.wohn || "—";
  const date = new Date().toLocaleDateString("de-CH");

  const advHtml = advantages.map(a => `<li>${a}</li>`).join("\n");
  const proseHtml = prose.map(p => `<p>${p}</p>`).join("\n");
  const tableRows = [...TABLE_ROWS_BASE, ...TABLE_ROWS_MORE];
  const tableHtml = tableRows.map(r => `
    <tr>
      <td>${r.baustein}</td>
      <td>${r.own}</td>
      <td>${r.comp}</td>
      <td class="${r.rating}">${r.rating === "vorteil" ? "AXA Vorteil" : r.rating === "nachteil" ? "Nachteil" : "Gleich"}</td>
    </tr>`).join("\n");

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<title>Leistungsvergleich AXA vs. ${comp} — ${date}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 40px auto; color: #111; line-height: 1.6; padding: 0 20px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .meta { color: #666; font-size: 13px; margin-bottom: 32px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .05em; color: #888; margin: 32px 0 12px; }
  ul { padding-left: 20px; }
  li { margin-bottom: 6px; }
  p { margin: 0 0 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
  th { text-align: left; padding: 8px 10px; background: #f4f4f5; font-weight: 600; }
  td { padding: 8px 10px; border-bottom: 1px solid #e4e4e7; vertical-align: top; }
  .vorteil { color: #16a34a; font-weight: 600; }
  .nachteil { color: #dc2626; font-weight: 600; }
  .gleich { color: #666; }
  .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #e4e4e7; padding-top: 12px; }
</style></head><body>
<h1>Leistungsvergleich AXA vs. ${comp}</h1>
<div class="meta">Erstellt am ${date} · ${kunde} · ${wohn}</div>

<h2>Top-Vorteile AXA</h2>
<ul>${advHtml}</ul>

<h2>Warum diese AXA-Offerte passt</h2>
${proseHtml}

<h2>Detaillierter Vergleich</h2>
<table>
  <thead><tr><th>Baustein</th><th>AXA</th><th>${comp}</th><th>Bewertung</th></tr></thead>
  <tbody>${tableHtml}</tbody>
</table>

<div class="footer">KI-generiert — keine rechtsverbindliche Leistungszusage. Bitte fachlich prüfen.</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Leistungsvergleich_AXA_${comp}_${date.replace(/\./g, "-")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Main app ----------
function App() {
  const [step, setStep] = useState("welcome");
  const [situation, setSituation] = useState(null);
  const [competitor, setCompetitor] = useState(null);
  const [analyseDone, setAnalyseDone] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showProse, setShowProse] = useState(false);
  const [showPrep, setShowPrep] = useState(false);
  const [showDeepSelector, setShowDeepSelector] = useState(false);
  const [deepAreas, setDeepAreas] = useState([]);
  const [analyseRunning, setAnalyseRunning] = useState(false);
  const [qaMessages, setQaMessages] = useState([]);
  const [qaInput, setQaInput] = useState("");
  const [sideOpen, setSideOpen] = useState(false);
  const scrollRef = useRef(null);

  const now = () => {
    const d = new Date();
    return d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
  };

  // autoscroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight + 999;
  });

  const startNew = () => setStep("upload-intro");
  const onUploaded = ({ detected }) => {
    setCompetitor(detected);
    setStep("detected");
  };
  const confirmCompetitor = (c) => {
    setCompetitor(c);
    setStep("upload-axa");
  };
  const onAxaUploaded = () => {
    setStep("situation-intro");
  };
  const submitSituation = (s) => {
    setSituation(s);
    setStep("analyse");
  };
  const runAnalyse = () => {
    setAnalyseRunning(true);
    setTimeout(() => {
      setAnalyseRunning(false);
      setAnalyseDone(true);
      setStep("advantages");
    }, 3200);
  };

  const handleQaSubmit = (e) => {
    e.preventDefault();
    if (!qaInput.trim()) return;
    const q = qaInput.trim();
    setQaInput("");
    setQaMessages((prev) => [...prev, { q, a: "Gute Frage — auf Basis der vorliegenden Policen und der Lebenssituation: bitte fachlich im Detail prüfen, bevor dieser Punkt im Kundengespräch eingesetzt wird.", t: new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }) }]);
  };

  const handleDeepSelect = (key) => {
    setDeepAreas((prev) => prev.includes(key) ? prev : [...prev, key]);
  };

  const handleDownload = () => {
    const kunde = situation?.kundentyp || "Familie";
    const advantages = ADVANTAGES[kunde] || ADVANTAGES.Familie;
    const prose = PROSE(kunde, situation?.wohn || "Miete", situation?.prio || [], competitor || "Mitbewerber");
    downloadVergleich({ situation, comp: competitor || "Mitbewerber", advantages, prose });
  };

  const kundenLabel = situation?.kundentyp || "Familie";

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <button className="menu-btn" onClick={() => setSideOpen(true)} aria-label="Menu">
            <Icon name="Menu" size={18} />
          </button>
          <div className="logo">
            <span className="logo-mark" />
            <span className="logo-text">comparedesk</span>
          </div>
          <span className="topbar-divider" />
          <span className="topbar-title">Leistungsvergleich Haushalt</span>
          <span className="badge-internal">INTERN · AD</span>
        </div>
        <div className="topbar-right">
          <button className="icon-btn"><Icon name="HelpCircle" size={15} /> Hilfe</button>
          <div className="user-tag">JM · Jana Müller</div>
        </div>
      </header>

      <div className="layout">
        {sideOpen && <div className="side-scrim" onClick={() => setSideOpen(false)} />}
        <aside className={`sidebar ${sideOpen ? "sidebar-open" : ""}`}>
          <button className="side-close" onClick={() => setSideOpen(false)} aria-label="Schliessen">
            <Icon name="X" size={16} />
          </button>
          <div className="side-h">Aktueller Vergleich</div>
          <div className="side-card">
            <div className="side-row"><span className="side-k">Status</span><span className="side-v"><span className={`status-dot ${analyseDone ? "ok" : "wip"}`} /> {analyseDone ? "Bereit" : "In Arbeit"}</span></div>
            <div className="side-row"><span className="side-k">Kundentyp</span><span className="side-v">{situation?.kundentyp || "—"}</span></div>
            <div className="side-row"><span className="side-k">Wohnen</span><span className="side-v">{situation?.wohn || "—"}</span></div>
            <div className="side-row"><span className="side-k">Mitbewerber</span><span className="side-v">{competitor || "—"}</span></div>
            <div className="side-row"><span className="side-k">Bausteine</span><span className="side-v">Hausrat · Haftpflicht · Cyber</span></div>
          </div>

          <div className="side-h">Schritte</div>
          <ol className="side-steps">
            {[
              ["welcome", "Start"],
              ["upload-intro", "Fremdpolice"],
              ["detected", "Mitbewerber"],
              ["upload-axa", "AXA-Police"],
              ["situation-intro", "Situation"],
              ["analyse", "Analyse"],
              ["advantages", "Vorteile"],
              ["table", "Tabelle"],
            ].map(([k, label], i) => {
              const reached = stepIndex(step) >= stepIndex(k);
              const current = step === k || (k === "table" && showTable);
              return (
                <li key={k} className={`side-step ${reached ? "reached" : ""} ${current ? "current" : ""}`}>
                  <span className="side-step-num">{String(i + 1).padStart(2, "0")}</span>
                  <span>{label}</span>
                </li>
              );
            })}
          </ol>

          <div className="side-foot">
            <button className="side-prep-btn" disabled={!analyseDone} onClick={() => { setShowPrep(true); setSideOpen(false); }}>
              <Icon name="Mic" size={14} /> Gesprächsvorbereitung
            </button>
          </div>
        </aside>

        <main className="chat" ref={scrollRef}>
          <div className="chat-inner">

            {/* WELCOME */}
            {step === "welcome" && (
              <MessageBubble from="bot" time={now()}>
                <WelcomeCard onStart={startNew} onAsk={() => setStep("qa")} />
              </MessageBubble>
            )}

            {/* UPLOAD Konkurrenz */}
            {stepIndex(step) >= stepIndex("upload-intro") && (
              <>
                <MessageBubble from="bot" time={now()}>
                  Lade die Fremdpolice des Kunden als PDF hoch — ich erkenne den Anbieter automatisch.
                </MessageBubble>
                <MessageBubble from="bot" animate={false}>
                  <UploadCard onUploaded={onUploaded} />
                </MessageBubble>
              </>
            )}

            {/* DETECTED */}
            {stepIndex(step) >= stepIndex("detected") && competitor && (
              <MessageBubble from="bot" animate={true}>
                {step === "detected" ? (
                  <DetectedCard
                    detected={competitor}
                    onConfirm={confirmCompetitor}
                    onChange={confirmCompetitor}
                  />
                ) : (
                  <div className="card">
                    <div className="detected">
                      <div className="detected-logo">{competitor[0]}</div>
                      <div>
                        <div className="detected-name">Mitbewerber: <b>{competitor}</b></div>
                        <div className="detected-sub">Bestätigt</div>
                      </div>
                    </div>
                  </div>
                )}
              </MessageBubble>
            )}

            {/* UPLOAD AXA */}
            {stepIndex(step) >= stepIndex("upload-axa") && (
              <>
                <MessageBubble from="bot" time={now()}>
                  Jetzt lade bitte die aktuelle AXA-Police oder -Offerte hoch, damit ich beide direkt vergleichen kann.
                </MessageBubble>
                <MessageBubble from="bot" animate={false}>
                  <UploadCard
                    onUploaded={onAxaUploaded}
                    title="AXA-Police hochladen"
                    mockFile={{ name: "AXA_Hausrat_Police_2026.pdf", size: "218 KB" }}
                    mockDetected="AXA"
                  />
                </MessageBubble>
              </>
            )}

            {/* SITUATION */}
            {stepIndex(step) >= stepIndex("situation-intro") && (
              <>
                <MessageBubble from="bot" time={now()}>
                  Beide Dokumente sind bereit. Erzähl mir kurz die aktuelle Situation deines Kunden —
                  das hilft mir, die Unterschiede richtig zu gewichten.
                </MessageBubble>
                {situation ? (
                  <MessageBubble from="user" time={now()}>
                    <div className="user-summary">
                      {situation.text && <div className="us-text">{situation.text}</div>}
                      <div className="us-tags">
                        {situation.kundentyp && <span className="us-tag">{situation.kundentyp}</span>}
                        {situation.wohn && <span className="us-tag">{situation.wohn}</span>}
                        {situation.prio?.map((p) => <span key={p} className="us-tag">{p}</span>)}
                      </div>
                    </div>
                  </MessageBubble>
                ) : (
                  <MessageBubble from="bot" animate={false}>
                    <SituationCard onSubmit={submitSituation} />
                  </MessageBubble>
                )}
              </>
            )}

            {/* ANALYSE */}
            {stepIndex(step) >= stepIndex("analyse") && (
              <>
                <MessageBubble from="bot" time={now()}>
                  Alles bereit. Ich vergleiche jetzt {competitor} mit AXA auf Basis der Lebenssituation von{" "}
                  <b>{kundenLabel}</b>.
                </MessageBubble>
                <MessageBubble from="bot" animate={false}>
                  <AnalyseStartCard onStart={runAnalyse} running={analyseRunning} />
                </MessageBubble>
              </>
            )}

            {/* ADVANTAGES */}
            {stepIndex(step) >= stepIndex("advantages") && analyseDone && (
              <>
                <MessageBubble from="bot" time={now()}>
                  Hier sind die <b>Top-Vorteile</b> der AXA-Police gegenüber {competitor}, zugeschnitten auf {kundenLabel}.
                </MessageBubble>
                <MessageBubble from="bot" animate={false}>
                  <AdvantagesCard
                    kunde={kundenLabel}
                    onTable={() => { setShowTable(true); setShowProse(true); }}
                    onDeep={() => setShowDeepSelector(true)}
                  />
                </MessageBubble>
              </>
            )}

            {/* TABLE */}
            {showTable && (
              <MessageBubble from="bot" animate={true}>
                <CompareTable comp={competitor || "Mitbewerber"} onDownload={handleDownload} />
              </MessageBubble>
            )}

            {/* PROSE */}
            {showProse && (
              <MessageBubble from="bot" animate={true}>
                <ProseCard situation={situation} comp={competitor} />
              </MessageBubble>
            )}

            {/* DEEP DIVE SELECTOR */}
            {showDeepSelector && (
              <MessageBubble from="bot" animate={true}>
                <DeepDiveSelector openedKeys={deepAreas} onSelect={handleDeepSelect} />
              </MessageBubble>
            )}

            {/* DEEP DIVE CARDS */}
            {deepAreas.map((key) => {
              const area = DEEP_DIVE_AREAS.find((a) => a.key === key);
              return area ? (
                <MessageBubble key={key} from="bot" animate={true}>
                  <DeepDiveCard area={area} />
                </MessageBubble>
              ) : null;
            })}

            {/* "Weiteren Bereich" button after last deep dive */}
            {deepAreas.length > 0 && deepAreas.length < DEEP_DIVE_AREAS.length && (
              <div className="more-area-row">
                <button className="btn btn-ghost btn-sm" onClick={() => setShowDeepSelector(true)}>
                  <Icon name="Plus" size={13} /> Weiteren Bereich vertiefen
                </button>
              </div>
            )}

            {/* QA messages */}
            {qaMessages.map((entry, i) => (
              <React.Fragment key={i}>
                <MessageBubble from="user" time={entry.t}>{entry.q}</MessageBubble>
                <MessageBubble from="bot" time={entry.t}>
                  <div className="qa-answer"><p>{entry.a}</p></div>
                </MessageBubble>
              </React.Fragment>
            ))}

            {/* Disclaimer */}
            {analyseDone && (
              <div className="disclaimer">
                <Icon name="Info" size={13} />
                KI-generiert — keine rechtsverbindliche Leistungszusage. Bitte fachlich prüfen.
              </div>
            )}

            {/* PREP — always last */}
            {showPrep && (
              <MessageBubble from="bot" animate={true}>
                <PrepCard kunde={kundenLabel} comp={competitor || "Mitbewerber"} />
              </MessageBubble>
            )}

          </div>
        </main>
      </div>

      <footer className="composer">
        <div className="composer-inner">
          <form className="qa-form" onSubmit={handleQaSubmit}>
            <Icon name="MessageSquare" size={15} className="qa-icon" />
            <input
              value={qaInput}
              onChange={(e) => setQaInput(e.target.value)}
              placeholder="Stell mir eine Folgefrage zum Vergleich…"
              className="qa-input"
            />
            <button type="submit" className="qa-send" disabled={!qaInput.trim()}>
              <Icon name="ArrowUp" size={16} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}

function stepIndex(s) {
  const order = ["welcome", "upload-intro", "detected", "upload-axa", "situation-intro", "analyse", "advantages", "table"];
  return order.indexOf(s);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
