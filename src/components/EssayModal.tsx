import React from 'react';
import { X, Award, Bookmark, Building, ExternalLink, Users } from 'lucide-react';

interface EssayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EssayModal: React.FC<EssayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-eco-border bg-eco-card shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-eco-border bg-eco-surface px-6 py-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-eco-amber" />
            <span className="font-mono text-xs font-semibold text-eco-muted uppercase tracking-wider">
              7th International Youth Summit (IYS) Essay Competition • Complete Paper
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
              Main Theme: Bridging Ideas and Youth Creativity to Shape Solutions for Tomorrow’s Challenges
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
                <b>Team:</b> Muhammad Salman, Immanuel Elvando Kenjam, Citra Ayu Setyoningputri
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
              <b>Core Proposal:</b> This essay proposes Eco-Vision Architecture, a framework that moves temporal redundancy filtering and feature-level pre-processing onto low-power edge hardware sitting beside the camera. Background subtraction, adaptive frame skipping, region-of-interest (ROI) cropping and compact temporal feature extraction decide, locally, what deserves to leave the building. Under explicit assumptions, the framework cuts upstream traffic by roughly 90% and cloud inference FLOPs by a similar margin. A recall-first design keeps detection accuracy intact, because the cloud model remains the final arbiter of every event the edge flags.
            </div>
          </section>

          {/* Section: 3.1 Environmental Burden */}
          <section className="space-y-4">
            <h2 className="font-sans text-lg font-bold text-eco-teal tracking-wide flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>3.1 The Unseen Environmental Burden of Centralized Computer Vision Pipelines</span>
            </h2>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              A centralised vision pipeline looks tidy on a whiteboard: camera, network, cloud, result. Its environmental accounting is less tidy, because the cost arrives in stages and each stage is billed to a different party. The camera owner pays for the sensor. The carrier pays for transport. The cloud operator pays for ingest, storage, inference and cooling. Nobody sees the sum, so nobody optimises it.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Inference deserves special attention because it never stops. Patterson et al. (2022) found that machine learning accounted for roughly 10% to 15% of Google's total energy use across 2019 to 2021, with inference claiming a larger share than training. A camera network turns that observation into an architecture: the model runs on every frame, every second, whether or not anything happens. The BLOOM study (Luccioni et al., 2023) adds that operational energy tells only part of the story, since equipment manufacturing and idle power roughly doubled the training footprint. Wasteful computation therefore wastes the embodied carbon of the hardware that performs it. Wu et al. (2022) make the broader case that sustainable AI must be judged across its full lifecycle, from data to hardware, and raw video ingestion sits at the very front of that lifecycle.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Transport adds a second layer. Published estimates of energy and carbon intensity per gigabyte differ by more than an order of magnitude depending on system boundaries and grid mix, which is itself a warning that the figure is rarely measured for video. What the literature does establish is that networks and data centres make up a major portion of ICT's operational electricity (Malmodin et al., 2024). Moving 43 gigabytes per camera per day across that infrastructure, mostly to document stillness, consumes capacity that other services need.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Then comes overload. The IEA (2025) notes that a typical AI-focused data centre draws as much electricity as 100,000 households, and that the largest facilities now under construction will draw twenty times that. Local grids and aquifers feel this long before global averages move. Cooling consumes water as well as power (Li et al., 2025), so a stream of empty frames ends up as litres evaporated in a place that may already be short of them.
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
            <div className="space-y-3 font-sans text-xs sm:text-sm">
              <div className="rounded-lg border border-eco-border bg-eco-surface/50 p-3">
                <b className="text-eco-teal">1. Local background subtraction:</b> Maintains a running statistical model of the static scene, such as a per-pixel Gaussian mixture or an exponentially weighted average, at reduced resolution. The arithmetic costs a few operations per pixel, absorbing slow lighting drift (dawn, shadows) without false alarms.
              </div>
              <div className="rounded-lg border border-eco-border bg-eco-surface/50 p-3">
                <b className="text-eco-emerald">2. Adaptive frame skipping:</b> Converts the mask into an activity score. When score is low, sampling drops to a trickle with periodic heartbeat keyframes (3s). When motion crosses the threshold, rate climbs to full speed with a hysteresis window so opening/closing frames are never clipped.
              </div>
              <div className="rounded-lg border border-eco-border bg-eco-surface/50 p-3">
                <b className="text-eco-amber">3. ROI cropping:</b> Discards static walls and floors. Connected components become bounding boxes with a safety margin, sending only active crops upstream at native 1080p resolution.
              </div>
              <div className="rounded-lg border border-eco-border bg-eco-surface/50 p-3">
                <b className="text-eco-teal">4. Lightweight temporal feature extraction:</b> A quantized int8 network of the MobileNet class runs on an Edge TPU, outputting compact metadata tags (embeddings, class labels, track IDs) per event (Lin et al., 2022; Hu et al., 2023).
              </div>
            </div>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Accuracy is protected by design, not by hope. Edge thresholds are tuned for recall rather than precision, so the edge errs toward sending. A false alarm costs a few kilobytes. A missed event costs the system its purpose. That asymmetry dictates the tuning.
            </p>
          </section>

          {/* Section: 3.3 Resource Mitigation & Benchmarks */}
          <section className="space-y-4">
            <h2 className="font-sans text-lg font-bold text-eco-teal tracking-wide flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>3.3 Quantifiable Resource Mitigation and Efficiency Benchmarks</span>
            </h2>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              To evaluate the potential of Eco-Vision, consider a concrete benchmark: one million cameras recording 1080p video at 4 Mbps and 15 frames per second. Cloud inference applies a 50-GFLOP detector to each frame. The baseline IT energy assumes 10 pJ per FLOP, a data centre PUE of 1.4, an edge node drawing 2 W, grid carbon intensity of 0.45 kg CO₂ per kWh, and on-site cooling water of 0.5 L per IT kWh. Scene activity averages 20% of the time, and during active periods the region of interest occupies 50% of the frame.
            </p>

            <div className="rounded-xl border border-eco-border bg-eco-surface/60 overflow-hidden font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-eco-border bg-eco-surface text-eco-muted uppercase">
                    <th className="py-2.5 px-3">Metric</th>
                    <th className="py-2.5 px-3 text-right">Centralised</th>
                    <th className="py-2.5 px-3 text-right">Eco-Vision</th>
                    <th className="py-2.5 px-3 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-eco-border/40">
                  <tr><td className="py-2 px-3 font-sans">Upstream traffic (1M cams)</td><td className="py-2 px-3 text-right">4.0 Tbps (15.8 EB/yr)</td><td className="py-2 px-3 text-right font-semibold">0.42 Tbps (1.66 EB/yr)</td><td className="py-2 px-3 text-right text-eco-emerald font-bold">−89.5%</td></tr>
                  <tr><td className="py-2 px-3 font-sans">Cloud inference load</td><td className="py-2 px-3 text-right">750 PFLOP/s</td><td className="py-2 px-3 text-right font-semibold">75 PFLOP/s</td><td className="py-2 px-3 text-right text-eco-emerald font-bold">−90%</td></tr>
                  <tr><td className="py-2 px-3 font-sans">Cloud facility energy (PUE 1.4)</td><td className="py-2 px-3 text-right">92.0 GWh/yr</td><td className="py-2 px-3 text-right font-semibold">9.2 GWh/yr</td><td className="py-2 px-3 text-right text-eco-emerald font-bold">−82.8 GWh/yr</td></tr>
                  <tr><td className="py-2 px-3 font-sans">Edge node energy (2 W each)</td><td className="py-2 px-3 text-right">0</td><td className="py-2 px-3 text-right font-semibold">17.5 GWh/yr</td><td className="py-2 px-3 text-right text-eco-amber font-bold">+17.5 GWh/yr</td></tr>
                  <tr className="bg-eco-teal/5"><td className="py-2 px-3 font-sans font-bold text-eco-teal">Net energy saved</td><td className="py-2 px-3 text-right">n/a</td><td className="py-2 px-3 text-right">n/a</td><td className="py-2 px-3 text-right text-eco-teal font-bold">≈ 65 GWh/yr</td></tr>
                  <tr className="bg-eco-teal/5"><td className="py-2 px-3 font-sans font-bold text-eco-teal">Net CO₂ avoided (0.45 kg/kWh)</td><td className="py-2 px-3 text-right">n/a</td><td className="py-2 px-3 text-right">n/a</td><td className="py-2 px-3 text-right text-eco-teal font-bold">≈ 29,400 t/yr</td></tr>
                  <tr className="bg-eco-teal/5"><td className="py-2 px-3 font-sans font-bold text-eco-teal">Cooling water avoided (0.5 L/kWh)</td><td className="py-2 px-3 text-right">n/a</td><td className="py-2 px-3 text-right">n/a</td><td className="py-2 px-3 text-right text-eco-teal font-bold">≈ 30 million L/yr</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Even after charging the full 17.5 GWh of edge consumption against the savings, the deployment avoids about <b>65 GWh</b> and roughly <b>29,400 tonnes of CO₂</b> a year.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              PUE deserves a careful reading: as a ratio, it barely moves when IT load falls proportionally. The gain shows up in absolute facility energy and in the water that cooling consumes. At 0.01 to 0.03 kWh per gigabyte, 89.5% less traffic would also avoid roughly 141 to 424 GWh a year across network transit infrastructure.
            </p>
          </section>

          {/* Section: 3.4 Youth-Led Strategy */}
          <section className="space-y-4">
            <h2 className="font-sans text-lg font-bold text-eco-teal tracking-wide flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>3.4 Youth-Led Implementation Strategy and Scalability</span>
            </h2>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Deployment will meet resistance in the unglamorous places. Camera fleets are heterogeneous, with different codecs, resolutions and firmware, so the pre-processor should sit on a small companion board reading a standard RTSP stream instead of living inside each camera. Scenes drift with seasons, weather and construction, so background models and thresholds need scheduled recalibration. Edge devices widen the attack surface, which makes signed updates and encrypted uplinks mandatory. Embodied carbon is real too: a 2 W node must stay in service long enough for its savings to repay the emissions of manufacturing it.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              Hardware cost is manageable because the workload is small. Commodity single-board computers and USB-class accelerators retail for tens to low hundreds of US dollars per node, and a node that trims a camera's uplink by nine-tenths can recover that outlay through lower data and cloud bills as well as lower emissions.
            </p>
            <div className="rounded-xl border border-eco-teal/30 bg-eco-teal/10 p-4 font-sans text-xs sm:text-sm text-eco-ink leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-eco-teal">
                <Users className="h-4 w-4" />
                <span>The Youth Advantage:</span>
              </div>
              <p>
                This is where young engineers hold an unusual advantage. The core techniques are open, the hardware is cheap, and the evaluation work of measuring energy per gigabyte and per inference on real feeds demands curiosity more than capital. Students can build an open reference implementation, publish reproducible benchmarks on campus or farm camera networks, and hand municipal IT teams a tested starting point instead of a slide deck. A staged path works best: a single-building pilot to measure the true activity fraction, a campus rollout to test fleet management, then partnerships with local governments and agricultural cooperatives whose cameras watch fields, greenhouses and storage sheds through long, quiet hours.
              </p>
            </div>
          </section>

          {/* Section: Conclusion */}
          <section className="space-y-4">
            <h2 className="font-sans text-lg font-bold text-eco-teal tracking-wide flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Conclusion</span>
            </h2>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              The argument of this essay is easy to state and harder to ignore. Video is a profoundly redundant medium, yet centralised pipelines pay for every redundant frame in electricity, cooling water and network capacity. Eco-Vision Architecture refuses that payment at the source. By letting a few watts of local hardware decide what is worth sending, it recasts the camera from a faucet left running into an instrument that speaks only when it has something to say. The model suggests the saving is large, roughly nine-tenths of upstream traffic and cloud computation, and that it survives honest accounting for the energy the edge nodes themselves consume.
            </p>
            <p className="text-justify text-sm sm:text-base leading-relaxed">
              The deeper point concerns where intelligence belongs. Not every computation deserves a data centre, and the cheapest kilowatt-hour is the one a well-placed filter never asks for. Choices made while camera networks are still expanding will shape their energy and water demand for years of operation. Build them wastefully and we inherit the bill. Build them with restraint and computer vision can keep growing while staying inside ecological limits. That is the future this architecture aims at, and young engineers are well placed to deliver it.
            </p>
          </section>

          {/* Complete Academic References */}
          <section className="space-y-3 border-t border-eco-border/60 pt-6 font-sans text-xs text-eco-muted">
            <h3 className="font-bold uppercase tracking-wider text-eco-ink flex items-center gap-1.5">
              <span>References (APA 7th Edition)</span>
              <ExternalLink className="h-3.5 w-3.5 text-eco-teal" />
            </h3>
            <ul className="space-y-2">
              <li className="pl-4 -indent-4">• Hu, M., Luo, Z., Pasdar, A., Lee, Y. C., Zhou, Y., & Wu, D. (2023). Edge-based video analytics: A survey. <i>arXiv</i>. https://arxiv.org/abs/2303.14329</li>
              <li className="pl-4 -indent-4">• International Energy Agency (IEA). (2025). <i>Energy and AI</i>. IEA. https://www.iea.org/reports/energy-and-ai</li>
              <li className="pl-4 -indent-4">• Li, P., Yang, J., Islam, M. A., & Ren, S. (2025). Making AI less “thirsty”: Uncovering and addressing the secret water footprint of AI models (arXiv:2304.03271v5). <i>arXiv</i>. https://arxiv.org/abs/2304.03271</li>
              <li className="pl-4 -indent-4">• Lin, J., Zhu, L., Chen, W.-M., Wang, W.-C., Gan, C., & Han, S. (2022). On-device training under 256KB memory. <i>Advances in Neural Information Processing Systems (NeurIPS)</i>, 35, 22941–22954.</li>
              <li className="pl-4 -indent-4">• Luccioni, A. S., Viguier, S., & Ligozat, A.-L. (2023). Estimating the carbon footprint of BLOOM, a 176B parameter language model. <i>Journal of Machine Learning Research (JMLR)</i>, 24(253), 1–15.</li>
              <li className="pl-4 -indent-4">• Malmodin, J., Lövehagen, N., Bergmark, P., & Lundén, D. (2024). ICT sector electricity consumption and greenhouse gas emissions – 2020 outcome. <i>Telecommunications Policy</i>, 48(3), Article 102701. https://doi.org/10.1016/j.telpol.2023.102701</li>
              <li className="pl-4 -indent-4">• Patterson, D., Gonzalez, J., Hölzle, U., Le, Q., Liang, C., Munguia, L.-M., Rothchild, D., So, D. R., Texier, M., & Dean, J. (2022). The carbon footprint of machine learning training will plateau, then shrink. <i>Computer</i>, 55(7), 18–28. https://doi.org/10.1109/MC.2022.3148714</li>
              <li className="pl-4 -indent-4">• Shehabi, A., Smith, S. J., Hubbard, A., Newkirk, A., Lei, N., Siddik, M. A. B., Holecek, B., Koomey, J., Masanet, E., & Sartor, D. (2024). <i>2024 United States data center energy usage report</i> (LBNL-2001637). Lawrence Berkeley National Laboratory. https://doi.org/10.71468/P1WC7Q</li>
              <li className="pl-4 -indent-4">• Wu, C.-J., Raghavendra, R., Gupta, U., Acun, B., Ardalani, N., Maeng, K., Chang, G., Aga, F., Huang, J., Bai, C., Gschwind, M., Gupta, A., Ott, M., Melnikov, A., Candido, S., Brooks, D., Chauhan, G., Lee, B., Lee, H.-H. S., … Hazelwood, K. (2022). Sustainable AI: Environmental implications, challenges and opportunities. <i>Proceedings of Machine Learning and Systems (MLSys)</i>, 4, 795–813.</li>
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
