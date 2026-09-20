'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { ArrowUpRight, Check, Crosshair, Search } from 'lucide-react';
import { type Category, categories } from '@/lib/content';
import {
  layoutMindMap,
  zoomMindMap,
  type MapConcept,
  type MapEdge,
  type MindMapGraph,
  type PositionedNode,
} from '@/lib/mindmap';
import { readStored, writeStored } from '@/lib/browser-storage';
import { useLearning } from '@/components/learning-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const color = (branch: number) => `var(--map-branch-${branch % 8})`;
const style = (branch: number) =>
  ({ '--branch-color': color(branch) }) as CSSProperties;
function edgePath(
  from: PositionedNode,
  to: PositionedNode,
  compact: boolean,
  edge: MapEdge,
) {
  const right = to.x + to.width / 2 > from.x + from.width / 2;
  const x1 = right ? from.x + from.width : from.x,
    x2 = right ? to.x : to.x + to.width;
  const y1 = from.y + from.height / 2,
    y2 = to.y + to.height / 2;
  if (compact && from.kind === 'root' && edge.kind === 'hierarchy')
    return `M${from.x + from.width / 2},${from.y + from.height} C12,${from.y + from.height + 32} 12,${y2} ${to.x},${y2}`;
  const bend = (x2 - x1) * 0.55;
  if (edge.kind !== 'hierarchy' && Math.abs(x1 - x2) < 60) {
    const offset = right ? 70 : -70;
    return `M${x1},${y1} C${x1 + offset},${y1} ${x2 + offset},${y2} ${x2},${y2}`;
  }
  return `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`;
}
export function MindMapView({
  category,
  graph,
  catalog,
}: {
  category: Category;
  graph: MindMapGraph;
  catalog: MapConcept[];
}) {
  const router = useRouter();
  const { learned } = useLearning();
  const viewport = useRef<HTMLElement>(null),
    nodes = useRef(new Map<string, HTMLButtonElement>());
  const restored = useRef(false),
    returnFocus = useRef<HTMLButtonElement | null>(null);
  const [width, setWidth] = useState(0),
    [query, setQuery] = useState(''),
    [allRelations, setAllRelations] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null),
    [active, setActive] = useState<string | null>(null),
    [selected, setSelected] = useState<MapConcept | null>(null);
  const [zoom, setZoom] = useState(1);
  const pendingZoom = useRef<{
    scale: number;
    left: number;
    top: number;
  } | null>(null);
  const canvasWidth = width >= 680 ? Math.max(width, 1440) : width || 1440;
  const offsetX = Math.max(0, (width - canvasWidth * zoom) / 2);
  const storageKey = `knowledge-map-view:${category.slug}`;
  const layout = useMemo(
    () => layoutMindMap(graph, canvasWidth),
    [graph, canvasWidth],
  );
  const positioned = useMemo(
    () => new Map(layout.nodes.map((n) => [n.id, n])),
    [layout],
  );
  const bySlug = useMemo(
    () => new Map(catalog.map((c) => [c.slug, c])),
    [catalog],
  );
  const directories = graph.nodes.filter((n) => n.kind === 'group');
  const knownRelations = useMemo(() => {
    const count = new Map<string, number>();
    graph.edges
      .filter((e) => e.kind !== 'hierarchy')
      .forEach((e) => {
        count.set(e.from, (count.get(e.from) ?? 0) + 1);
        count.set(e.to, (count.get(e.to) ?? 0) + 1);
      });
    return count;
  }, [graph]);
  const matches = query.trim()
    ? layout.nodes.filter(
        (n) =>
          n.concept &&
          n.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : [];
  const highlight = hovered ?? active;
  const visibleEdges = graph.edges.filter(
    (e) =>
      e.kind === 'hierarchy' ||
      allRelations ||
      (highlight && (e.from === highlight || e.to === highlight)),
  );
  const saveView = () => {
    if (viewport.current)
      writeStored('session', storageKey, {
        top: viewport.current.scrollTop,
        left: viewport.current.scrollLeft,
        scale: zoom,
      });
  };
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    if (!width || restored.current || !viewport.current) return;
    const saved = readStored('session', storageKey, (value) => {
      if (!value || typeof value !== 'object') return null;
      const record = value as Record<string, unknown>;
      if (!Number.isFinite(record.top) || Number(record.top) < 0) return null;
      return {
        top: Number(record.top),
        left: Number.isFinite(record.left)
          ? Math.max(0, Number(record.left))
          : 0,
        scale: Number.isFinite(record.scale)
          ? Math.min(2.5, Math.max(0.2, Number(record.scale)))
          : Math.min(1, width / canvasWidth),
      };
    });
    const initial = saved.value?.scale ?? Math.min(1, width / canvasWidth);
    const root = layout.nodes.find((n) => n.kind === 'root');
    pendingZoom.current = {
      scale: initial,
      left: saved.value?.left ?? 0,
      top:
        saved.value?.top ??
        (layout.compact
          ? 0
          : Math.max(
              0,
              (root?.y ?? 0) * initial -
                viewport.current.clientHeight / 2 +
                32 * initial,
            )),
    };
    restored.current = true;
    setZoom(initial);
  }, [width, layout, canvasWidth, storageKey]);
  useLayoutEffect(() => {
    const next = pendingZoom.current;
    if (!next || !viewport.current || next.scale !== zoom) return;
    viewport.current.scrollLeft = next.left;
    viewport.current.scrollTop = next.top;
    pendingZoom.current = null;
  }, [zoom, width]);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const box = el.getBoundingClientRect();
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? el.clientHeight
            : 1;
      const next = zoomMindMap(
        zoom,
        zoom * Math.exp(-event.deltaY * unit * 0.002),
        el.scrollLeft,
        el.scrollTop,
        event.clientX - box.left,
        event.clientY - box.top,
        canvasWidth,
        el.clientWidth,
      );
      pendingZoom.current = next;
      setZoom(next.scale);
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, [zoom, canvasWidth]);
  const changeZoom = (requested: number) => {
    const el = viewport.current;
    if (!el) return;
    const next = zoomMindMap(
      zoom,
      requested,
      el.scrollLeft,
      el.scrollTop,
      el.clientWidth / 2,
      el.clientHeight / 2,
      canvasWidth,
      el.clientWidth,
    );
    pendingZoom.current = next;
    setZoom(next.scale);
  };
  const fitMap = () => {
    const el = viewport.current;
    if (!el) return;
    const scale = Math.min(
      1,
      Math.max(
        0.2,
        Math.min(
          el.clientWidth / canvasWidth,
          (el.clientHeight - 16) / layout.height,
        ),
      ),
    );
    pendingZoom.current = { scale, left: 0, top: 0 };
    if (scale === zoom) {
      el.scrollTo(0, 0);
      pendingZoom.current = null;
    } else setZoom(scale);
  };
  const locate = (id: string) => {
    const node = positioned.get(id);
    if (!node || !viewport.current) return;
    viewport.current.scrollTo({
      left: Math.max(
        0,
        (node.x + node.width / 2) * zoom +
          offsetX -
          viewport.current.clientWidth / 2,
      ),
      top: Math.max(
        0,
        (node.y + node.height / 2) * zoom - viewport.current.clientHeight / 2,
      ),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
    setActive(id);
    nodes.current.get(id)?.focus({ preventScroll: true });
  };
  const close = () => {
    setSelected(null);
    requestAnimationFrame(() =>
      returnFocus.current?.focus({ preventScroll: true }),
    );
  };
  const openConcept = (concept: MapConcept) => {
    setActive(concept.slug);
    setSelected(concept);
  };
  const relationsFor = (
    concept: MapConcept,
    kind: 'prerequisites' | 'relatedConcepts',
  ) =>
    [...new Set(concept[kind])].flatMap((slug) =>
      bySlug.has(slug) ? [bySlug.get(slug)!] : [],
    );
  return (
    <main className="mindmap-page">
      <div className="mindmap-page-heading">
        <nav className="breadcrumbs" aria-label="面包屑">
          <Link href="/">知识库</Link>
          <span>/</span>
          <span>思维导图</span>
        </nav>
        <div className="mindmap-title-row">
          <div>
            <p className="eyebrow">{category.shortTitle} · 知识连接</p>
            <h1>{category.title}思维导图</h1>
            <p>
              {graph.conceptCount} 个概念 · {directories.length} 个目录分支 ·
              上下滚动探索
            </p>
          </div>
          <label className="mindmap-category-select">
            切换方向
            <select
              value={category.slug}
              onChange={(e) => {
                saveView();
                router.push(`/mindmaps/${e.target.value}`);
              }}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mindmap-tools">
        <div className="mindmap-search">
          <Search size={16} aria-hidden="true" />
          <input
            aria-label="在导图中查找概念"
            placeholder="查找并定位概念…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.trim() && (
            <div className="mindmap-search-results">
              <small aria-live="polite">
                {matches.length
                  ? `找到 ${matches.length} 个概念`
                  : '没有匹配的概念'}
              </small>
              {matches.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    locate(n.id);
                    setQuery('');
                  }}
                >
                  {n.title}
                  <span>定位</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <label className="mindmap-relation-toggle">
          <input
            type="checkbox"
            checked={allRelations}
            onChange={(e) => setAllRelations(e.target.checked)}
          />
          显示全部知识关系
        </label>
        <button
          type="button"
          className="mindmap-center"
          onClick={() => locate(graph.nodes[0]?.id ?? '')}
        >
          <Crosshair size={16} />
          回到中心
        </button>
      </div>
      <div className="mindmap-zoom-controls" aria-label="导图缩放">
        <button
          type="button"
          aria-label="缩小导图"
          disabled={zoom <= 0.2}
          onClick={() => changeZoom(zoom / 1.2)}
        >
          −
        </button>
        <button
          type="button"
          aria-label="恢复100%缩放"
          onClick={() => changeZoom(1)}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          aria-label="放大导图"
          disabled={zoom >= 2.5}
          onClick={() => changeZoom(zoom * 1.2)}
        >
          ＋
        </button>
        <button type="button" onClick={fitMap}>
          适应全图
        </button>
        <span>Ctrl + 滚轮缩放 · 普通滚轮移动画布</span>
      </div>
      <div className="mindmap-legend" aria-label="导图图例">
        <span>
          <i className="map-line-solid" />
          目录归属
        </span>
        <span>
          <i className="map-line-dashed" />
          前置知识 → 后续概念
        </span>
        <span>
          <i className="map-line-dotted" />
          相关概念
        </span>
        <span>
          <i className="map-shape-core" />
          关联较多
        </span>
        <span>
          <i className="map-shape-leaf" />
          一般概念
        </span>
        <span>
          <Check size={13} />
          已学习
        </span>
      </div>
      <details className="mindmap-color-key">
        <summary>分支颜色与目录 · {directories.length} 个</summary>
        <div>
          {directories.map((n) => (
            <button
              key={n.id}
              type="button"
              style={style(n.branch)}
              onClick={() => locate(n.id)}
            >
              <i />
              {n.title}
            </button>
          ))}
        </div>
      </details>
      <section
        ref={viewport}
        className="mindmap-viewport"
        aria-label={`${category.title}知识导图，可上下滚动；所有概念均可通过键盘访问`}
        onScroll={saveView}
      >
        <div
          className="mindmap-scaled-world"
          style={{
            width: Math.max(width, canvasWidth * zoom),
            height: layout.height * zoom,
          }}
        >
          <div
            className="mindmap-canvas"
            style={{
              width: canvasWidth,
              height: layout.height,
              transform: `translateX(${offsetX}px) scale(${zoom})`,
            }}
          >
            <svg
              className="mindmap-edges"
              width={canvasWidth}
              height={layout.height}
              aria-hidden="true"
            >
              <defs>
                <marker
                  id={`map-arrow-${category.slug}`}
                  markerWidth="7"
                  markerHeight="7"
                  refX="6"
                  refY="3.5"
                  orient="auto"
                >
                  <path d="M0,0 L7,3.5 L0,7" fill="context-stroke" />
                </marker>
              </defs>
              {visibleEdges.map((e) => {
                const from = positioned.get(e.from),
                  to = positioned.get(e.to);
                if (!from || !to) return null;
                const lit =
                  highlight && (e.from === highlight || e.to === highlight);
                return (
                  <path
                    key={`${e.kind}/${e.from}/${e.to}`}
                    data-edge-kind={e.kind}
                    d={edgePath(from, to, layout.compact, e)}
                    className={`mindmap-edge mindmap-edge-${e.kind}${lit ? ' is-highlighted' : ''}`}
                    style={{
                      stroke: color(e.branch),
                      opacity:
                        highlight && !lit
                          ? e.kind === 'hierarchy'
                            ? 0.45
                            : 0.15
                          : undefined,
                    }}
                    markerEnd={
                      e.kind === 'prerequisite'
                        ? `url(#map-arrow-${category.slug})`
                        : undefined
                    }
                  />
                );
              })}
            </svg>
            {layout.nodes.map((node) => {
              const geometry: CSSProperties = {
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                ...style(node.branch),
              };
              if (node.kind === 'group')
                return (
                  <div
                    key={node.id}
                    className="mindmap-directory"
                    style={geometry}
                  >
                    <span>{node.title}</span>
                    <small>目录分支</small>
                  </div>
                );
              const core = (knownRelations.get(node.id) ?? 0) >= 5;
              const done = learned.includes(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  ref={(el) => {
                    if (el) nodes.current.set(node.id, el);
                    else nodes.current.delete(node.id);
                  }}
                  data-concept-slug={node.id}
                  className={`mindmap-node mindmap-node-${node.kind === 'root' ? 'root' : core ? 'core' : 'leaf'}${highlight === node.id ? ' is-selected' : ''}`}
                  style={geometry}
                  title={node.title}
                  aria-label={`${node.title}${done ? '，已学习' : ''}，点击确认是否进入知识页`}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setActive(node.id)}
                  onClick={(e) => {
                    returnFocus.current = e.currentTarget;
                    if (node.concept) openConcept(node.concept);
                  }}
                >
                  <span>
                    {node.kind === 'root' ? category.title : node.title}
                  </span>
                  {done && <Check size={13} aria-label="已学习" />}
                  <ArrowUpRight
                    className="mindmap-node-arrow"
                    size={12}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <p className="mindmap-caption">
        彩色实线用于组织目录，不代表前置关系。悬停或聚焦知识节点可突出直接连接；点击后确认跳转。
      </p>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent showCloseButton={false} className="mindmap-confirmation">
          <DialogTitle>前往「{selected?.title}」？</DialogTitle>
          <DialogDescription>
            确认后打开知识页，返回时保留导图的浏览位置。
          </DialogDescription>
          {selected &&
            (['prerequisites', 'relatedConcepts'] as const).map((kind) => {
              const refs = relationsFor(selected, kind);
              return (
                refs.length > 0 && (
                  <div key={kind} className="mindmap-dialog-relations">
                    <h3>
                      {kind === 'prerequisites' ? '前置知识' : '相关概念'}
                    </h3>
                    <div>
                      {refs.map((c) => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => openConcept(c)}
                        >
                          {c.title}
                          {c.category !== category.slug && (
                            <small>跨方向</small>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              );
            })}
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              留在导图
            </Button>
            <Button
              onClick={() => {
                if (selected) {
                  saveView();
                  router.push(`/concept/${encodeURIComponent(selected.slug)}`);
                }
              }}
            >
              确认前往
              <ArrowUpRight size={15} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
