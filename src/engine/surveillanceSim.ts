/**
 * Eco-Vision Architecture - Realistic CCTV Surveillance Scene Generator
 * Generates photorealistic surveillance camera feeds for multiple scenarios:
 * 1. Industrial Logistics Loading Dock (Forklift & Delivery Van)
 * 2. Data Center Server Corridor (Authorized Personnel Walking)
 * 3. Campus Main Checkpoint Gate (Vehicles & Boom Barrier)
 * 4. Night Vision Perimeter (IR Phosphor & Thermal Signature)
 * 5. Interactive Synthetic Target (Spawned on Mouse Click/Drag)
 */

export type SurveillanceScenario = 
  | 'warehouse_dock'
  | 'server_corridor'
  | 'campus_gate'
  | 'night_perimeter';

export interface ScenarioMeta {
  id: SurveillanceScenario;
  title: string;
  cameraName: string;
  location: string;
  defaultActivePct: number;
  description: string;
}

export const SCENARIO_PRESETS: ScenarioMeta[] = [
  {
    id: 'warehouse_dock',
    title: 'Loading Dock Alpha',
    cameraName: 'CAM 01 - LOGISTICS DOCK',
    location: 'Warehouse Logistics Bay 04 East',
    defaultActivePct: 20,
    description: 'Forklift and delivery van intermittent arrivals (~20% activity). Long periods of still background.'
  },
  {
    id: 'server_corridor',
    title: 'Server Vault Corridor',
    cameraName: 'CAM 02 - VAULT CORRIDOR',
    location: 'High-Density Rack Row B',
    defaultActivePct: 10,
    description: 'Data center technician walking past server racks (~10% activity). Reflective floor and blinking LEDs.'
  },
  {
    id: 'campus_gate',
    title: 'Campus Entrance Gate',
    cameraName: 'CAM 03 - MAIN GATE',
    location: 'President University Checkpoint Delta',
    defaultActivePct: 35,
    description: 'Vehicle checkpoint with boom barrier and occasional pedestrian (~35% activity).'
  },
  {
    id: 'night_perimeter',
    title: 'Perimeter Fence (Night IR)',
    cameraName: 'CAM 04 - NORTH PERIMETER',
    location: 'Security Fence Boundary Charlie',
    defaultActivePct: 5,
    description: 'High-stillness night vision with infrared illumination and phosphor noise (~5% activity).'
  }
];

export interface InteractiveTarget {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label: string;
  active: boolean;
  spawnTime: number;
}

export class SurveillanceSimulator {
  private interactiveTarget: InteractiveTarget | null = null;

  public setInteractiveTarget(x: number, y: number, label: string = 'Injected Target') {
    this.interactiveTarget = {
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: 24,
      label,
      active: true,
      spawnTime: performance.now()
    };
  }

  public clearInteractiveTarget() {
    this.interactiveTarget = null;
  }

  public updateInteractiveTarget(width: number, height: number) {
    if (!this.interactiveTarget || !this.interactiveTarget.active) return;
    const t = this.interactiveTarget;
    t.x += t.vx;
    t.y += t.vy;

    // Bounce within canvas boundaries
    if (t.x < t.radius) { t.x = t.radius; t.vx *= -1; }
    if (t.x > width - t.radius) { t.x = width - t.radius; t.vx *= -1; }
    if (t.y < t.radius + 40) { t.y = t.radius + 40; t.vy *= -1; }
    if (t.y > height - t.radius - 20) { t.y = height - t.radius - 20; t.vy *= -1; }

    // Auto-decay after 15 seconds if not touched
    if (performance.now() - t.spawnTime > 15000) {
      t.active = false;
    }
  }

