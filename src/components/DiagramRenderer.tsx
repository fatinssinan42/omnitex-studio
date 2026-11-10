import React from 'react';
import { DiagramBlock } from '../types/document';

interface DiagramRendererProps {
  block: DiagramBlock;
  interactive?: boolean;
  selectedNodeId?: string | null;
  onSelectNode?: (id: string) => void;
  onMoveNode?: (id: string, x: number, y: number) => void;
}

const COLOR_MAP: Record<string, { fill: string; stroke: string; text: string }> = {
  blue: { fill: '#eff6ff', stroke: '#1d4ed8', text: '#1e3a8a' },
  emerald: { fill: '#ecfdf5', stroke: '#047857', text: '#064e3b' },
  amber: { fill: '#fffbeb', stroke: '#b45309', text: '#78350f' },
  violet: { fill: '#f5f3ff', stroke: '#6d28d9', text: '#4c1d95' },
  red: { fill: '#fef2f2', stroke: '#b91c1c', text: '#7f1d1d' },
  stone: { fill: '#f5f5f4', stroke: '#44403c', text: '#1c1917' },
};

/**
 * Safely evaluates a mathematical expression f(x) for PGFPlots preview
 */
function evalMathExpr(expr: string, x: number): number {
  try {
    const sanitized = expr
      .replace(/\^/g, '**')
      .replace(/sin\(deg\(x\)\)/g, 'Math.sin(x)')
      .replace(/cos\(deg\(x\)\)/g, 'Math.cos(x)')
      .replace(/\bsin\(/g, 'Math.sin(')
      .replace(/\bcos\(/g, 'Math.cos(')
      .replace(/\bexp\(/g, 'Math.exp(')
      .replace(/\blog\(/g, 'Math.log(')
      .replace(/\bsqrt\(/g, 'Math.sqrt(');
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `return Number(${sanitized});`);
    const res = fn(x);
    return Number.isFinite(res) ? res : 0;
  } catch {
    return 0;
  }
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  block,
  interactive = false,
  selectedNodeId = null,
  onSelectNode,
  onMoveNode,
}) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const grabOffset = React.useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // 1:1 Direct Manipulation with Pointer Capture (apple-design §2: respect grab offset)
  const handlePointerDown = (
    e: React.PointerEvent<SVGGElement>,
    nodeId: string,
    nodeX: number,
    nodeY: number
  ) => {
    if (!interactive) return;
    e.stopPropagation();
    onSelectNode?.(nodeId);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 680 / rect.width;
    const scaleY = 200 / rect.height;
    const pointerX = (e.clientX - rect.left) * scaleX;
    const pointerY = (e.clientY - rect.top) * scaleY;

    grabOffset.current = { dx: pointerX - nodeX, dy: pointerY - nodeY };
    setDraggingId(nodeId);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive || !draggingId || !onMoveNode) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 680 / rect.width;
    const scaleY = 200 / rect.height;
    const pointerX = (e.clientX - rect.left) * scaleX;
    const pointerY = (e.clientY - rect.top) * scaleY;

    const nextX = Math.round(Math.max(10, Math.min(550, pointerX - grabOffset.current.dx)) / 5) * 5;
    const nextY = Math.round(Math.max(15, Math.min(145, pointerY - grabOffset.current.dy)) / 5) * 5;
    onMoveNode(draggingId, nextX, nextY);
  };

  const handlePointerUp = () => {
    if (draggingId) setDraggingId(null);
  };

  if (block.variant === 'tikz-flow') {
    const nodeW = 114;
    const nodeH = 44;

    return (
      <svg
        ref={svgRef}
        viewBox="0 0 680 190"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-auto select-none rounded border border-stone-200/80 bg-white ${
          interactive ? 'cursor-crosshair' : ''
        }`}
      >
        <defs>
          <marker
            id={`arrow-${block.id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#292524" />
          </marker>
          <pattern
            id={`tikz-grid-${block.id}`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(20,20,19,0.04)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {interactive && (
          <rect width="680" height="190" fill={`url(#tikz-grid-${block.id})`} />
        )}

        {/* Edges */}
        {block.edges.map((edge) => {
          const fromNode = block.nodes.find((n) => n.id === edge.from);
          const toNode = block.nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.x + nodeW / 2;
          const y1 = fromNode.y + nodeH / 2;
          const x2 = toNode.x + nodeW / 2;
          const y2 = toNode.y + nodeH / 2;

          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.hypot(dx, dy) || 1;
          const startX = x1 + (dx / dist) * (nodeW / 2);
          const startY = y1 + (dy / dist) * (nodeH / 2);
          const endX = x2 - (dx / dist) * (nodeW / 2 + 4);
          const endY = y2 - (dy / dist) * (nodeH / 2 + 4);

          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2 - (edge.curved ? 28 : 0);

          const pathD = edge.curved
            ? `M ${startX} ${startY} Q ${midX} ${midY - 18} ${endX} ${endY}`
            : `M ${startX} ${startY} L ${endX} ${endY}`;

          const dashArray =
            edge.style === 'dashed'
              ? '5,4'
              : edge.style === 'dotted'
                ? '2,3'
                : undefined;

          return (
            <g key={edge.id}>
              <path
                d={pathD}
                fill="none"
                stroke="#292524"
                strokeWidth="1.6"
                strokeDasharray={dashArray}
                markerEnd={`url(#arrow-${block.id})`}
              />
              {edge.label && (
                <g transform={`translate(${midX}, ${midY - 7})`}>
                  <rect
                    x="-28"
                    y="-9"
                    width="56"
                    height="15"
                    rx="3"
                    fill="white"
                    fillOpacity="0.9"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-stone-700 text-[10px] font-serif italic"
                  >
                    {edge.label.replace(/\$/g, '')}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {block.nodes.map((node) => {
          const palette = COLOR_MAP[node.color] ?? COLOR_MAP.blue;
          const isSelected = selectedNodeId === node.id;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onPointerDown={(e) => handlePointerDown(e, node.id, node.x, node.y)}
              className={interactive ? 'cursor-grab active:cursor-grabbing' : ''}
            >
              {node.shape === 'diamond' ? (
                <polygon
                  points={`${nodeW / 2},0 ${nodeW},${nodeH / 2} ${nodeW / 2},${nodeH} 0,${nodeH / 2}`}
                  fill={palette.fill}
                  stroke={isSelected ? '#141413' : palette.stroke}
                  strokeWidth={isSelected ? '2.2' : '1.5'}
                />
              ) : node.shape === 'circle' ? (
                <ellipse
                  cx={nodeW / 2}
                  cy={nodeH / 2}
                  rx={nodeW / 2}
                  ry={nodeH / 2}
                  fill={palette.fill}
                  stroke={isSelected ? '#141413' : palette.stroke}
                  strokeWidth={isSelected ? '2.2' : '1.5'}
                />
              ) : (
                <rect
                  width={nodeW}
                  height={nodeH}
                  rx={node.shape === 'rounded' ? 8 : 2}
                  fill={palette.fill}
                  stroke={isSelected ? '#141413' : palette.stroke}
                  strokeWidth={isSelected ? '2.2' : '1.5'}
                />
              )}

              <text
                x={nodeW / 2}
                y={nodeH / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={palette.text}
                className="text-[11.5px] font-medium font-serif pointer-events-none"
              >
                {node.label.replace(/\$/g, '')}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // PGFPlot Scientific Vector Plot Renderer
  const cfg = block.plotConfig;
  const W = 540;
  const H = 220;
  const padL = 52;
  const padR = 24;
  const padT = 26;
  const padB = 38;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const samples = 50;
  const xMin = cfg.xMin;
  const xMax = cfg.xMax > cfg.xMin ? cfg.xMax : cfg.xMin + 10;

  let yMin = Infinity;
  let yMax = -Infinity;

  const computedSeries = cfg.series.map((s) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= samples; i++) {
      const x = xMin + ((xMax - xMin) * i) / samples;
      const y = evalMathExpr(s.expression, x);
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
      pts.push({ x, y });
    }
    return { ...s, pts };
  });

  if (!Number.isFinite(yMin) || yMin === yMax) {
    yMin = 0;
    yMax = 10;
  }

  const mapX = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const mapY = (y: number) => padT + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto rounded border border-stone-200/80 bg-white select-none"
    >
      {/* Title */}
      {cfg.title && (
        <text
          x={W / 2}
          y={16}
          textAnchor="middle"
          className="fill-stone-900 text-[12px] font-semibold font-serif"
        >
          {cfg.title.replace(/\$/g, '')}
        </text>
      )}

      {/* Grid lines */}
      {cfg.grid &&
        [0.2, 0.4, 0.6, 0.8].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              y1={padT + plotH * t}
              x2={padL + plotW}
              y2={padT + plotH * t}
              stroke="#e7e5e4"
              strokeDasharray="3,3"
            />
            <line
              x1={padL + plotW * t}
              y1={padT}
              x2={padL + plotW * t}
              y2={padT + plotH}
              stroke="#e7e5e4"
              strokeDasharray="3,3"
            />
          </g>
        ))}

      {/* Axes box */}
      <rect
        x={padL}
        y={padT}
        width={plotW}
        height={plotH}
        fill="none"
        stroke="#1c1917"
        strokeWidth="1.2"
      />

      {/* Curves */}
      {computedSeries.map((s) => {
        const strokeColor = COLOR_MAP[s.color]?.stroke ?? '#1d4ed8';
        const d = s.pts
          .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${mapX(pt.x).toFixed(1)} ${mapY(pt.y).toFixed(1)}`)
          .join(' ');
        return (
          <path
            key={s.id}
            d={d}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
          />
        );
      })}

      {/* Legend */}
      <g transform={`translate(${padL + 10}, ${padT + 10})`}>
        <rect
          width="115"
          height={computedSeries.length * 16 + 8}
          fill="white"
          fillOpacity="0.92"
          stroke="#d6d3d1"
          rx="2"
        />
        {computedSeries.map((s, idx) => {
          const strokeColor = COLOR_MAP[s.color]?.stroke ?? '#1d4ed8';
          return (
            <g key={s.id} transform={`translate(8, ${12 + idx * 16})`}>
              <line x1="0" y1="0" x2="16" y2="0" stroke={strokeColor} strokeWidth="2" />
              <text x="22" y="3" className="fill-stone-800 text-[9.5px] font-serif">
                {s.name.replace(/\$/g, '')}
              </text>
            </g>
          );
        })}
      </g>

      {/* Axis labels */}
      <text
        x={padL + plotW / 2}
        y={H - 8}
        textAnchor="middle"
        className="fill-stone-800 text-[10.5px] font-serif"
      >
        {cfg.xLabel.replace(/\$/g, '')}
      </text>
      <text
        x={15}
        y={padT + plotH / 2}
        textAnchor="middle"
        transform={`rotate(-90, 15, ${padT + plotH / 2})`}
        className="fill-stone-800 text-[10.5px] font-serif"
      >
        {cfg.yLabel.replace(/\$/g, '')}
      </text>
    </svg>
  );
};
