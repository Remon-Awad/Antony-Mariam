const { useState, useEffect, useRef } = React;

/* ✏️ Edit your details here only */
const CONFIG = {
  /* The date is read from <body data-date="..."> in index.html (single source for the countdown and the preloader) */
  /* This is the time of the CROWNING (the ceremony), in Cairo time (+03:00), so the countdown is the same for every guest wherever they are */
  date: document.body.dataset.date || "2026-10-29T21:00:00+03:00",
  blessing: "By the Grace of God",
  verse: "So then they are no more twain, but one flesh.",
  verseRef: "Mark 10 : 8",
  events: [
    { icon: "church", title: "The Ceremony", place: "Church of St. George", address: "Heliopolis", map: "https://maps.app.goo.gl/Uxy1w9okynzzgWCi6?g_st=ic" },
    { icon: "star", title: "The Celebration", place: "Romanica Hall – Egypt View", address: "New Corniche of Mokattam", map: "https://maps.app.goo.gl/XC1JA2Z8zoL4NLPYA?g_st=iw" }
  ],
  dressCode: "Girls in rose 🌸",
  images: { main: "images/main-image.jpeg" },
  /* Our Story photos: add or remove entries here. One photo = one centered frame, two or more = side by side */
  gallery: [
    { src: "images/photo2.jpeg", cap: "The first step, and the start of forever" }
  ]
};

const pad = (n) => String(n).padStart(2, "0");
const CAIRO = "Africa/Cairo";
const ceremonyTime = () => new Date(CONFIG.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: CAIRO });

/* If a file is missing, the same name is tried with other extensions (jpeg / jpg / png / webp, any letter-case) before the placeholder shows */
const EXTS = ["jpeg", "jpg", "png", "webp", "JPG", "JPEG", "PNG"];
function Photo({ src, alt, ph = "Photo placeholder" }) {
  const list = React.useMemo(() => {
    const base = src.replace(/\.[^./]+$/, "");
    return [src, ...EXTS.map((e) => `${base}.${e}`).filter((u) => u !== src)];
  }, [src]);
  const [i, setI] = useState(0);
  return i >= list.length
    ? <div className="ph">{ph}</div>
    : <img className="photo" key={list[i]} src={list[i]} alt={alt} onError={() => setI((n) => n + 1)} />;
}

const Ltr = ({ t, o = 0 }) => [...t].map((c, i) => <em className="ch" style={{ "--i": o + i }} key={i}>{c}</em>);

const Orn = () => <div className="orn"><i></i></div>;

/* Botanical line-art branch: grows in when the invitation opens, then sways softly (see the "hero branches" block in style.css) */
const LEAVES = [[19, 124, 1], [33, 96, .9], [51, 69, .8], [75, 40, .65], [95, 20, .5]];
const Branch = ({ className, d = 0 }) => (
  <svg className={`br ${className}`} style={{ "--bd": d + "s" }} viewBox="0 0 120 160" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
    <g className="sw">
      <path className="stem" pathLength="1" d="M8 152 C 26 104, 46 62, 108 10" />
      {LEAVES.map(([x, y, s], i) => [-100, -10].map((a, j) => (
        <g key={i + "_" + a} transform={`translate(${x} ${y}) rotate(${i > 2 ? a + 20 : a}) scale(${s})`}>
          <path className="lf" fill="currentColor" fillOpacity=".15" style={{ "--k": i, "--s": j ? -1 : 1 }}
            d="M0 0 C6 -8 18 -8 26 0 C18 8 6 8 0 0Z" />
        </g>
      )))}
    </g>
  </svg>
);

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {name === "church"
      ? <path d="M12 2v5M9.5 4.5h5M12 7l6 4.5V21H6v-9.5zM10 21v-5h4v5" />
      : <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />}
  </svg>
);

function useCountdown(target) {
  const calc = () => {
    const d = Math.max(0, new Date(target) - new Date());
    return { d: Math.floor(d / 864e5), h: Math.floor(d / 36e5 % 24), m: Math.floor(d / 6e4 % 60), s: Math.floor(d / 1e3 % 60) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const i = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(i);
  }, [target]);
  return t;
}

const BOKEH = Array.from({ length: 14 }, () => ({ l: Math.random() * 100, s: 6 + Math.random() * 22, d: 9 + Math.random() * 10, dl: -Math.random() * 14, dx: (Math.random() - .5) * 120 }));

