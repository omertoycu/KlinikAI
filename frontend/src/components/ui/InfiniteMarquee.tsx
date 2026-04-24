import { useRef } from "react";

interface InfiniteMarqueeProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  speed?: number; // seconds for one full loop
  className?: string;
}

export default function InfiniteMarquee<T>({
  items,
  renderItem,
  speed = 40,
  className = "",
}: InfiniteMarqueeProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...items, ...items];

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
        onMouseEnter={() => {
          if (trackRef.current) trackRef.current.style.animationPlayState = "paused";
        }}
        onMouseLeave={() => {
          if (trackRef.current) trackRef.current.style.animationPlayState = "running";
        }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex-shrink-0">
            {renderItem(item, i)}
          </div>
        ))}
      </div>
    </div>
  );
}
