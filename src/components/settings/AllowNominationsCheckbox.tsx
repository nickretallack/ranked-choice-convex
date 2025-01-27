import Toggle from "@/telegram/Toggle/Toggle";

export default function AllowNominationsCheckbox({
  value = false,
}: {
  value?: boolean;
}) {
  return (
    <div className="panel">
      <label className="row">
        <span>Voters can nominate candidates</span>
        <Toggle name="allowNominations" defaultChecked={value} />
      </label>
    </div>
  );
}
