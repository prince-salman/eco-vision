import { useState } from 'react';
import { Eye, FastForward, Crop, Cpu, CheckCircle2 } from 'lucide-react';

interface StageInfo {
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  summary: string;
  math: string;
  benefits: string[];
  essayQuote: string;
}

const STAGES: StageInfo[] = [
  {
    number: '01',
    title: 'Local Background Subtraction',
    subtitle: 'Adaptive Statistical Scene Modeling',
    icon: <Eye className="h-5 w-5 text-eco-teal" />,
    summary: 'Maintains a running statistical model of the background scene at reduced resolution directly on low-power edge silicon. Pixels that significantly deviate from the model emerge as the foreground mask.',
    math: 'B_t(x, y) = (1 - α) · B_{t-1}(x, y) + α · I_t(x, y)',
    benefits: [
      'Absorbs slow lighting drift (dawn, shadows, clouds) without false triggers',
      'Costs only a few FLOPs per pixel, running smoothly on microcontroller-class hardware',
      'Filters out high-frequency camera sensor noise'
    ],
    essayQuote: 'The arithmetic costs a few operations per pixel, which keeps it within reach of microcontroller-class silicon. Slow changes such as dawn light or drifting shadows are absorbed into the model instead of being flagged.'
  },
  {
    number: '02',
    title: 'Adaptive Frame Skipping',
    subtitle: 'Hysteresis Window & Heartbeat Throttling',
    icon: <FastForward className="h-5 w-5 text-eco-emerald" />,
    summary: 'Converts the foreground mask into an activity score. When the scene is still, transmission drops to near zero with periodic heartbeat keyframes. When motion occurs, transmission climbs to full rate.',
    math: 'Activity = Σ(Foreground_Pixels) / Total_Pixels; Hysteresis = 15 frames',
    benefits: [
      'Eliminates up to 90% of empty frames that dominate security footage',
      'Hysteresis buffer guarantees opening and closing frames of an event are never clipped',
      'Periodic heartbeat keyframe (every 3s) verifies sensor health and link integrity'
    ],
    essayQuote: 'When the score is low, the system samples at a trickle... When the score crosses a threshold, the rate climbs to full speed and holds there through a hysteresis window... This is bandwidth throttling driven by content rather than congestion.'
  },
  {
    number: '03',
    title: 'ROI Bounding Box Cropping',
    subtitle: 'Selective Full-Resolution Transmission',
    icon: <Crop className="h-5 w-5 text-eco-amber" />,
    summary: 'Discards static walls, floors, and empty space. Connected components in the foreground mask form bounding boxes with a safety margin, sending only active crops upstream at native fidelity.',
    math: 'ROI = [x_min - pad, y_min - pad, w + 2·pad, h + 2·pad]',
    benefits: [
      'Preserves crystal-clear facial and license plate detail inside the ROI',
      'Avoids the loss of detail caused by uniform video downscaling',
      'Reduces pixel payload by 50% to 90% even during active moments'
    ],
    essayQuote: 'Connected components in the foreground mask become bounding boxes with a safety margin, and only those crops travel upstream at native resolution. The approach keeps detail exactly where it matters, unlike uniform downscaling that blurs the whole frame.'
  },
  {
    number: '04',
    title: 'Lightweight Feature Extraction',
    subtitle: 'On-Device MobileNet & Recall-First Tuning',
    icon: <Cpu className="h-5 w-5 text-eco-teal" />,
    summary: 'A quantized int8 neural network runs on a low-power Edge TPU or MCU, converting crops into compact embeddings, class labels, and track IDs before transmitting metadata packets.',
    math: 'Payload: JSON Metadata (~200 B) + Keyframe only on escalation',
    benefits: [
      'Tuned for 100% recall so questionable events escalate to the cloud model',
      'Transmits compact structured telemetry instead of megabytes of video',
      'Cloud acts as final arbiter, maintaining institutional detection accuracy'
    ],
    essayQuote: 'Edge thresholds are tuned for recall rather than precision, so the edge errs toward sending... A false alarm costs a few kilobytes. A missed event costs the system its purpose. That asymmetry dictates the tuning.'
  }
];

export const ArchitectureStages: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(0);

  const stage = STAGES[selectedStage];

  return (
    <div className="space-y-6 rounded-2xl border border-eco-border bg-eco-card p-6 shadow-xl">
      <div>
        <h2 className="text-xl font-bold font-serif text-eco-ink tracking-tight flex items-center gap-2">
          <span>The Eco-Vision 4-Stage Edge Pipeline</span>
          <span className="rounded-full bg-eco-teal/10 text-eco-teal border border-eco-teal/30 px-2.5 py-0.5 text-xs font-mono font-semibold">
            Mechanics of Local Pre-Processing
          </span>
        </h2>
        <p className="text-xs text-eco-muted mt-1 max-w-2xl">
          Section 3.2 of the essay outlines an inversion: establish stillness cheaply beside the lens, 
          and forward only the data that survives the test.
        </p>
      </div>

      {/* Stage Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STAGES.map((s, idx) => {
          const isSelected = selectedStage === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedStage(idx)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-eco-teal bg-eco-teal/10 shadow-md shadow-eco-teal/5'
                  : 'border-eco-border bg-eco-surface/50 hover:bg-eco-surface hover:border-eco-border/80'
              }`}
            >
              <div className={`rounded-lg p-2 shrink-0 ${isSelected ? 'bg-eco-teal text-eco-bg' : 'bg-eco-card text-eco-muted'}`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-eco-teal">{s.number}</span>
                  <span className="text-xs font-semibold text-eco-ink truncate">{s.title}</span>
                </div>
                <p className="text-[11px] text-eco-muted truncate mt-0.5">{s.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="rounded-xl border border-eco-border/80 bg-eco-surface/60 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-eco-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-eco-teal">{stage.number}.</span>
            <h3 className="text-base font-bold text-eco-ink">{stage.title}</h3>
            <span className="text-xs text-eco-muted">({stage.subtitle})</span>
          </div>

          <div className="rounded-md bg-eco-card px-2.5 py-1 font-mono text-[11px] text-eco-teal border border-eco-border">
            {stage.math}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-eco-ink/90">
          {stage.summary}
        </p>

        {/* Benefits list */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-eco-muted">
            Key Advantages & Architectural Rationale:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stage.benefits.map((b, bIdx) => (
              <div key={bIdx} className="flex items-start gap-2 rounded-lg border border-eco-border/40 bg-eco-card/60 p-3 text-xs text-eco-ink/90">
                <CheckCircle2 className="h-4 w-4 text-eco-teal shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote from essay */}
        <div className="rounded-lg border-l-2 border-eco-teal bg-eco-card/80 p-3 text-xs italic text-eco-muted">
          "{stage.essayQuote}"
          <span className="block mt-1 font-mono text-[10px] text-eco-muted not-italic">
            — Section 3.2, Eco-Vision Architecture Essay
          </span>
        </div>
      </div>
    </div>
  );
};
