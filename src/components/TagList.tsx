export function TagList({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className="tag tag-default">{tag}</span>
      ))}
    </div>
  );
}
