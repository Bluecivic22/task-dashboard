import { Layer, Circle, Group, Line, Rect, Stage, Text } from 'react-konva';
import { useRadar } from '../context/RadarContext.jsx';
import { heatColor } from '../utils/colorMap.js';

export default function RadarView() {
  const { spatial, nodes, presence } = useRadar();
  const width = 760;
  const height = 420;
  const scale = 40;

  return (
    <div className="radar-view">
      <h2 className="gold-text">Room Activity View</h2>
      <Stage width={width} height={height} draggable>
        <Layer>
          {Array.from({ length: 20 }, (_, index) => (
            <Group key={index}>
              <Line points={[index * 40, 0, index * 40, height]} stroke="rgba(201,168,76,0.14)" />
              <Line points={[0, index * 20, width, index * 20]} stroke="rgba(201,168,76,0.14)" />
            </Group>
          ))}
          <Rect x={20} y={20} width={width - 40} height={height - 40} stroke="#c9a84c" />
          {spatial.cells?.map((cell, index) => (
            <Rect
              key={`${cell.x}-${cell.y}-${index}`}
              x={20 + cell.x * scale}
              y={20 + cell.y * scale}
              width={18}
              height={18}
              fill={heatColor(cell.activity_score || cell.value || 0, 0.45)}
            />
          ))}
          {nodes.map((node) => (
            <Group key={node.id} x={20 + node.x * scale} y={20 + node.y * scale}>
              <Circle radius={8} fill="#c9a84c" />
              <Circle radius={28} stroke="rgba(201,168,76,0.2)" dash={[4, 4]} />
              <Text text={node.name} y={10} fill="#e8c96a" fontSize={12} />
            </Group>
          ))}
          <Circle x={20 + (presence.estimated_x || 0) * scale} y={20 + (presence.estimated_y || 0) * scale} radius={10} fill="rgba(232,122,58,0.8)" />
          <Text text="N" x={width - 28} y={10} fill="#e8c96a" />
          <Line points={[width - 20, 28, width - 20, 48]} stroke="#e8c96a" strokeWidth={2} />
        </Layer>
      </Stage>
      <div className="radar-meta">Scale: 1 cell ≈ 0.5 m · Confidence visualized as opacity</div>
    </div>
  );
}