function Hero() {
  const D = new Date(CONFIG.date);
  const f = (o) => D.toLocaleDateString("en-US", { ...o, timeZone: CAIRO });
  return (
    <header className="hero">
      <div className="rays" aria-hidden="true"></div>
      <div className="bokeh" aria-hidden="true">{BOKEH.map((b, i) => <i key={i} style={{ left: b.l + "%", width: b.s, height: b.s, animationDuration: b.d + "s", animationDelay: b.dl + "s", "--dx": b.dx + "px" }}></i>)}</div>
      <Branch className="tl" /><Branch className="tr" d={-2.4} /><Branch className="bl" d={-4.6} /><Branch className="brr" d={-6.2} />
      <div className="bless reveal">{CONFIG.blessing}</div>
      <p className="invite reveal" style={{ "--d": ".15s" }}>We are honored and delighted to invite you to share our joy</p>
      <div className="arch-wrap reveal" style={{ "--d": ".3s" }}>
        <div className="arch"><div className="arch-in"><Photo src={CONFIG.images.main} alt="Antony and Mariam" ph="Main photo" /></div></div>
      </div>
      <h1 className="names reveal" style={{ "--d": ".4s" }} aria-label="Antony & Mariam">
        <span className="en" aria-hidden="true"><Ltr t="Antony" /></span>
        <span className="amp" aria-hidden="true"><Ltr t="&" o={6} /></span>
        <span className="en" aria-hidden="true"><Ltr t="Mariam" o={7} /></span>
      </h1>
      <div className="kicker reveal" style={{ "--d": ".6s" }}>Save the Date</div>
      <div className="sd reveal" style={{ "--d": ".7s" }}>
        <span>{f({ weekday: "long" })}</span>
        <b>{f({ day: "numeric" })}</b>
        <span>{f({ month: "long" })}</span>
      </div>
      <div className="sd-year reveal" style={{ "--d": ".8s" }}>{f({ year: "numeric" })}</div>
      <div className="scroll-cue"></div>
    </header>
  );
}

const Verse = () => (
  <section className="verse">
    <div className="sec">
      <div className="reveal"><q>{CONFIG.verse}</q><small>{CONFIG.verseRef}</small></div>
    </div>
  </section>
);

function Countdown() {
  const t = useCountdown(CONFIG.date);
  const done = t.d + t.h + t.m + t.s === 0;
  const fired = useRef(false);
  useEffect(() => {
    if (!done || fired.current) return;
    fired.current = true;
    const go = () => (document.body.classList.contains("is-loading") ? setTimeout(go, 500) : window.Celebrate && Celebrate());
    go();
  }, [done]);
  const cells = [["Days", t.d], ["Hours", t.h], ["Minutes", t.m], ["Seconds", t.s]];
  return (
    <section className="band">
      <div className="sec">
        <h2 className="title reveal">{done ? "Today is our wedding day 🎉" : "Counting down to our crowning"}</h2>
        <Orn />
        <p className="count-sub reveal">{CONFIG.events[0].place} · {ceremonyTime()}</p>
        <div className="count reveal" style={{ "--d": ".2s" }}>
          {cells.map(([l, v]) => <div className="cell" key={l}><b key={v}>{pad(v)}</b><span>{l}</span></div>)}
        </div>
      </div>
    </section>
  );
}

const Events = () => (
  <section className="sec">
    <h2 className="title reveal">When &amp; Where</h2>
    <Orn />
    <div className="cards" style={{ marginTop: 50 }}>
      {CONFIG.events.map((e, i) => (
        <div className="card reveal" style={{ "--d": `${i * .15}s` }} key={e.title}>
          <div className="ico"><Icon name={e.icon} /></div>
          <h3>{e.title}</h3>
          {i === 0 && <div className="time">{ceremonyTime()}</div>}
          <p><b>{e.place}</b><br />{e.address}</p>
          <a className="btn" href={e.map} target="_blank" rel="noopener">Open Map</a>
        </div>
      ))}
    </div>
    <div className="dress reveal" style={{ "--d": ".2s" }}>
      <span>Dress Code</span>
      <b>{CONFIG.dressCode}</b>
    </div>
  </section>
);