  /**
   * Main scene rendering entry point
   */
  public renderScene(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeSec: number,
    scenario: SurveillanceScenario,
    nightMode: boolean
  ) {
    ctx.save();

    // 1. Draw static background
    switch (scenario) {
      case 'warehouse_dock':
        this.drawWarehouseBackground(ctx, width, height, nightMode);
        this.drawWarehouseMovingObjects(ctx, width, height, timeSec, nightMode);
        break;
      case 'server_corridor':
        this.drawServerCorridorBackground(ctx, width, height, timeSec, nightMode);
        this.drawServerCorridorMovingObjects(ctx, width, height, timeSec, nightMode);
        break;
      case 'campus_gate':
        this.drawCampusGateBackground(ctx, width, height, nightMode);
        this.drawCampusGateMovingObjects(ctx, width, height, timeSec, nightMode);
        break;
      case 'night_perimeter':
        this.drawNightPerimeterBackground(ctx, width, height, timeSec);
        this.drawNightPerimeterMovingObjects(ctx, width, height, timeSec);
        break;
    }

    // 2. Render injected interactive target if active
    if (this.interactiveTarget && this.interactiveTarget.active) {
      this.drawInjectedTarget(ctx, this.interactiveTarget, nightMode);
    }

    // 3. Render realistic Surveillance Camera OSD HUD
    this.drawCameraOSD(ctx, width, height, scenario, nightMode);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // Scenario 1: Industrial Loading Dock
  // -------------------------------------------------------------
  private drawWarehouseBackground(ctx: CanvasRenderingContext2D, w: number, h: number, night: boolean) {
    // Back wall
    ctx.fillStyle = night ? '#0a100d' : '#1c262c';
    ctx.fillRect(0, 0, w, h * 0.65);

    // Concrete floor with perspective grid
    const floorGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
    floorGrad.addColorStop(0, night ? '#0d1612' : '#222f36');
    floorGrad.addColorStop(1, night ? '#111d17' : '#2a3a42');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Metal Bay Doors
    const doorW = w * 0.28;
    const doorH = h * 0.48;
    const doors = [w * 0.08, w * 0.64];

    doors.forEach((dx, i) => {
      // Door frame
      ctx.fillStyle = night ? '#060a08' : '#12191d';
      ctx.fillRect(dx - 4, h * 0.17 - 4, doorW + 8, doorH + 8);

      // Roll-up door horizontal slats
      ctx.fillStyle = night ? '#09120e' : '#162025';
      ctx.fillRect(dx, h * 0.17, doorW, doorH);

      ctx.strokeStyle = night ? '#0d1813' : '#1f2d33';
      ctx.lineWidth = 1;
      for (let y = h * 0.17; y < h * 0.65; y += 12) {
        ctx.beginPath();
        ctx.moveTo(dx, y);
        ctx.lineTo(dx + doorW, y);
        ctx.stroke();
      }

      // Bay door number badge
      ctx.fillStyle = night ? 'rgba(0,255,100,0.3)' : 'rgba(245,158,11,0.6)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`BAY 0${i + 1}`, dx + 10, h * 0.22);
    });

    // Yellow & Black Safety Stripes on Dock Edge
    const stripeH = 8;
    const stripeY = h * 0.65 - stripeH;
    for (let x = 0; x < w; x += 16) {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x, stripeY, 8, stripeH);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 8, stripeY, 8, stripeH);
    }

