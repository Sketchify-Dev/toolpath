"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Rise({
  children,
  index = 0,
  className = "",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 460ms cubic-bezier(0.23,1,0.32,1), transform 460ms cubic-bezier(0.23,1,0.32,1)`,
        transitionDelay: `${Math.min(index, 4) * 70}ms`,
      }}
    >
      {children}
    </div>
  );
}
