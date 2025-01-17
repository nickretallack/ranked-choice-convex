export default function recordIncrement<Key extends string | number | symbol>(
  record: Record<Key, number>,
  key: Key,
) {
  const value = record[key] || 0;
  record[key] = value + 1;
}
