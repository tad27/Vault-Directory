import React from 'react';

interface Props {
  text: string;
  query: string;
  className?: string;
}

export const SearchHighlight: React.FC<Props> = ({ text, query, className = '' }) => {
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${cleanQuery})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark
            key={index}
            className="bg-amber-300 dark:bg-amber-500/30 text-amber-950 dark:text-amber-200 px-0.5 rounded-sm font-semibold"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};
