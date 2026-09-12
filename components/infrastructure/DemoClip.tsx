interface DemoClipProps { name: string; caption: string; className?: string; }
export function DemoClip({ name, caption, className }: DemoClipProps) {
  const base = `/demos/${name}`;
  return (
    <figure className={`border border-terminal-border bg-terminal-bg text-terminal-text ${className ?? ""}`}>
      <div className="px-8 py-3 border-b border-terminal-border">
        <span className="text-xs font-mono text-terminal-text/60">{caption} · recorded, unedited</span>
      </div>
      <video className="w-full block" autoPlay loop muted playsInline preload="metadata" poster={`${base}.gif`} aria-label={caption}>
        <source src={`${base}.mp4`} type="video/mp4" />
        <img src={`${base}.gif`} alt={caption} className="w-full block" />
      </video>
    </figure>
  );
}
