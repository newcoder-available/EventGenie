"use client";

/**
 * Last-resort boundary, for a failure in the root layout itself.
 *
 * It replaces <html>, so it cannot use the app's providers, fonts or
 * stylesheet — hence the inline styles. Keeping it dependency-free is the
 * point: this is the page that has to render when nothing else can.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#faf7f2",
          color: "#29242a",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>EventGenie could not start</h1>
          <p style={{ color: "#77717a", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Your plan is saved in this browser and has not been affected.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.6rem 1.1rem",
              borderRadius: 8,
              border: "none",
              background: "#8f3150",
              color: "#fff",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
