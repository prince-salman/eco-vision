import { X, Award, Bookmark, Building } from 'lucide-react';

interface EssayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EssayModal: React.FC<EssayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-eco-border bg-eco-card shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-eco-border bg-eco-surface px-6 py-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-eco-amber" />
            <span className="font-mono text-xs font-semibold text-eco-muted uppercase tracking-wider">
              7th International Youth Summit (IYS) Essay Competition
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-eco-muted hover:bg-eco-card hover:text-eco-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content / Academic Paper Reader */}
        <div className="overflow-y-auto px-6 py-8 sm:px-12 space-y-8 font-serif leading-relaxed text-eco-ink/90">
          {/* Header Title */}
          <div className="border-b border-eco-border/60 pb-6 text-center space-y-3 font-sans">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-eco-teal/15 text-eco-teal border border-eco-teal/30 px-3 py-1 text-xs font-semibold">
              Sub-Theme: Technology
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-eco-ink leading-tight">
              Eco-Vision Architecture: Mitigating Data Center Resource Consumption Through Local Computer Vision Pre-Processing
            </h1>
            <p className="text-xs text-eco-muted font-sans">
              Main Theme: Bridging Ideas and Youth Creativity to Shape Solutions for Tomorrow's Challenges
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-sans text-eco-muted border-t border-eco-border/40 mt-4">
              <div className="flex items-center gap-1.5">
                <Building className="h-4 w-4 text-eco-teal" />
                <span className="font-semibold text-eco-ink">President University</span>
              </div>
              <span>•</span>
              <div>
                <b>Leader:</b> Firza Miftahul Ilmi
              </div>
              <span>•</span>
              <div>
                <b>Team:</b> Muhamad Salman, Immanuel Elvando Kenjam, Citra Ayu Setyoningputri
              </div>
            </div>
          </div>

          {/* Section: Introduction */}
          <section className="space-y-4">
            <h2 className="font-sans text-lg font-bold text-eco-teal tracking-wide flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Introduction</span>
            </h2>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              One camera pointed at a loading dock, streaming 1080p video at 4 megabits per second, generates about 43 gigabytes every day. That is roughly ten feature-length HD films, and for most of the hours it records, the dock is empty. Now multiply by a million cameras. They push 4 terabits per second into the network without pause, close to 16 exabytes a year, and the overwhelming majority of those bits describe a scene that did not change.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Those bits are not free. Each one is encoded at the camera, carried across several network hops, decoded at a facility, written to disk, and passed through a neural network that must find nothing, again and again. The International Energy Agency (IEA, 2025) estimates that data centres consumed about 415 TWh in 2024, around 1.5% of global electricity, after growing roughly 12% a year since 2017, and projects about 945 TWh by 2030. In the United States alone, data centres drew an estimated 176 TWh in 2023, or 4.4% of national consumption (Shehabi et al., 2024). The wider ICT sector accounted for about 4% of global electricity and 1.4% of greenhouse gas emissions in 2020, and for networks and data centres the electricity used during operation is the dominant source of those emissions (Malmodin et al., 2024).
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Electricity is only one line of the ledger. Every kilowatt-hour that ends up as heat must be removed, and the efficiency of that removal is summarised by power usage effectiveness (PUE), the ratio of total facility energy to the energy that reaches IT equipment. Evaporative cooling turns the heat problem into a water problem, one that Li et al. (2025) show has drawn far less scrutiny than carbon. On the network side, always-on uplink streams saturate access links and cloud ingress long before the cameras become useful.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              The prevailing design treats the camera as a passive sensor and the cloud as the only place where understanding happens. It is convenient. It is also wasteful, because video is among the most temporally redundant data people produce: consecutive frames differ by a handful of pixels, and whole hours repeat themselves.
            </p>
            <div className="rounded-xl border-l-4 border-eco-teal bg-eco-surface/80 p-4 font-sans text-xs sm:text-sm text-eco-ink leading-relaxed">
              <b>Thesis Statement:</b> This essay proposes Eco-Vision Architecture, a framework that moves temporal redundancy filtering and feature-level pre-processing onto low-power edge hardware sitting beside the camera. Under explicit assumptions, the framework cuts upstream traffic by roughly 90% and cloud inference FLOPs by a similar margin, while a recall-first design keeps institutional accuracy intact.
            </div>
          </section>

          {/* Section: 3.1 Environmental Burden */}
          <section className="space-y-4">
            <h2 className="font-sans text-lg font-bold text-eco-teal tracking-wide flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>3.1 The Unseen Environmental Burden of Centralized Pipelines</span>
            </h2>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              A centralised vision pipeline looks tidy on a whiteboard: camera, network, cloud, result. Its environmental accounting is less tidy, because the cost arrives in stages and each stage is billed to a different party. The camera owner pays for the sensor. The carrier pays for transport. The cloud operator pays for ingest, storage, inference and cooling. Nobody sees the sum, so nobody optimises it.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Inference deserves special attention because it never stops. Patterson et al. (2022) found that machine learning accounted for roughly 10% to 15% of Google's total energy use across 2019 to 2021, with inference claiming a larger share than training. A camera network turns that observation into an architecture: the model runs on every frame, every second, whether or not anything happens. The BLOOM study (Luccioni et al., 2023) adds that operational energy tells only part of the story, since equipment manufacturing and idle power roughly doubled the training footprint. Wasteful computation therefore wastes the embodied carbon of the hardware that performs it. Wu et al. (2022) make the broader case that sustainable AI must be judged across its full lifecycle, from data to hardware, and raw video ingestion sits at the very front of that lifecycle.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Cooling consumes water as well as power (Li et al., 2025), so a stream of empty frames ends up as litres evaporated in a place that may already be short of them.
            </p>
          </section>

          {/* Section: 3.2 The Eco-Vision Paradigm */}
          <section className="space-y-4">
            <h2 className="font-sans text-lg font-bold text-eco-teal tracking-wide flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>3.2 The Eco-Vision Paradigm: Mechanics of Local Pre-Processing</span>
            </h2>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Eco-Vision starts from a simple inversion. Instead of asking the cloud to discover that nothing happened, it asks a small processor beside the lens to establish that fact cheaply and to forward only what survives the test. The pre-processor runs four cooperating stages:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base font-sans pl-2">
              <li><b>Local background subtraction:</b> Maintains a running statistical model at reduced resolution. The arithmetic costs a few operations per pixel, absorbing slow lighting drift.</li>
              <li><b>Adaptive frame skipping:</b> Evaluates foreground activity. Low score trickles at 1 frame per few seconds with heartbeat keyframes. High score ramps up with hysteresis.</li>
              <li><b>ROI cropping:</b> Connected components become bounding boxes with safety margins. Only active crops travel upstream at native fidelity.</li>
              <li><b>Lightweight temporal feature extraction:</b> Quantized int8 MobileNet on an Edge TPU converts retained crops into compact metadata (Lin et al., 2022; Hu et al., 2023).</li>
            </ul>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Accuracy is protected by design: edge thresholds are tuned for recall rather than precision, so the edge errs toward sending. A false alarm costs a few kilobytes. A missed event costs the system its purpose. That asymmetry dictates the tuning.
            </p>
          </section>

          {/* References */}
          <section className="space-y-3 border-t border-eco-border/60 pt-6 font-sans text-xs text-eco-muted">
            <h3 className="font-bold uppercase tracking-wider text-eco-ink">References</h3>
            <ul className="space-y-1.5">
              <li>• Hu, C., et al. (2023). Edge pre-processing paradigms for video analytics. <i>IEEE Transactions</i>.</li>
              <li>• International Energy Agency (IEA). (2025). <i>Electricity 2025: Analysis and forecast to 2030</i>.</li>
              <li>• Li, P., et al. (2025). Making AI Less Thirsty: Uncovering and Addressing the Secret Water Footprint of AI Models.</li>
              <li>• Lin, J., et al. (2022). On-device training under 256KB memory. <i>NeurIPS 2022</i>.</li>
              <li>• Luccioni, A. S., et al. (2023). Counting carbon: A lifecycle analysis of BLOOM's carbon footprint. <i>ACM FAccT</i>.</li>
              <li>• Malmodin, J., et al. (2024). The electricity consumption and operational carbon footprint of ICT. <i>Telecommunications Policy</i>.</li>
              <li>• Patterson, D., et al. (2022). Carbon Emissions and Large Neural Network Training. <i>Computer</i>.</li>
              <li>• Shehabi, A., et al. (2024). United States Data Center Energy Usage Report. <i>LBNL</i>.</li>
              <li>• Wu, C. J., et al. (2022). Sustainable AI: Environmental Implications, Challenges and Opportunities. <i>MLSys</i>.</li>
            </ul>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-eco-border bg-eco-surface px-6 py-4">
          <span className="text-xs font-mono text-eco-muted">
            President University • 7th IYS Essay Competition
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-eco-teal px-4 py-2 text-xs font-bold text-eco-bg hover:bg-eco-emerald transition-colors"
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
};
