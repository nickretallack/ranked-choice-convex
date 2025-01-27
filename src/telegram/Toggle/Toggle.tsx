import "./toggle.css";

const Toggle = ({
  name,
  defaultChecked,
  onChange,
}: {
  name: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) => (
  <label className="tg-switch">
    <input
      type="checkbox"
      name={name}
      defaultChecked={defaultChecked}
      onChange={(e) => onChange?.(e.target.checked)}
    />
    <span className="tg-switch-slider" />
  </label>
);

export default Toggle;
