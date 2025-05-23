import { Disc3 } from "lucide-react";

export default function Loading() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.14))] text-primary">
      <Disc3 className="h-24 w-24 animate-spinning-disc" />
      <p className="mt-4 text-lg font-semibold text-muted-foreground">
        Cueing up the next track...
      </p>
      <div className="absolute bottom-0 left-0 w-full h-1.5 overflow-hidden">
        <div
          className="h-full animate-fake-progress-bar"
          style={{
            backgroundImage: `linear-gradient(90deg, 
              transparent 0%, 
              hsl(var(--primary-h) var(--primary-s) calc(var(--primary-l) + 20%)) 25%, 
              hsl(var(--primary)) 50%, 
              hsl(var(--primary-h) var(--primary-s) calc(var(--primary-l) + 20%)) 75%, 
              transparent 100%)`,
            backgroundSize: '200% 100%', // Gradient is twice as wide as the container to allow it to sweep across
          }}
        />
      </div>
    </div>
  );
}