    // Stacked Pallets and Boxes in background
    ctx.fillStyle = night ? '#101a14' : '#283840';
    ctx.fillRect(w * 0.40, h * 0.45, 60, 45);
    ctx.fillRect(w * 0.44, h * 0.32, 45, 30);
    ctx.strokeStyle = night ? '#15241b' : '#334852';
    ctx.strokeRect(w * 0.40, h * 0.45, 60, 45);
    ctx.strokeRect(w * 0.44, h * 0.32, 45, 30);
  }

  private drawWarehouseMovingObjects(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    night: boolean
  ) {
    // 12-second cycle: enters for 3s, stops for 3s (loading), departs for 3s, idle 3s (~25% active)
    const cycle = 12;
    const phase = t % cycle;
    if (phase > 9.0) return; // IDLE phase: vehicle has left the scene!

    let x = 0;
    const y = h * 0.58;

    if (phase < 3.0) {
      // Entering from left
      x = -120 + (w * 0.45 + 120) * (phase / 3.0);
    } else if (phase < 6.0) {
      // Stopped at loading dock
      x = w * 0.45;
    } else {
      // Departing to right
      x = w * 0.45 + (w + 120) * ((phase - 6.0) / 3.0);
    }

    // Vehicle Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(x + 65, y + 42, 60, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vehicle Body (Electric Forklift / Logistics Van)
    ctx.fillStyle = night ? '#1b382b' : '#3b82f6';
    ctx.fillRect(x, y, 90, 40);

    // Cab / Windows
    ctx.fillStyle = night ? '#2d5a44' : '#1e3a8a';
    ctx.fillRect(x + 55, y - 20, 35, 20);
    ctx.fillStyle = night ? 'rgba(0,255,120,0.3)' : 'rgba(147,197,253,0.7)';
    ctx.fillRect(x + 60, y - 16, 25, 14);

    // Mast / Cargo Forks & Palette
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 20, y + 5, 25, 32);
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(x - 20, y + 5, 25, 32);

    // Rotating Wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 20, y + 40, 10, 0, Math.PI * 2);
    ctx.arc(x + 75, y + 40, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(x + 20, y + 40, 4, 0, Math.PI * 2);
    ctx.arc(x + 75, y + 40, 4, 0, Math.PI * 2);
    ctx.fill();

    // Flashing Amber Beacon Light
    const blink = Math.sin(t * 10) > 0;
    if (blink) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(x + 72, y - 24, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(251,191,36,0.35)';
      ctx.beginPath();
      ctx.arc(x + 72, y - 24, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // -------------------------------------------------------------
  // Scenario 2: Data Center Server Corridor
  // -------------------------------------------------------------
  private drawServerCorridorBackground(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, night: boolean) {
    // Vanishing Point Perspective
    const vpX = w * 0.5;
    const vpY = h * 0.38;

    // Floor
    ctx.fillStyle = night ? '#080d0a' : '#141d22';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.lineTo(vpX + 40, vpY);
    ctx.lineTo(vpX - 40, vpY);
    ctx.closePath();
    ctx.fill();

    // Ceiling
    ctx.fillStyle = night ? '#050806' : '#0e1418';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(vpX + 40, vpY);
    ctx.lineTo(vpX - 40, vpY);
    ctx.closePath();
    ctx.fill();

    // Left Server Racks
    ctx.fillStyle = night ? '#0b1610' : '#18242b';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(vpX - 40, vpY);
    ctx.lineTo(vpX - 40, h * 0.65);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Right Server Racks
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(vpX + 40, vpY);
    ctx.lineTo(vpX + 40, h * 0.65);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Blinking Server LEDs (Left & Right)
    for (let rack = 0; rack < 6; rack++) {
      const rxL = 20 + rack * 25;
      const rxR = w - 20 - rack * 25;
      const ry = h * 0.35 + rack * 20;

      const ledState1 = Math.sin(t * 8 + rack) > 0;
      const ledState2 = Math.cos(t * 12 + rack) > 0;

      ctx.fillStyle = ledState1 ? '#22c55e' : '#065f46';
      ctx.fillRect(rxL, ry, 3, 2);
      ctx.fillRect(rxR, ry, 3, 2);

      ctx.fillStyle = ledState2 ? '#38bdf8' : '#0369a1';
      ctx.fillRect(rxL, ry + 6, 3, 2);
      ctx.fillRect(rxR, ry + 6, 3, 2);
    }
  }

  private drawServerCorridorMovingObjects(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    night: boolean
  ) {
    // 10s cycle: engineer walks from far perspective to near front (~35% active)
    const cycle = 10;
    const phase = t % cycle;
    if (phase > 4.5) return; // IDLE corridor

    const progress = phase / 4.5;
    const scale = 0.35 + progress * 0.75;
    const x = (w * 0.5 - 20) + (Math.sin(progress * Math.PI) * 40);
    const y = h * 0.40 + (h * 0.35) * progress;

    // Person drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x + 15 * scale, y + 68 * scale, 18 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = night ? '#86efac' : '#fdba74';
    ctx.beginPath();
    ctx.arc(x + 15 * scale, y + 10 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Torso / Technician Coat
    ctx.fillStyle = night ? '#15803d' : '#0284c7';
    ctx.fillRect(x + 5 * scale, y + 20 * scale, 20 * scale, 30 * scale);

    // ID Badge lanyard
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 13 * scale, y + 28 * scale, 4 * scale, 6 * scale);

    // Animated Stride Legs
    const legSwing = Math.sin(t * 12) * 8 * scale;
    ctx.strokeStyle = night ? '#052e16' : '#0f172a';
    ctx.lineWidth = 4 * scale;
    // Left leg
    ctx.beginPath();
    ctx.moveTo(x + 10 * scale, y + 50 * scale);
    ctx.lineTo(x + (8 * scale) - legSwing, y + 68 * scale);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(x + 20 * scale, y + 50 * scale);
    ctx.lineTo(x + (22 * scale) + legSwing, y + 68 * scale);
    ctx.stroke();
  }

  // -------------------------------------------------------------
  // Scenario 3: Campus Gate Checkpoint
  // -------------------------------------------------------------
  private drawCampusGateBackground(ctx: CanvasRenderingContext2D, w: number, h: number, night: boolean) {
    // Sky
    ctx.fillStyle = night ? '#040705' : '#1e293b';
    ctx.fillRect(0, 0, w, h * 0.45);

    // Road Pavement
    ctx.fillStyle = night ? '#0a100d' : '#334155';
    ctx.fillRect(0, h * 0.45, w, h * 0.55);

    // Road White Markings
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.lineTo(w, h * 0.72);
    ctx.stroke();
    ctx.setLineDash([]);

    // Guard Booth
    ctx.fillStyle = night ? '#0f1a14' : '#475569';
    ctx.fillRect(w * 0.70, h * 0.25, 80, 85);
    ctx.fillStyle = night ? 'rgba(0,255,100,0.25)' : 'rgba(186,230,253,0.6)';
    ctx.fillRect(w * 0.72, h * 0.30, 45, 30);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('POST 01', w * 0.73, h * 0.28);
  }

  private drawCampusGateMovingObjects(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    night: boolean
  ) {
    // Barrier Arm state: lifts when vehicle arrives
    const cycle = 14;
    const phase = t % cycle;
    const isBarrierUp = phase > 3.0 && phase < 8.0;

    // Draw Boom Barrier Gate
    ctx.save();
    const pivotX = w * 0.68;
    const pivotY = h * 0.50;
    ctx.translate(pivotX, pivotY);
    if (isBarrierUp) {
      ctx.rotate(-Math.PI * 0.35); // lifted up
    }
    // Striped barrier arm
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-130, -5, 130, 8);
    for (let bx = -130; bx < 0; bx += 24) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, -5, 12, 8);
    }
    ctx.restore();

    // Vehicle arrival and crossing
    if (phase < 10.0) {
      let vx = -140;
      const vy = h * 0.60;

      if (phase < 3.5) {
        // Approaching barrier and slowing down
        vx = -140 + (w * 0.38 + 140) * (phase / 3.5);
      } else if (phase < 6.0) {
        // Paused at barrier
        vx = w * 0.38;
      } else {
        // Accelerating forward past checkpoint
        vx = w * 0.38 + (w + 140) * ((phase - 6.0) / 4.0);
      }

      // Sedan Car
      ctx.fillStyle = night ? '#1e3a2b' : '#0284c7';
      ctx.fillRect(vx, vy, 110, 32);
      ctx.fillStyle = night ? '#112219' : '#0369a1';
      ctx.fillRect(vx + 25, vy - 18, 55, 18);
      // Windows
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(vx + 30, vy - 14, 20, 12);
      ctx.fillRect(vx + 55, vy - 14, 20, 12);
      // Wheels
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(vx + 25, vy + 32, 9, 0, Math.PI * 2);
      ctx.arc(vx + 85, vy + 32, 9, 0, Math.PI * 2);
      ctx.fill();

      // Headlights light beam
      if (night) {
        ctx.fillStyle = 'rgba(255,255,200,0.15)';
        ctx.beginPath();
        ctx.moveTo(vx + 110, vy + 12);
        ctx.lineTo(vx + 220, vy - 10);
        ctx.lineTo(vx + 220, vy + 45);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // -------------------------------------------------------------
  // Scenario 4: Night Perimeter (Infrared Thermal)
  // -------------------------------------------------------------
  private drawNightPerimeterBackground(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    // Night phosphor green backdrop
    ctx.fillStyle = '#050a06';
    ctx.fillRect(0, 0, w, h);

    // Ground line
    ctx.fillStyle = '#0a140d';
    ctx.fillRect(0, h * 0.70, w, h * 0.30);

    // Wire Mesh Fence
    ctx.strokeStyle = 'rgba(34,197,94,0.18)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.20);
      ctx.lineTo(x + 20, h * 0.70);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 20, h * 0.20);
      ctx.lineTo(x, h * 0.70);
      ctx.stroke();
    }

    // Fence Posts
    for (let x = 40; x < w; x += 120) {
      ctx.fillStyle = 'rgba(34,197,94,0.4)';
      ctx.fillRect(x, h * 0.15, 6, h * 0.55);
    }

    // Scanline & IR sensor grain
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = `rgba(34,197,94,${(Math.sin(y + t * 5) * 0.015) + 0.02})`;
      ctx.fillRect(0, y, w, 1);
    }
  }

  private drawNightPerimeterMovingObjects(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    // 16s cycle: rare movement across fence line (~18% active)
    const cycle = 16;
    const phase = t % cycle;
    if (phase > 3.5) return; // Completely still perimeter

    const progress = phase / 3.5;
    const x = -40 + (w + 80) * progress;
    const y = h * 0.62;

    // Thermal Hot-Signature Gradient (Heat blooming)
    const bloom = ctx.createRadialGradient(x + 20, y + 10, 4, x + 20, y + 10, 45);
    bloom.addColorStop(0, 'rgba(255,255,255,0.95)');
    bloom.addColorStop(0.3, 'rgba(134,239,172,0.65)');
    bloom.addColorStop(0.7, 'rgba(34,197,94,0.25)');
    bloom.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(x + 20, y + 10, 45, 0, Math.PI * 2);
    ctx.fill();

    // High-temperature silhouette
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y - 8, 40, 24);
  }

  // -------------------------------------------------------------
  // Injected Interactive Target (Mouse Click / Drag)
  // -------------------------------------------------------------
  private drawInjectedTarget(ctx: CanvasRenderingContext2D, target: InteractiveTarget, night: boolean) {
    const { x, y, radius, label } = target;

    // Glowing target marker
    ctx.save();
    ctx.fillStyle = night ? 'rgba(34,197,94,0.2)' : 'rgba(45,212,191,0.25)';
    ctx.beginPath();
    ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = night ? '#4ade80' : '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair lines
    ctx.beginPath();
    ctx.moveTo(x - radius - 6, y); ctx.lineTo(x + radius + 6, y);
    ctx.moveTo(x, y - radius - 6); ctx.lineTo(x, y + radius + 6);
    ctx.stroke();

    // Label tag
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 45, y - radius - 20, 90, 16);
    ctx.strokeStyle = night ? '#4ade80' : '#2dd4bf';
    ctx.strokeRect(x - 45, y - radius - 20, 90, 16);

    ctx.fillStyle = night ? '#86efac' : '#2dd4bf';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label.toUpperCase(), x, y - radius - 8);
    ctx.restore();
  }

  // -------------------------------------------------------------
  // Realistic Surveillance Camera OSD (On-Screen Display)
  // -------------------------------------------------------------
  private drawCameraOSD(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    scenario: SurveillanceScenario,
    night: boolean
  ) {
    const meta = SCENARIO_PRESETS.find(p => p.id === scenario) || SCENARIO_PRESETS[0];
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    ctx.fillStyle = night ? 'rgba(74,222,128,0.85)' : 'rgba(255,255,255,0.75)';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';

    // Top-left: Camera Name & Location
    ctx.fillText(`${meta.cameraName} | 1080P @ 15FPS`, 12, 22);
    ctx.fillStyle = night ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.5)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(meta.location, 12, 36);

    // Top-right: Timestamp & REC indicator
    ctx.textAlign = 'right';
    ctx.fillStyle = night ? 'rgba(74,222,128,0.85)' : 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText(timeStr, w - 12, 22);

    // Blinking REC dot
    const recBlink = Math.floor(now.getTime() / 600) % 2 === 0;
    if (recBlink) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(w - 180, 18, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('REC', w - 155, 22);

    // Bottom-left: Codec & Ingress Mode
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('H.264/AVC | 4.0 Mbps Base | PUE 1.40', 12, h - 12);
  }
}
