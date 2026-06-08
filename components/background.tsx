"use client";

import { useEffect, useState } from "react";

export default function Background() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMove);
      return () => window.removeEventListener("mousemove", handleMove);
    }
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "#0a1628",
          backgroundImage: `
            linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px),
            linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        className="absolute inset-0 transition-transform duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(ellipse 600px 500px at ${15 + mousePos.x * 10}% ${20 + mousePos.y * 10}%, rgba(37,99,235,0.35), transparent 70%),
            radial-gradient(ellipse 500px 600px at ${80 - mousePos.x * 10}% ${70 - mousePos.y * 10}%, rgba(139,92,246,0.25), transparent 70%),
            radial-gradient(ellipse 400px 400px at ${50 + mousePos.x * 5}% ${50 + mousePos.y * 5}%, rgba(6,182,212,0.15), transparent 60%),
            radial-gradient(ellipse 300px 300px at ${30 - mousePos.x * 8}% ${80 + mousePos.y * 8}%, rgba(59,130,246,0.2), transparent 60%),
            radial-gradient(ellipse 500px 400px at ${70 + mousePos.x * 6}% ${30 - mousePos.y * 6}%, rgba(99,102,241,0.15), transparent 60%)
          `,
        }}
      />

      <div
        className="absolute rounded-full blur-3xl animate-float-glow"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)",
          top: "10%",
          left: "20%",
          animationDuration: "12s",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-float-glow"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)",
          top: "60%",
          right: "15%",
          animationDuration: "15s",
          animationDelay: "-3s",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-float-glow"
        style={{
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)",
          top: "40%",
          left: "60%",
          animationDuration: "18s",
          animationDelay: "-6s",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-float-glow"
        style={{
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)",
          bottom: "10%",
          left: "30%",
          animationDuration: "20s",
          animationDelay: "-9s",
        }}
      />
    </div>
  );
}
