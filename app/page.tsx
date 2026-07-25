"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ApodItem = {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: "image" | "video";
  service_version?: string;
  thumbnail_url?: string;
  title: string;
  url: string;
};

const FIRST_APOD_DATE = "1995-06-16";
const MAX_RANGE_DAYS = 30;

const SPACE_FACTS = [
  "A day on Venus is longer than a year on Venus.",
  "The light you see from the Sun left its surface about eight minutes ago.",
  "More than one million Earths could fit inside the Sun.",
  "Neutron stars can spin hundreds of times every second.",
  "Saturn would float in water—if you could find a bathtub big enough.",
  "Footprints on the Moon can last for millions of years because there is no wind.",
  "The Milky Way and Andromeda galaxies are moving toward one another.",
  "Space is completely silent because sound needs matter to travel through.",
];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultDates() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 5);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(`${value}T12:00:00Z`))
    .toUpperCase();
}

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);
  return Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
}

function isEmbeddableVideo(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"].includes(
        parsed.hostname,
      )
    );
  } catch {
    return false;
  }
}

export default function Home() {
  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [apiKey, setApiKey] = useState("DEMO_KEY");
  const [items, setItems] = useState<ApodItem[]>([]);
  const [selected, setSelected] = useState<ApodItem | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [factIndex, setFactIndex] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const today = toIsoDate(new Date());

  useEffect(() => {
    setFactIndex(Math.floor(Math.random() * SPACE_FACTS.length));
    const savedKey = window.localStorage.getItem("nasa-apod-api-key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [selected]);

  function openDetails(item: ApodItem) {
    lastFocusedRef.current = document.activeElement as HTMLElement;
    setSelected(item);
  }

  async function getSpaceImages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!startDate || !endDate) {
      setStatus("error");
      setMessage("Choose both a start and end date.");
      return;
    }

    const rangeLength = daysBetween(startDate, endDate);
    if (rangeLength < 1) {
      setStatus("error");
      setMessage("The end date must be the same as or later than the start date.");
      return;
    }
    if (rangeLength > MAX_RANGE_DAYS) {
      setStatus("error");
      setMessage(`Choose a range of ${MAX_RANGE_DAYS} days or fewer.`);
      return;
    }

    setStatus("loading");
    setItems([]);

    const activeKey = apiKey.trim() || "DEMO_KEY";
    window.localStorage.setItem("nasa-apod-api-key", activeKey);
    const query = new URLSearchParams({
      api_key: activeKey,
      start_date: startDate,
      end_date: endDate,
      thumbs: "true",
    });

    try {
      const response = await fetch(`https://api.nasa.gov/planetary/apod?${query.toString()}`);
      const data = (await response.json()) as ApodItem[] | { error?: { message?: string }; msg?: string };

      if (!response.ok) {
        const errorMessage =
          !Array.isArray(data) && (data.error?.message || data.msg)
            ? data.error?.message || data.msg
            : "NASA’s image service could not complete this request.";
        throw new Error(errorMessage);
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No Astronomy Picture of the Day entries were found for this range.");
      }

      setItems([...data].sort((a, b) => b.date.localeCompare(a.date)));
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something interrupted the transmission. Please try again.",
      );
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Space Explorer home">
          <span className="brand-mark" aria-hidden="true" />
          <span>SPACE EXPLORER</span>
        </a>
        <div className="header-meta">
          <span className="status-dot" aria-hidden="true" />
          NASA OPEN DATA
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-orbit" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">ASTRONOMY PICTURE OF THE DAY</p>
          <h1>
            Explore the universe,
            <br />
            <span>one day at a time.</span>
          </h1>
          <p className="hero-copy">
            Select a date range and journey through NASA’s daily archive of discoveries,
            distant worlds, and cosmic events.
          </p>
        </div>

        <form className="mission-control" onSubmit={getSpaceImages}>
          <div className="control-heading">
            <span>01</span>
            <p>SET MISSION WINDOW</p>
            <small>MAX {MAX_RANGE_DAYS} DAYS</small>
          </div>
          <div className="date-grid">
            <label>
              <span>FROM</span>
              <input
                type="date"
                value={startDate}
                min={FIRST_APOD_DATE}
                max={endDate || today}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </label>
            <div className="date-arrow" aria-hidden="true">
              →
            </div>
            <label>
              <span>TO</span>
              <input
                type="date"
                value={endDate}
                min={startDate || FIRST_APOD_DATE}
                max={today}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </label>
          </div>

          <details className="api-settings">
            <summary>API ACCESS · {apiKey === "DEMO_KEY" ? "DEMO KEY" : "PERSONAL KEY"}</summary>
            <label>
              <span>NASA API KEY</span>
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                autoComplete="off"
                aria-describedby="api-key-help"
              />
            </label>
            <p id="api-key-help">
              DEMO_KEY works for testing. A free personal key gives you a larger request limit.
            </p>
          </details>

          <button className="launch-button" type="submit" disabled={status === "loading"}>
            <span>{status === "loading" ? "RECEIVING TRANSMISSION" : "GET SPACE IMAGES"}</span>
            <span aria-hidden="true">{status === "loading" ? "•••" : "↗"}</span>
          </button>
        </form>

        <a className="scroll-cue" href="#archive">
          <span>SCROLL TO ARCHIVE</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="archive" id="archive" aria-live="polite">
        <div className="fact-panel">
          <div className="fact-number">DID YOU KNOW?</div>
          <p>{SPACE_FACTS[factIndex]}</p>
          <div className="fact-index">{String(factIndex + 1).padStart(2, "0")} / 08</div>
        </div>

        <div className="archive-heading">
          <div>
            <p className="eyebrow">MISSION ARCHIVE</p>
            <h2>Cosmic dispatches</h2>
          </div>
          {status === "success" && (
            <p className="result-count">
              {String(items.length).padStart(2, "0")} TRANSMISSION{items.length === 1 ? "" : "S"}
            </p>
          )}
        </div>

        {status === "idle" && (
          <div className="empty-state">
            <span className="empty-orbit" aria-hidden="true" />
            <p>YOUR MISSION AWAITS</p>
            <h3>Choose a date range to open the archive.</h3>
            <a href="#top">SET MISSION WINDOW ↑</a>
          </div>
        )}

        {status === "loading" && (
          <div className="loading-state" role="status">
            <span className="loader" aria-hidden="true" />
            <p>LOADING SPACE PHOTOS…</p>
            <small>CONTACTING NASA APOD</small>
          </div>
        )}

        {status === "error" && (
          <div className="error-state" role="alert">
            <p>TRANSMISSION INTERRUPTED</p>
            <h3>{message}</h3>
            <button type="button" onClick={() => setStatus("idle")}>
              RESET MISSION
            </button>
          </div>
        )}

        {status === "success" && (
          <div className="gallery">
            {items.map((item, index) => {
              const preview = item.media_type === "video" ? item.thumbnail_url : item.url;
              return (
                <button
                  className="gallery-card"
                  key={`${item.date}-${item.title}`}
                  type="button"
                  onClick={() => openDetails(item)}
                  aria-label={`Open details for ${item.title}, ${formatDate(item.date)}`}
                >
                  <span className="card-media">
                    {preview ? (
                      <img src={preview} alt="" loading={index > 2 ? "lazy" : "eager"} />
                    ) : (
                      <span className="media-fallback">NO PREVIEW</span>
                    )}
                    {item.media_type === "video" && (
                      <span className="video-badge">▶ VIDEO</span>
                    )}
                    <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="card-copy">
                    <span className="card-date">{formatDate(item.date)}</span>
                    <strong>{item.title}</strong>
                    <span className="view-prompt">
                      VIEW TRANSMISSION <span aria-hidden="true">↗</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <footer>
        <div>
          <span className="brand-mark" aria-hidden="true" />
          <strong>SPACE EXPLORER</strong>
        </div>
        <p>
          Built with the{" "}
          <a href="https://api.nasa.gov/" target="_blank" rel="noreferrer">
            NASA Open API
          </a>
          . Educational project; not an official NASA website.
        </p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <article
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close details"
              ref={closeButtonRef}
            >
              <span>CLOSE</span>
              <span aria-hidden="true">×</span>
            </button>

            <div className="modal-media">
              {selected.media_type === "image" ? (
                <img src={selected.hdurl || selected.url} alt={selected.title} />
              ) : isEmbeddableVideo(selected.url) ? (
                <iframe
                  src={selected.url}
                  title={selected.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="video-link-panel">
                  <p>VIDEO TRANSMISSION</p>
                  <a href={selected.url} target="_blank" rel="noreferrer">
                    OPEN NASA VIDEO ↗
                  </a>
                </div>
              )}
            </div>

            <div className="modal-copy">
              <div className="modal-meta">
                <span>{formatDate(selected.date)}</span>
                <span>{selected.media_type.toUpperCase()}</span>
              </div>
              <h2 id="modal-title">{selected.title}</h2>
              {selected.copyright && <p className="copyright">© {selected.copyright}</p>}
              <div className="explanation">
                <span>FIELD NOTES</span>
                <p>{selected.explanation}</p>
              </div>
              <a
                className="source-link"
                href={`https://apod.nasa.gov/apod/ap${selected.date.replaceAll("-", "").slice(2)}.html`}
                target="_blank"
                rel="noreferrer"
              >
                VIEW ORIGINAL APOD ↗
              </a>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
