import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLang } from "./i18n/LanguageContext.jsx";
import LanguageSwitch from "./components/LanguageSwitch.jsx";
import CustomOrder from "./components/CustomOrder.jsx";
import WelcomeSnackbar from "./components/WelcomeSnackbar.jsx";

const categories = [
  ["Cleaning", "🧼"], ["Repair", "🔧"], ["Assemble", "🪑"], ["Beauty", "💅"],
  ["Auto", "🚗"], ["Decoration", "🎨"], ["Gardening", "🌿"], ["Installation", "💡"],
  ["Laundry", "🧺"], ["Maintenance", "🛠️"], ["Moving", "📦"], ["Pest Control", "🪲"],
  ["Waterproofing", "💧"],
];

const DHAKA = [23.8103, 90.4125];
const BOUNDS = [[23.62, 90.28], [23.98, 90.55]];

const areas = [
  ["Dhanmondi", 23.7461, 90.3742],
  ["Gulshan", 23.7925, 90.4078],
  ["Banani", 23.794, 90.4043],
  ["Uttara", 23.8759, 90.3795],
  ["Mirpur", 23.8223, 90.3654],
  ["Mohammadpur", 23.7662, 90.358],
  ["Bashundhara", 23.8151, 90.4257],
  ["Motijheel", 23.733, 90.4172],
  ["Badda", 23.7806, 90.425],
  ["Tejgaon", 23.7593, 90.392],
  ["Khilgaon", 23.75, 90.429],
  ["Old Dhaka", 23.7104, 90.4074],
];

const serviceTypes = ["Plumbing", "Electrical", "AC Service", "Carpentry", "Painting", "Appliance", "Handyman"];
const serviceIcons = { Plumbing: "🔧", Electrical: "⚡", "AC Service": "❄️", Carpentry: "🪚", Painting: "🎨", Appliance: "📺", Handyman: "🧰" };
// Demo data: 2 repairmen around every area
function makePros() {
  const list = [];
  areas.forEach(([area, lat, lng], i) => {
    for (let k = 0; k < 2; k++) {
      const n = i * 2 + k;
      const homeLat = lat + (k ? 0.006 : -0.005) + ((n % 3) - 1) * 0.002;
      const homeLng = lng + (k ? -0.005 : 0.006) + ((n % 2) - 0.5) * 0.003;
      list.push({
        id: n,
        nameIdx: n % 24,
        area,
        service: serviceTypes[n % serviceTypes.length],
        rating: (4.5 + ((n * 7) % 5) / 10).toFixed(1),
        status: n % 4 === 3 ? "busy" : "available",
        homeLat, homeLng, lat: homeLat, lng: homeLng,
      });
    }
  });
  return list;
}

function distKm(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
const etaMin = (km) => Math.max(3, Math.round(km * 4 + 4));

const Stars = () => <span className="stars" aria-label="5 stars">★★★★★</span>;

const Logo = ({ light }) => (
  <a className={"logo" + (light ? " light" : "")} href="#top">
    <span className="logo-mark">E</span>ELITE
  </a>
);

function Navbar() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo />
        <button className="loc" type="button">
          <span className="pin">📍</span>
          <span className="loc-text"><small>{t("nav.location")}</small><b>{t("nav.city")}</b></span>
          <span className="chev">⌄</span>
        </button>
        <nav className={"nav-links" + (open ? " open" : "")}>
          <a href="#services">{t("nav.services")}</a>
          <a href="#reviews">{t("nav.reviews")}</a>
          <a href="#download">{t("nav.download")}</a>
        </nav>
        <div className="nav-right">
          <button className="icon-btn" aria-label={t("nav.search")}>🔍</button>
          <button className="icon-btn badge" aria-label={t("nav.cart")} data-count="0">🛒</button>
          <LanguageSwitch />
          <button className="burger" onClick={() => setOpen(!open)} aria-label={t("nav.menu")}>☰</button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { t, n } = useLang();
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="rating-pill">
            <b>{t("hero.rating")}</b> <Stars /> <span>{t("hero.reviewsCount")}</span>
          </div>
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.sub")}</p>
          <a className="btn btn-primary" href="#download">{t("hero.cta")}</a>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="blob" />
          <div className="phone">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="ps-bar" />
              <div className="ps-card"><span>🧼</span><div><b>{t("hero.homeCleaning")}</b><small>{t("hero.from")} ৳{n("29.90")}</small></div></div>
              <div className="ps-card"><span>🔧</span><div><b>{t("hero.sinkRepair")}</b><small>{t("hero.from")} ৳{n("46.90")}</small></div></div>
              <div className="ps-map"><i /><i /><i /></div>
              <div className="ps-btn">{t("hero.bookNow")}</div>
            </div>
          </div>
          <div className="float f1">{t("hero.f1")}</div>
          <div className="float f2">{t("hero.f2")}</div>
        </div>
      </div>
      <div className="container mentions">
        {t("hero.mentions").map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </section>
  );
}

