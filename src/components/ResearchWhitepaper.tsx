import React from 'react';
import { BookOpen, Award, Users, School, ExternalLink, Bookmark } from 'lucide-react';

export const ResearchWhitepaper: React.FC = () => {
  return (
    <article className="max-w-4xl mx-auto space-y-8 rounded-2xl border border-eco-border bg-eco-card p-6 sm:p-10 shadow-2xl">
      {/* Paper Header / Metadata Card */}
      <header className="border-b border-eco-border/80 pb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-eco-teal/15 px-3 py-1 font-mono text-xs font-bold text-eco-teal border border-eco-teal/30">
            <Award className="h-3.5 w-3.5" />
            <span>7th International Youth Summit (IYS)</span>
          </span>
          <span className="rounded-full bg-eco-surface px-3 py-1 font-mono text-xs text-eco-muted border border-eco-border">
            Sub-Theme: Technology
          </span>
          <span className="rounded-full bg-eco-surface px-3 py-1 font-mono text-xs text-eco-muted border border-eco-border">
            Academic Research Paper
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif tracking-tight text-eco-ink leading-tight">
          Eco-Vision Architecture: Mitigating Data Center Resource Consumption Through Local Computer Vision Pre-Processing
        </h1>

        <div className="rounded-xl border border-eco-border/80 bg-eco-surface/60 p-4 space-y-3 font-sans text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-1.5 text-eco-muted font-mono mb-1">
                <Users className="h-3.5 w-3.5 text-eco-teal" />
                <span>Authors & Research Team</span>
              </div>
              <p className="font-semibold text-eco-ink">
                Firza Miftahul Ilmi <span className="text-eco-teal font-normal">(Team Leader)</span>
              </p>
              <p className="text-eco-muted mt-0.5">
                Muhammad Salman, Immanuel Elvando Kenjam, Citra Ayu Setyoningputri
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-eco-muted font-mono mb-1">
                <School className="h-3.5 w-3.5 text-eco-teal" />
                <span>Institutional Affiliation</span>
              </div>
              <p className="font-semibold text-eco-ink">President University</p>
              <p className="text-eco-muted mt-0.5">Faculty of Engineering & Computer Science</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Paper Text */}
      <div className="space-y-8 font-serif text-eco-ink/90 leading-relaxed text-sm sm:text-base">
        {/* Introduction */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-eco-ink flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-eco-teal" />
            <span>1. Introduction</span>
          </h2>
          <p className="text-justify leading-relaxed">
            One camera pointed at a loading dock, streaming 1080p video at 4 megabits per second, generates about 43 gigabytes every day. 
            That is roughly ten feature-length HD films, and for most of the hours it records, the dock is empty. 
            Now multiply by a million cameras. They push 4 terabits per second into the network without pause, close to 16 exabytes a year, 
            and the overwhelming majority of those bits describe a scene that did not change.
          </p>
          <p className="text-justify leading-relaxed">
            Those bits are not free. Each one is encoded at the camera, carried across several network hops, decoded at a facility, 
            written to disk, and passed through a neural network that must find nothing, again and again. 
            The International Energy Agency (IEA, 2025) estimates that data centres consumed about 415 TWh in 2024, around 1.5% of global electricity, 
            after growing roughly 12% a year since 2017, and projects about 945 TWh by 2030. In the United States alone, data centres drew an estimated 
            176 TWh in 2023, or 4.4% of national consumption (Shehabi et al., 2024). The wider ICT sector accounted for about 4% of global electricity 
            and 1.4% of greenhouse gas emissions in 2020, and for networks and data centres the electricity used during operation is the dominant source 
            of those emissions (Malmodin et al., 2024).
          </p>
          <p className="text-justify leading-relaxed">
            Electricity is only one line of the ledger. Every kilowatt-hour that ends up as heat must be removed, and the efficiency of that removal is 
            summarised by power usage effectiveness (PUE), the ratio of total facility energy to the energy that reaches IT equipment. 
            Evaporative cooling turns the heat problem into a water problem, one that Li et al. (2025) show has drawn far less scrutiny than carbon. 
            On the network side, always-on uplink streams saturate access links and cloud ingress long before the cameras become useful.
          </p>
          <p className="text-justify leading-relaxed">
            The prevailing design treats the camera as a passive sensor and the cloud as the only place where understanding happens. 
            It is convenient. It is also wasteful, because video is among the most temporally redundant data people produce: consecutive frames differ by a handful of pixels, and whole hours repeat themselves.
          </p>
          <p className="text-justify leading-relaxed">
            This essay proposes <strong>Eco-Vision Architecture</strong>, a framework that moves temporal redundancy filtering and feature-level pre-processing 
            onto low-power edge hardware sitting beside the camera. Background subtraction, adaptive frame skipping, region-of-interest (ROI) cropping and 
            compact temporal feature extraction decide, locally, what deserves to leave the building. Under the explicit assumptions developed in Section 3.3, 
            the framework cuts upstream traffic by roughly 90% and cloud inference FLOPs by a similar margin. A recall-first design keeps detection accuracy intact, 
            because the cloud model remains the final arbiter of every event the edge flags.
          </p>
        </section>

        {/* Section 3.1 */}
        <section className="space-y-3 border-t border-eco-border/60 pt-6">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-eco-ink">
            3.1 The Unseen Environmental Burden of Centralized Computer Vision Pipelines
          </h2>
          <p className="text-justify leading-relaxed">
            A centralised vision pipeline looks tidy on a whiteboard: camera, network, cloud, result. Its environmental accounting is less tidy, 
            because the cost arrives in stages and each stage is billed to a different party. The camera owner pays for the sensor. 
            The carrier pays for transport. The cloud operator pays for ingest, storage, inference and cooling. Nobody sees the sum, so nobody optimises it.
          </p>
          <p className="text-justify leading-relaxed">
            Inference deserves special attention because it never stops. Patterson et al. (2022) found that machine learning accounted for roughly 
            10% to 15% of Google's total energy use across 2019 to 2021, with inference claiming a larger share than training. 
            A camera network turns that observation into an architecture: the model runs on every frame, every second, whether or not anything happens. 
            The BLOOM study (Luccioni et al., 2023) adds that operational energy tells only part of the story, since equipment manufacturing and idle power 
            roughly doubled the training footprint. Wasteful computation therefore wastes the embodied carbon of the hardware that performs it. 
            Wu et al. (2022) make the broader case that sustainable AI must be judged across its full lifecycle, from data to hardware, and raw video ingestion 
            sits at the very front of that lifecycle.
          </p>
          <p className="text-justify leading-relaxed">
            Transport adds a second layer. Published estimates of energy and carbon intensity per gigabyte differ by more than an order of magnitude 
            depending on system boundaries and grid mix, which is itself a warning that the figure is rarely measured for video. 
            What the literature does establish is that networks and data centres make up a major portion of ICT's operational electricity (Malmodin et al., 2024). 
            Moving 43 gigabytes per camera per day across that infrastructure, mostly to document stillness, consumes capacity that other services need.
          </p>
        </section>

        {/* Section 3.2 */}
        <section className="space-y-3 border-t border-eco-border/60 pt-6">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-eco-ink">
            3.2 The Eco-Vision Paradigm: Mechanics of Local Pre-Processing
          </h2>
          <p className="text-justify leading-relaxed">
            Eco-Vision starts from a simple inversion. Instead of asking the cloud to discover that nothing happened, it asks a small processor 
            beside the lens to establish that fact cheaply and to forward only what survives the test. The pre-processor runs four cooperating stages:
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 font-sans text-xs">
            <div className="rounded-xl border border-eco-border bg-eco-surface/50 p-4 space-y-1">
              <span className="font-mono text-eco-teal font-bold">Stage 1: Background Subtraction</span>
              <p className="text-eco-muted leading-relaxed">
                Maintains a running statistical model at reduced resolution. Absorbs slow lighting drift (dawn light, drifting clouds) without false triggers.
              </p>
            </div>
            <div className="rounded-xl border border-eco-border bg-eco-surface/50 p-4 space-y-1">
              <span className="font-mono text-eco-teal font-bold">Stage 2: Adaptive Frame Skipping</span>
              <p className="text-eco-muted leading-relaxed">
                Activity score drives transmission rate. Idle scenes sample at a trickle with 3s heartbeat keyframes; motion climbs to full speed with 15-frame hysteresis buffer.
              </p>
            </div>
            <div className="rounded-xl border border-eco-border bg-eco-surface/50 p-4 space-y-1">
              <span className="font-mono text-eco-teal font-bold">Stage 3: ROI Cropping</span>
              <p className="text-eco-muted leading-relaxed">
                Connected components in the mask become bounding boxes with safety margins. Only active crops travel upstream at native pixel fidelity.
              </p>
            </div>
            <div className="rounded-xl border border-eco-border bg-eco-surface/50 p-4 space-y-1">
              <span className="font-mono text-eco-teal font-bold">Stage 4: Feature Extraction & Recall-First</span>
              <p className="text-eco-muted leading-relaxed">
                MobileNet int8 on Edge TPU or MCU under 256KB memory (Lin et al., 2022). Tuned for recall: borderline events escalate to cloud for final verification.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3.3 */}
        <section className="space-y-4 border-t border-eco-border/60 pt-6">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-eco-ink">
            3.3 Quantifiable Resource Mitigation and Efficiency Benchmarks
          </h2>
          <p className="text-justify leading-relaxed">
            Claims about efficiency deserve arithmetic. The reference deployment holds one million cameras streaming 1080p H.264 at 4 Mbps around the clock. 
            Scenes contain activity 20% of the time, ROI crops cover half of the frame area on average, and heartbeat keyframes plus metadata add 0.5% of the raw volume. 
            The cloud runs a 50-GFLOP detector at 15 frames per second on accelerators delivering an effective 10 picojoules per FLOP, inside facilities with a PUE of 1.4. 
            Each edge node averages 2 W, and the grid emits 0.45 kg of CO2 per kWh.
          </p>

          {/* Academic Table from Section 3.3 */}
          <div className="rounded-xl border border-eco-border bg-eco-surface/40 overflow-hidden font-sans text-xs">
            <table className="w-full text-left">
              <thead className="border-b border-eco-border bg-eco-surface/90 text-eco-muted font-mono uppercase text-[11px]">
                <tr>
                  <th className="p-3">Metric</th>
                  <th className="p-3">Centralised baseline</th>
                  <th className="p-3">Eco-Vision</th>
                  <th className="p-3 text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eco-border/50 text-eco-ink font-mono">
                <tr>
                  <td className="p-3 font-sans font-semibold">Upstream traffic (1 million cameras)</td>
                  <td className="p-3">4.0 Tbps (15.8 EB/yr)</td>
                  <td className="p-3 text-eco-teal">0.42 Tbps (1.66 EB/yr)</td>
                  <td className="p-3 text-right text-eco-teal font-bold">−89.5%</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-semibold">Cloud inference load</td>
                  <td className="p-3">750 PFLOP/s</td>
                  <td className="p-3 text-eco-teal">75 PFLOP/s</td>
                  <td className="p-3 text-right text-eco-teal font-bold">−90%</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-semibold">Cloud facility energy (PUE 1.4)</td>
                  <td className="p-3">92.0 GWh/yr</td>
                  <td className="p-3 text-eco-teal">9.2 GWh/yr</td>
                  <td className="p-3 text-right text-eco-teal font-bold">−82.8 GWh/yr</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-semibold">Edge node energy (2 W each)</td>
                  <td className="p-3">0</td>
                  <td className="p-3 text-eco-amber">17.5 GWh/yr</td>
                  <td className="p-3 text-right text-eco-amber font-bold">+17.5 GWh/yr</td>
                </tr>
                <tr className="bg-eco-teal/5 font-bold">
                  <td className="p-3 font-sans">Net energy saved</td>
                  <td className="p-3 text-eco-muted">n/a</td>
                  <td className="p-3 text-eco-teal">≈ 65 GWh/yr</td>
                  <td className="p-3 text-right text-eco-teal">65 GWh net gain</td>
                </tr>
                <tr className="bg-eco-teal/5 font-bold">
                  <td className="p-3 font-sans">Net CO2 avoided (0.45 kg/kWh)</td>
                  <td className="p-3 text-eco-muted">n/a</td>
                  <td className="p-3 text-eco-green">≈ 29,400 t/yr</td>
                  <td className="p-3 text-right text-eco-green">Avoided</td>
                </tr>
                <tr className="bg-eco-teal/5 font-bold">
                  <td className="p-3 font-sans">On-site cooling water avoided (0.5 L per IT kWh)</td>
                  <td className="p-3 text-eco-muted">n/a</td>
                  <td className="p-3 text-sky-400">≈ 30 million L/yr</td>
                  <td className="p-3 text-right text-sky-400">Spared</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-justify leading-relaxed">
            Even after charging the full 17.5 GWh of edge consumption against the savings, the deployment avoids about 65 GWh 
            and roughly 29,400 tonnes of CO2 a year. On-site evaporative cooling avoids roughly 30 million liters of water annually.
          </p>
        </section>

        {/* Section 3.4 */}
        <section className="space-y-3 border-t border-eco-border/60 pt-6">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-eco-ink">
            3.4 Youth-Led Implementation Strategy and Scalability
          </h2>
          <p className="text-justify leading-relaxed">
            Deployment will meet resistance in the unglamorous places. Camera fleets are heterogeneous, with different codecs, resolutions and firmware, 
            so the pre-processor should sit on a small companion board reading a standard RTSP stream instead of living inside each camera. 
            Scenes drift with seasons, weather and construction, so background models and thresholds need scheduled recalibration. 
            Edge devices widen the attack surface, which makes signed updates and encrypted uplinks mandatory. 
            Embodied carbon is real too: a 2 W node must stay in service long enough for its savings to repay the emissions of manufacturing it. 
            And crowded scenes erode the benefit, since a busy junction offers little redundancy to remove.
          </p>
          <p className="text-justify leading-relaxed">
            Hardware cost is manageable because the workload is small. Commodity single-board computers and USB-class accelerators retail for tens to low 
            hundreds of US dollars per node, and a node that trims a camera's uplink by nine-tenths can recover that outlay through lower data and cloud bills 
            as well as lower emissions.
          </p>
          <p className="text-justify leading-relaxed">
            This is where young engineers hold an unusual advantage. The core techniques are open, the hardware is cheap, and the evaluation work of measuring 
            energy per gigabyte and per inference on real feeds demands curiosity more than capital. A staged path works best: a single-building pilot to measure 
            the true activity fraction, a campus rollout to test fleet management, then partnerships with local governments and agricultural cooperatives.
          </p>
        </section>

        {/* Conclusion */}
        <section className="space-y-3 border-t border-eco-border/60 pt-6">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-eco-ink flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-eco-teal" />
            <span>4. Conclusion</span>
          </h2>
          <p className="text-justify leading-relaxed">
            The argument of this essay is easy to state and harder to ignore. Video is a profoundly redundant medium, yet centralised pipelines pay for every 
            redundant frame in electricity, cooling water and network capacity. Eco-Vision Architecture refuses that payment at the source. 
            By letting a few watts of local hardware decide what is worth sending, it recasts the camera from a faucet left running into an instrument that speaks 
            only when it has something to say. The model suggests the saving is large, roughly nine-tenths of upstream traffic and cloud computation, 
            and that it survives honest accounting for the energy the edge nodes themselves consume.
          </p>
          <p className="text-justify leading-relaxed">
            The deeper point concerns where intelligence belongs. Not every computation deserves a data centre, and the cheapest kilowatt-hour is the one 
            a well-placed filter never asks for. Choices made while camera networks are still expanding will shape their energy and water demand for years of operation. 
            Build them wastefully and we inherit the bill. Build them with restraint and computer vision can keep growing while staying inside ecological limits. 
            That is the future this architecture aims at, and young engineers are well placed to deliver it.
          </p>
        </section>

        {/* References */}
        <section className="space-y-3 border-t border-eco-border/60 pt-6 font-sans text-xs text-eco-muted">
          <h3 className="font-bold uppercase tracking-wider text-eco-ink flex items-center gap-1.5 font-mono">
            <span>References (APA 7th Edition)</span>
            <ExternalLink className="h-3.5 w-3.5 text-eco-teal" />
          </h3>
          <ul className="space-y-2.5">
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
    </article>
  );
};
