import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import ConversationChunk from './ConversationChunk';

interface VirtualizedChunkListProps {
  chunks: any[];
  height: number;
  itemHeight: number;
  onFollowUp: (chunk: any) => void;
  onPinToThread: (chunk: any) => void;
  onSeeContext: (chunk: any) => void;
}

export default function VirtualizedChunkList({
  chunks,
  height,
  itemHeight,
  onFollowUp,
  onPinToThread,
  onSeeContext
}: VirtualizedChunkListProps) {
  const ChunkItem = useMemo(() => {
    return ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const chunk = chunks[index];
      
      return (
        <div style={style}>
          <div className="px-4 py-2">
            <ConversationChunk
              chunk={chunk}
              onFollowUp={onFollowUp}
              onPinToThread={onPinToThread}
              onSeeContext={onSeeContext}
            />
          </div>
        </div>
      );
    };
  }, [chunks, onFollowUp, onPinToThread, onSeeContext]);

  if (chunks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No chunks to display</p>
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={chunks.length}
      itemSize={itemHeight}
      className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
    >
      {ChunkItem}
    </List>
  );
}