function Steps() {
  const { t, n } = useLang();
  const steps = t("steps.list");
  const names = t("steps.cards");
  const cards = [["29.90", "#d9ecf1", "🧽"], ["46.90", "#e6f1ee", "🚰"], ["63.50", "#e3e9f5", "⚡"]];
  return (
    <section className="section" id="how_it_works">
      <div className="container">
        <div className="steps">
          <div>
            <h2>{t("steps.title")}</h2>
            <ol className="step-list">
              {steps.map((s, i) => (
                <li key={i}><span className="num">{n(i + 1)}</span>{s}</li>
              ))}
            </ol>
            <a className="btn btn-primary" href="#download">{t("steps.cta")}</a>
          </div>
          <div className="service-cards">
            {cards.map(([p, bg, e], i) => (
              <article key={i} className="service-card">
                <div className="service-img" style={{ background: bg }}>{e}</div>
                <small>{t("steps.from")} ৳{n(p)}</small>
                <h3>{names[i]}</h3>
              </article>
            ))}
          </div>
        </div>
        <CustomOrder />
      </div>
    </section>
  );
}

function Categories() {
  const { t } = useLang();
  return (
    <section className="section alt" id="services">
      <div className="container">
        <h2 className="center">{t("categoriesTitle")}</h2>
        <div className="cat-grid">
          {categories.map(([name, emoji]) => (
            <a key={name} href="#download" className="cat">
              <span className="cat-icon">{emoji}</span>
              <span>{t(`categories.${name}`)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const { t, n } = useLang();
  return (
    <section className="section" id="reviews">
      <div className="container">
        <div className="reviews-head">
          <h2>{t("reviews.title")}</h2>
          <div className="score"><b>{n("4.7")}</b><div><Stars /><small>{t("reviews.from")}</small></div></div>
        </div>
        <div className="review-grid">
          {t("reviews.items").map((r) => (
            <figure key={r.name} className="review">
              <Stars />
              <blockquote>“{r.text}”</blockquote>
              <figcaption><span className="avatar">{r.name[0]}</span><div><b>{r.name}</b><small>{r.city}</small></div></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Nearby() {
  const { t, n, lang } = useLang();
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef({});
  const youRef = useRef(null);
  const [pros, setPros] = useState(makePros);
  const [service, setService] = useState("All");
  const [area, setArea] = useState(null);
  // `label` is an area key (e.g. "Gulshan"), "Dhaka" or "you" — translated when displayed
  const [center, setCenter] = useState({ lat: DHAKA[0], lng: DHAKA[1], label: "Dhaka" });
  // `note` is stored as a translation key so it follows the language switch
  const [note, setNote] = useState("");
  const [activeId, setActiveId] = useState(null);

  const centerName = center.label === "Dhaka" ? t("nearby.cityLabel")
    : center.label === "you" ? t("nearby.you")
    : t(`areas.${center.label}`);
  const proName = (p) => t("proNames")[p.nameIdx];

  // Map starts on Dhaka city and is kept inside Dhaka's bounds
  useEffect(() => {
    const el = mapEl.current;
    const map = L.map(el, { minZoom: 10, maxBounds: BOUNDS, maxBoundsViscosity: 0.8 }).setView(DHAKA, 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    map.on("zoomstart", () => el.classList.add("no-anim"));
    map.on("zoomend", () => setTimeout(() => el.classList.remove("no-anim"), 100));
    const tm = setTimeout(() => map.invalidateSize(), 200);
    return () => { clearTimeout(tm); map.remove(); mapRef.current = null; markersRef.current = {}; youRef.current = null; };
  }, []);

  // Repairmen drift around their home spot, like cars moving on a ride app
  useEffect(() => {
    const tm = setInterval(() => {
      setPros((prev) => prev.map((p) => p.status === "available"
        ? {
            ...p,
            lat: p.lat + (p.homeLat - p.lat) * 0.15 + (Math.random() - 0.5) * 0.0014,
            lng: p.lng + (p.homeLng - p.lng) * 0.15 + (Math.random() - 0.5) * 0.0014,
          }
        : p));
    }, 3000);
    return () => clearInterval(tm);
  }, []);

  // Keep markers in sync with data + filters (+ language for popup text)
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const seen = new Set();
    pros.forEach((p) => {
      if (service !== "All" && p.service !== service) return;
      seen.add(p.id);
      const eta = n(etaMin(distKm(center, p)));
      const popup = `<div class="pop"><b>${proName(p)}</b><br>${serviceIcons[p.service]} ${t(`serviceTypes.${p.service}`)} · ⭐ ${n(p.rating)}<br>`
        + (p.status === "available" ? `<span class="pop-ok">${t("nearby.popupAvail").replace("{eta}", eta)}</span>` : `<span class="pop-busy">${t("nearby.popupBusy")}</span>`)
        + `<br><a href="#download">${t("nearby.popupBook")}</a></div>`;
      let m = markersRef.current[p.id];
      if (!m) {
        const icon = L.divIcon({
          className: "pro-marker",
          html: `<div class="pro-pin ${p.status}"><span>${serviceIcons[p.service]}</span></div>`,
          iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -22],
        });
        m = L.marker([p.lat, p.lng], { icon }).bindPopup(popup);
        m.on("click", () => setActiveId(p.id));
        markersRef.current[p.id] = m;
      } else {
        m.setLatLng([p.lat, p.lng]);
        m.setPopupContent(popup);
      }
      if (!layer.hasLayer(m)) layer.addLayer(m);
    });
    Object.entries(markersRef.current).forEach(([id, m]) => {
      if (!seen.has(Number(id)) && layer.hasLayer(m)) layer.removeLayer(m);
    });
  }, [pros, service, center, lang]);

  // Keep the "You are here" popup in the current language
  useEffect(() => {
    youRef.current?.setPopupContent(t("nearby.youHere"));
  }, [lang]);

  const list = useMemo(
    () => pros
      .filter((p) => p.status === "available" && (service === "All" || p.service === service))
      .map((p) => ({ ...p, km: distKm(center, p) }))
      .sort((a, b) => a.km - b.km),
    [pros, service, center]
  );

  const showDhaka = () => {
    setArea(null); setNote("");
    setCenter({ lat: DHAKA[0], lng: DHAKA[1], label: "Dhaka" });
    mapRef.current?.flyTo(DHAKA, 12, { duration: 1 });
  };

  const pickArea = (name, lat, lng) => {
    setArea(name); setNote("");
    setCenter({ lat, lng, label: name });
    mapRef.current?.flyTo([lat, lng], 14, { duration: 1.1 });
  };

  const locate = () => {
    if (!navigator.geolocation) { setNote("noGeo"); return; }
    setNote("finding");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        const inDhaka = lat >= BOUNDS[0][0] && lat <= BOUNDS[1][0] && lng >= BOUNDS[0][1] && lng <= BOUNDS[1][1];
        if (!inDhaka) { setNote("outside"); return; }
        const map = mapRef.current;
        if (!map) return;
        if (youRef.current) youRef.current.remove();
        youRef.current = L.marker([lat, lng], {
          icon: L.divIcon({ className: "pro-marker", html: '<div class="you-pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
        }).addTo(map).bindPopup(t("nearby.youHere"));
        setArea(null); setNote("closest");
        setCenter({ lat, lng, label: "you" });
        map.flyTo([lat, lng], 14, { duration: 1.1 });
      },
      () => setNote("failed"),
      { timeout: 8000 }
    );
  };

  const selectPro = (p) => {
    setActiveId(p.id);
    const map = mapRef.current, m = markersRef.current[p.id];
    if (!map || !m) return;
    map.flyTo([p.lat, p.lng], 15, { duration: 1 });
    setTimeout(() => m.openPopup(), 1000);
  };

  return (
    <section className="section alt" id="where_we_are">
      <div className="container">
        <div className="nearby-head">
          <h2>{t("nearby.title")}</h2>
          <p className="lead">{t("nearby.lead")}</p>
        </div>
        <div className="nearby">
          <aside className="nearby-panel">
            <button className="btn btn-primary locate" type="button" onClick={locate}>{t("nearby.useLocation")}</button>
            {note && <p className="note">{t(`nearby.${note}`)}</p>}

            <div className="label">{t("nearby.area")}</div>
            <div className="chips">
              <button type="button" className={"chip sm" + (area === null ? " on" : "")} onClick={showDhaka}>{t("nearby.allDhaka")}</button>
              {areas.map(([name, lat, lng]) => (
                <button type="button" key={name} className={"chip sm" + (area === name ? " on" : "")} onClick={() => pickArea(name, lat, lng)}>{t(`areas.${name}`)}</button>
              ))}
            </div>

            <div className="label">{t("nearby.service")}</div>
            <div className="chips">
              {["All", ...serviceTypes].map((s) => (
                <button type="button" key={s} className={"chip sm" + (service === s ? " on" : "")} onClick={() => setService(s)}>{t(`serviceTypes.${s}`)}</button>
              ))}
            </div>

            <div className="label">
              {lang === "bn"
                ? `${centerName}-এর কাছে ${n(list.length)} ${t("nearby.availableNear")}`
                : `${list.length} ${t("nearby.availableNear")} ${centerName}`}
            </div>
            <ul className="pro-list">
              {list.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <button type="button" className={"pro-item" + (activeId === p.id ? " active" : "")} onClick={() => selectPro(p)}>
                    <span className="pro-ico">{serviceIcons[p.service]}</span>
                    <span className="pro-info"><b>{proName(p)}</b><small>{t(`serviceTypes.${p.service}`)} · ⭐ {n(p.rating)}</small></span>
                    <span className="pro-eta"><b>~{n(etaMin(p.km))} {t("nearby.minAbbr")}</b><small>{n(p.km.toFixed(1))} {t("nearby.km")}</small></span>
                  </button>
                </li>
              ))}
              {list.length === 0 && <li className="note">{t("nearby.none")}</li>}
            </ul>
          </aside>

          <div className="map-card">
            <div ref={mapEl} id="map" />
            <div className="legend"><span><i className="lg ok" /> {t("nearby.available")}</span><span><i className="lg busy" /> {t("nearby.busy")}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feedback() {
  const { t } = useLang();
  return (
    <section className="section" id="feedback">
      <div className="container">
        <div className="fb-head">
          <h2>{t("feedback.title")}</h2>
          <p className="lead">{t("feedback.lead")}</p>
        </div>
        <div className="fb-grid">
          {t("feedback.items").map((f) => (
            <article key={f.name} className="fb-card">
              <div className="fb-top"><Stars /><span className="fb-tag">{f.service}</span></div>
              <p>{f.text}</p>
              <div className="fb-user">
                <span className="avatar">{f.name[0]}</span>
                <div><b>{f.name}</b><small>{f.area}</small></div>
              </div>
            </article>
          ))}
        </div>
        <div className="fb-cta"><a className="btn btn-primary" href="#download">{t("feedback.cta")}</a></div>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useLang();
  const [open, setOpen] = useState(0);
  return (
    <section className="section alt" id="faqs">
      <div className="container faq">
        <h2 className="center">{t("faq.title")}</h2>
        {t("faq.items").map(([q, a], i) => (
          <div key={i} className={"faq-item" + (open === i ? " open" : "")}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              <span>{q}</span><span className="chev">⌄</span>
            </button>
            <div className="faq-body"><p>{a}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Download() {
  const { t } = useLang();
  return (
    <section className="section" id="download">
      <div className="container download">
        <div className="dl-phone" aria-hidden="true"><div className="phone small"><div className="phone-notch" /><div className="phone-screen"><div className="ps-map big"><i /><i /><i /></div><div className="ps-btn">{t("download.track")}</div></div></div></div>
        <div>
          <h2>{t("download.title")}</h2>
          <p className="lead">{t("download.lead")}</p>
          <div className="dl-row">
            <div className="qr" aria-label="QR placeholder">{Array.from({ length: 49 }).map((_, i) => <i key={i} className={(i * 7 + i % 3) % 3 === 0 ? "on" : ""} />)}</div>
            <div className="stores">
              <a href="#top" className="store"><small>{t("download.appStoreSmall")}</small><b>{t("download.appStore")}</b></a>
              <a href="#top" className="store"><small>{t("download.playSmall")}</small><b>{t("download.play")}</b></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLang();
  const col = (title, items) => (
    <div className="f-col"><h5>{title}</h5>{items.map((i) => <a key={i} href="#top">{i}</a>)}</div>
  );
  return (
    <footer className="footer">
      <div className="container">
        <h4>{t("footer.popularTitle")}</h4>
        <div className="popular">{t("footer.popular").map((p) => <a key={p} href="#top">{p}</a>)}</div>
        <div className="f-cols">
          {col(t("footer.explore"), t("footer.exploreItems"))}
          {col(t("footer.legal"), t("footer.legalItems"))}
          {col(t("footer.popCats"), t("footer.popCatItems"))}
          {col(t("footer.popCities"), t("footer.popCityItems"))}
        </div>
        <div className="f-bottom">
          <Logo light />
          <span>{t("footer.country")}</span>
          <span>{t("footer.copy")}</span>
          <a className="btn btn-light" href="#top">{t("footer.becomePro")}</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Steps />
        <Categories />
        <Reviews />
        <Nearby />
        <Feedback />
        <Faq />
        <Download />
      </main>
      <Footer />
      <WelcomeSnackbar />
    </>
  );
}
