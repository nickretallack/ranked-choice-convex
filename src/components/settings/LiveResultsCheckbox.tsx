import "./settings.css";

export default function LiveResultsCheckbox({
  value = true,
}: {
  value?: boolean;
}) {
  return (
    <div>
      <div className="section-header">Show results</div>
      <div className="settings-list">
        <label className="settings-option">
          <input
            type="radio"
            name="liveResults"
            value="true"
            defaultChecked={value}
          />
          <div className="check-mark">✓</div>
          <div className="option-content">
            <div className="option-title">Live</div>
          </div>
        </label>
        <label className="settings-option">
          <input type="radio" name="liveResults" value="false" />
          <div className="check-mark">✓</div>
          <div className="option-content">
            <div className="option-title">When the poll is closed</div>
          </div>
        </label>
      </div>
    </div>
  );
}
