'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export function CategoryScene({ mode, label }) {
  const canvas = useRef(null),
    controller = useRef(null),
    running = useRef(true);
  const [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false),
    [unsupported, setUnsupported] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const listener = () => setReduced(media.matches);
    listener();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);
  useEffect(() => {
    const el = canvas.current,
      ctx = el.getContext('2d');
    if (!ctx) {
      setUnsupported(true);
      return;
    }
    let width = 600,
      height = 420,
      frame = 0,
      last = 0,
      time = 0.6,
      visible = true,
      colors = {};
    const spherePoints = Array.from({ length: 68 }, (_, i) => {
      const y = 1 - (2 * (i + 0.5)) / 68,
        r = Math.sqrt(1 - y * y),
        angle = i * 2.399963;
      return {
        x: 145 * r * Math.cos(angle),
        y: 145 * y,
        z: 145 * r * Math.sin(angle),
      };
    });
    const sphereEdges = [];
    spherePoints.forEach((point, i) => {
      spherePoints
        .map((p, j) => ({
          j,
          d: Math.hypot(p.x - point.x, p.y - point.y, p.z - point.z),
        }))
        .filter((v) => v.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .forEach(({ j }) => {
          if (j > i) sphereEdges.push([i, j]);
        });
    });
    const network = [4, 6, 6, 3].map((count, layer) =>
      Array.from({ length: count }, (_, j) => ({
        x: (layer - 1.5) * 104,
        y: (j - (count - 1) / 2) * 39,
        z: Math.sin(j * 2.3 + layer) * 10,
        layer,
      })),
    );
    const samples = Array.from({ length: 48 }, (_, i) => {
      const x = ((i * 73) % 250) - 125,
        z = ((i * 47) % 210) - 105;
      return { x, z, y: 0.42 * x + 0.24 * z + Math.sin(i * 3.4) * 22 };
    });
    const route = [
      [0, 6],
      [1, 6],
      [1, 5],
      [2, 5],
      [3, 5],
      [3, 4],
      [4, 4],
      [4, 3],
      [5, 3],
      [5, 2],
      [6, 2],
      [6, 1],
      [6, 0],
    ];
    const obstacles = new Set(['1,2', '2,2', '3,2', '2,3', '4,5']);
    function readColors() {
      const style = getComputedStyle(el);
      colors = {
        paper: style.getPropertyValue('--path-paper').trim(),
        ink: style.getPropertyValue('--path-ink').trim(),
        line: style.getPropertyValue('--path-line').trim(),
        muted: style.getPropertyValue('--path-muted').trim(),
        accent: style.getPropertyValue('--path-accent').trim(),
        surface: style.getPropertyValue('--path-surface').trim(),
      };
    }
    function project(point) {
      const yaw =
        (mode === 'rl'
          ? 0.68
          : mode === 'ml'
            ? 0.6
            : mode === 'dl'
              ? 0.38
              : time * 0.12) +
        Math.sin(time * 0.17) * 0.065;
      const pitch = mode === 'rl' ? 0.62 : mode === 'ml' ? 0.4 : 0.18;
      const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw),
        depth = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
      const y = point.y * Math.cos(pitch) - depth * Math.sin(pitch),
        z = point.y * Math.sin(pitch) + depth * Math.cos(pitch);
      const perspective = 680 / (680 + z),
        scale = Math.min(width / 440, height / 340) * 1.12;
      return {
        x: width / 2 + x * scale * perspective,
        y: height / 2 - y * scale * perspective,
        z,
        scale: scale * perspective,
      };
    }
    function line(a, b, color = colors.line, alpha = 1, size = 1) {
      const p = project(a),
        q = project(b);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }
    function poly(points, color, alpha = 1, stroke) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      points
        .map(project)
        .forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
    function ball(point, r = 4, active = false) {
      const p = project(point),
        radius = Math.max(2, r * p.scale);
      if (active) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      const g = ctx.createRadialGradient(
        p.x - radius * 0.3,
        p.y - radius * 0.4,
        0,
        p.x,
        p.y,
        radius,
      );
      g.addColorStop(0, active ? colors.ink : colors.muted);
      g.addColorStop(0.45, active ? colors.accent : colors.muted);
      g.addColorStop(1, colors.surface);
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = active ? colors.accent : colors.line;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
    function knowledge() {
      for (let plane = 0; plane < 3; plane++) {
        const ring = Array.from({ length: 81 }, (_, i) => {
          const a = (i / 80) * Math.PI * 2;
          return plane === 0
            ? { x: 165 * Math.cos(a), y: 165 * Math.sin(a), z: 0 }
            : plane === 1
              ? { x: 0, y: 165 * Math.cos(a), z: 165 * Math.sin(a) }
              : { x: 165 * Math.cos(a), y: 0, z: 165 * Math.sin(a) };
        });
        for (let i = 1; i < ring.length; i++)
          line(ring[i - 1], ring[i], colors.line, 0.38, 0.7);
      }
      sphereEdges.forEach(([a, b], i) => {
        line(spherePoints[a], spherePoints[b], colors.line, 0.58, 0.8);
        const p = (time * 0.36 + i * 0.13) % 1;
        if (i % 6 === 0) {
          const A = spherePoints[a],
            B = spherePoints[b];
          ball(
            {
              x: A.x + (B.x - A.x) * p,
              y: A.y + (B.y - A.y) * p,
              z: A.z + (B.z - A.z) * p,
            },
            2.2,
            true,
          );
        }
      });
      spherePoints
        .map((p, i) => ({ p, i }))
        .sort((a, b) => project(b.p).z - project(a.p).z)
        .forEach(({ p, i }) =>
          ball(p, 3.6, (Math.floor(time * 3) + i) % 17 === 0),
        );
      ball({ x: 0, y: 0, z: 0 }, 13, true);
    }
    function fitting() {
      const blend = 0.5 - 0.5 * Math.cos(time * 0.65),
        a = -0.35 + blend * 0.77,
        b = 0.65 - blend * 0.41;
      const plane = (x, z) => ({ x, z, y: a * x + b * z });
      poly(
        [
          plane(-145, -120),
          plane(145, -120),
          plane(145, 120),
          plane(-145, 120),
        ],
        colors.accent,
        0.11,
        colors.accent,
      );
      for (let x = -140; x <= 140; x += 35)
        line(plane(x, -120), plane(x, 120), colors.accent, 0.24, 0.8);
      for (let z = -120; z <= 120; z += 30)
        line(plane(-145, z), plane(145, z), colors.accent, 0.24, 0.8);
      line(
        { x: -160, y: -95, z: -130 },
        { x: 160, y: -95, z: -130 },
        colors.muted,
        0.4,
      );
      line(
        { x: -160, y: -95, z: -130 },
        { x: -160, y: 130, z: -130 },
        colors.muted,
        0.4,
      );
      line(
        { x: -160, y: -95, z: -130 },
        { x: -160, y: -95, z: 140 },
        colors.muted,
        0.4,
      );
      samples
        .slice()
        .sort((a, b) => project(b).z - project(a).z)
        .forEach((point, i) => {
          line(point, plane(point.x, point.z), colors.accent, 0.4, 0.8);
          ball(point, 3.7, i % 7 === 0);
        });
    }
    function layers() {
      for (let layer = 0; layer < network.length - 1; layer++)
        network[layer].forEach((a, i) =>
          network[layer + 1].forEach((b, j) => {
            if (
              Math.abs(
                i / network[layer].length - j / network[layer + 1].length,
              ) < 0.4
            ) {
              line(a, b, colors.line, 0.65, 0.85);
              const p = (time * 0.6 - layer * 0.22) % 1;
              if (p >= 0 && p < 1 && (i + j) % 3 === 0)
                ball(
                  {
                    x: a.x + (b.x - a.x) * p,
                    y: a.y + (b.y - a.y) * p,
                    z: a.z + (b.z - a.z) * p,
                  },
                  2.2,
                  true,
                );
            }
          }),
        );
      const active = Math.floor(time * 1.4) % 4;
      network
        .flat()
        .sort((a, b) => project(b).z - project(a).z)
        .forEach((p) => ball(p, 6.5, p.layer === active));
      for (const group of network) {
        const x = group[0].x;
        line(
          { x, y: -133, z: 0 },
          { x, y: -133, z: 37 },
          colors.accent,
          0.5,
          1.5,
        );
      }
    }
    function tile(x, z, height, accent = false) {
      const xx = (x - 3) * 37,
        zz = (z - 3) * 37,
        h = height;
      const corners = [
        [-16, -16],
        [16, -16],
        [16, 16],
        [-16, 16],
      ].map(([dx, dz]) => ({ x: xx + dx, y: -55 + h, z: zz + dz }));
      const lower = corners.map((p) => ({ ...p, y: -62 }));
      poly([corners[0], corners[1], lower[1], lower[0]], colors.line, 0.65);
      poly([corners[1], corners[2], lower[2], lower[1]], colors.line, 0.45);
      poly(
        corners,
        accent ? colors.accent : colors.surface,
        accent ? 0.45 : 1,
        colors.line,
      );
    }
    function exploration() {
      const tiles = Array.from({ length: 49 }, (_, i) => ({
        x: i % 7,
        z: Math.floor(i / 7),
      })).sort(
        (a, b) =>
          project({ x: (b.x - 3) * 37, y: -55, z: (b.z - 3) * 37 }).z -
          project({ x: (a.x - 3) * 37, y: -55, z: (a.z - 3) * 37 }).z,
      );
      tiles.forEach((p) =>
        tile(
          p.x,
          p.z,
          obstacles.has(`${p.x},${p.z}`) ? 30 : 0,
          p.x === 6 && p.z === 0,
        ),
      );
      const world = ([x, z]) => ({ x: (x - 3) * 37, y: -49, z: (z - 3) * 37 });
      route
        .slice(1)
        .forEach((p, i) =>
          line(world(route[i]), world(p), colors.accent, 0.28, 1.7),
        );
      const travel = (time * 0.95) % (route.length - 1),
        index = Math.floor(travel),
        u = travel - index,
        p = u * u * (3 - 2 * u),
        a = world(route[index]),
        b = world(route[index + 1]);
      for (let i = 0; i < index; i++)
        line(world(route[i]), world(route[i + 1]), colors.accent, 0.9, 2);
      ball(
        {
          x: a.x + (b.x - a.x) * p,
          y: -32 + Math.sin(time * 3) * 3,
          z: a.z + (b.z - a.z) * p,
        },
        8,
        true,
      );
      ball({ ...world(route.at(-1)), y: -26 }, 5, true);
    }
    function render() {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';
      ({ ai: knowledge, ml: fitting, dl: layers, rl: exploration })[mode]();
      ctx.globalAlpha = 1;
    }
    function resize() {
      width = el.clientWidth;
      height = el.clientHeight;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      el.width = width * ratio;
      el.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      render();
    }
    function tick(now) {
      frame = 0;
      if (last) time += Math.min((now - last) / 1000, 0.05);
      last = now;
      render();
      if (running.current && visible && !document.hidden)
        frame = requestAnimationFrame(tick);
    }
    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    }
    function start() {
      if (!frame && running.current && visible && !document.hidden) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    }
    readColors();
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(el);
    const themeObserver = new MutationObserver(() => {
      readColors();
      render();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const visibility = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    });
    visibility.observe(el);
    const hide = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', hide);
    controller.current = { start, stop, render };
    resize();
    start();
    return () => {
      stop();
      sizeObserver.disconnect();
      themeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', hide);
      controller.current = null;
    };
  }, [mode]);
  useEffect(() => {
    running.current = !paused && !reduced;
    if (controller.current) {
      controller.current.stop();
      controller.current.render();
      controller.current.start();
    }
  }, [paused, reduced]);
  return (
    <div className={`path-visual visual-${mode}`}>
      <canvas ref={canvas} aria-hidden="true" />
      {unsupported && (
        <p className="path-fallback">
          Explore the topics below. This browser cannot display the animated
          illustration.
        </p>
      )}
      <div className="path-visual-caption">
        <span>
          {label} <small>Concept illustration</small>
        </span>
        <button
          disabled={reduced || unsupported}
          aria-label={paused || reduced ? 'Play animation' : 'Pause animation'}
          aria-pressed={!paused && !reduced}
          onClick={() => setPaused(!paused)}
        >
          {paused || reduced ? <Play /> : <Pause />}
        </button>
      </div>
    </div>
  );
}
