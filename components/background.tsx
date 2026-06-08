"use client";

export default function Background() {
  const particles = Array.from({ length: 50 }, (_, i) => {
    const seed = i * 13.7;
    return {
      id: i,
      left: (seed * 1.3) % 100,
      top: (seed * 0.7 + 23) % 100,
      size: 1.5 + (i % 3),
      delay: (seed * 0.37) % 10,
      duration: 12 + (i % 9) * 2,
      drift: i % 2 === 0 ? "left" : "right",
      opacity: 0.25 + (i % 5) * 0.15,
      glow: i % 8 === 0,
    };
  });

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "#0a1628",
          backgroundImage: `
            linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px),
            linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 20% 30%, rgba(37,99,235,0.12), transparent 70%),
            radial-gradient(ellipse 600px 700px at 80% 70%, rgba(139,92,246,0.08), transparent 70%),
            radial-gradient(ellipse 400px 400px at 50% 50%, rgba(6,182,212,0.05), transparent 60%)
          `,
        }}
      />

      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.glow ? "particle-glow" : ""}`}
          style={{
            width: p.size + "px",
            height: p.size + "px",
            left: p.left + "%",
            top: p.top + "%",
            opacity: p.opacity,
            background: p.glow
              ? "radial-gradient(circle, rgba(147,197,253,0.9), rgba(59,130,246,0.4))"
              : "rgba(147,197,253,0.5)",
            animation: `particle-${p.drift} ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
