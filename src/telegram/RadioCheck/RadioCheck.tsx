import "./radioCheck.css";

export default function RadioCheck({
  name,
  value,
  defaultChecked,
}: {
  name: string;
  value: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="radio-check">
      <input
        type="radio"
        name={name}
        id={name}
        value={value}
        defaultChecked={defaultChecked}
      />
      <div className="check-mark">✓</div>
    </div>
  );
}
