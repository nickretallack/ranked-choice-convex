// import "./settings.css";

import RadioCheck from "@/telegram/RadioCheck/RadioCheck";

export default function LiveResultsCheckbox({
  value = true,
}: {
  value?: boolean;
}) {
  return (
    <div>
      <div className="section-header">Show results</div>
      <div className="panel left">
        <label>
          <RadioCheck
            name="liveResults"
            value="on"
            defaultChecked={value == true}
          />
          <div>Live</div>
        </label>
        <label>
          <RadioCheck
            name="liveResults"
            value="off"
            defaultChecked={value == false}
          />
          <div>When the poll is closed</div>
        </label>
      </div>
    </div>
  );
}
