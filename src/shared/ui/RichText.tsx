import React from 'react';

const INLINE_MARKUP = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

export const RichText: React.FC<{ text: string }> = ({ text }) => (
  <div className="whitespace-pre-line">
    {text.split(INLINE_MARKUP).map((part, index) => {
      if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.length > 1) return <em key={index}>{part.slice(1, -1)}</em>;
      return <React.Fragment key={index}>{part}</React.Fragment>;
    })}
  </div>
);