/* Caption bent into an arch: every letter sits on a circle, widths are measured from the real font so the spacing stays even */
const ARC_R = 12.5; /* circle radius in em */
function ArcText({ text }) {
  const chars = [...text];
  const [geo, setGeo] = useState(null);
  useEffect(() => {
    let dead = false;
    const LS = .04; /* letter-spacing in em, same as .story-arc in the CSS */
    const measure = () => {
      if (dead) return;
      const c = document.createElement("canvas").getContext("2d");
      c.font = 'italic 600 100px "Cormorant Garamond", Georgia, serif';
      const ws = chars.map((ch) => c.measureText(ch === " " ? "\u00A0" : ch).width / 100 + LS);
      const span = ws.reduce((a, b) => a + b, 0) / ARC_R;
      let acc = 0;
      const ang = ws.map((w) => { const a = ((acc + w / 2) / ARC_R - span / 2) * 180 / Math.PI; acc += w; return a; });
      setGeo({ ang, half: span / 2 });
    };
    const f = document.fonts;
    if (f && f.load) f.load('italic 600 100px "Cormorant Garamond"').then(measure, measure); else measure();
    if (f && f.addEventListener) f.addEventListener("loadingdone", measure);
    return () => { dead = true; if (f && f.removeEventListener) f.removeEventListener("loadingdone", measure); };
  }, [text]);

  const half = geo ? geo.half : .6;
  const sag = ARC_R * (1 - Math.cos(half));
  const r = ARC_R - 1.75, h2 = half + .06;
  const x1 = r * Math.sin(h2), x0 = -x1, y0 = ARC_R - r * Math.cos(h2);
  return (
    <p className="story-arc reveal" role="img" aria-label={text}
      style={{ "--R": ARC_R + "em", "--sag": sag.toFixed(3), visibility: geo ? "visible" : "hidden" }}>
      <span className="arc-lw" aria-hidden="true">
        <svg className="arc-line" viewBox="0 0 1 1">
          <defs>
            <linearGradient id="arcG" gradientUnits="userSpaceOnUse" x1={x0} y1="0" x2={x1} y2="0">
              <stop offset="0" stopColor="#c9962f" stopOpacity="0" />
              <stop offset=".25" stopColor="#c9962f" />
              <stop offset=".5" stopColor="#f0cf7a" />
              <stop offset=".75" stopColor="#c9962f" />
              <stop offset="1" stopColor="#c9962f" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y0}`} />
          <circle className="arc-dot" cx={x0} cy={y0} r=".06" />
          <circle className="arc-dot" cx={x1} cy={y0} r=".06" style={{ animationDelay: "-1.5s" }} />
        </svg>
      </span>
      {chars.map((ch, i) => (
        <span className="arc-l" aria-hidden="true" key={(geo ? "g" : "w") + i} style={{ "--a": (geo ? geo.ang[i] : 0) + "deg", "--i": i }}>
          <i className="arc-c">{ch === " " ? "\u00A0" : ch}</i>
        </span>
      ))}
    </p>
  );
}

const Gallery = () => {
  const one = CONFIG.gallery.length === 1;
  return (
    <section className={`sec${one ? " story" : ""}`}>
      {!one && <><h2 className="title reveal">Our Story</h2><Orn /></>}
      <div className={`gallery${one ? " one story-one" : ""}`}>
        {one && <ArcText text={CONFIG.gallery[0].cap} />}
        {CONFIG.gallery.map((g, i) => (
          <figure className="frame reveal" style={{ "--d": `${i * .2}s` }} key={g.src}>
            <Photo src={g.src} alt={`Antony and Mariam, photo ${i + 1}`} />
            {!one && <figcaption>{g.cap}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
};

function Signature() {
  const [hs, setHs] = useState([]);
  const pop = () => {
    const id = Date.now() + Math.random();
    const batch = Array.from({ length: 9 }, (_, i) => ({
      id: id + i, x: (Math.random() - .5) * 160, r: (Math.random() - .5) * 70,
      s: .6 + Math.random() * .9, t: 1.1 + Math.random() * .9
    }));
    setHs((h) => [...h, ...batch]);
    setTimeout(() => setHs((h) => h.filter((x) => !batch.includes(x))), 2200);
    if (navigator.vibrate) navigator.vibrate(12);
  };
  return (
    <div className="sig reveal" style={{ "--d": ".1s" }}>
      <span className="sig__line" aria-hidden="true"></span>
      <div className="sig__txt">
        <span>Made with Love</span>
        <span className="sig__hw">
          <button className="sig__heart" onClick={pop} aria-label="Send some love" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.2C5.6 16.1 2 12.7 2 8.6 2 5.6 4.3 3.4 7.1 3.4c1.9 0 3.7 1 4.9 2.7 1.2-1.7 3-2.7 4.9-2.7C19.7 3.4 22 5.6 22 8.6c0 4.1-3.6 7.5-10 12.6z" /></svg>
          </button>
          {hs.map((h) => (
            <i className="fh" key={h.id} aria-hidden="true" style={{ "--x": h.x + "px", "--r": h.r + "deg", "--s": h.s, animationDuration: h.t + "s" }}>♥</i>
          ))}
        </span>
      </div>
    </div>
  );
}

const Footer = () => (
  <footer>
    <div className="en gold-text">Antony &amp; Mariam</div>
    <p>We can’t wait to celebrate with you ❤</p>
    <Signature />
  </footer>
);

function App() {
  useEffect(() => { window.WeddingFX && window.WeddingFX.appReady(); }, []);
  return (<><Hero /><Verse /><Countdown /><Events /><Gallery /><Footer /></>);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);