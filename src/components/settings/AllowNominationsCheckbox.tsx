import Toggle from "@/telegram/Toggle/Toggle";

export default function AllowNominationsCheckbox({
  value = false,
}: {
  value?: boolean;
}) {
  return (
    <div>
      <div className="section-header">Nominations</div>
      <div className="panel right">
        <div>
          Voters can nominate candidates
          <Toggle name="allowNominations" defaultChecked={value} />
        </div>
      </div>
    </div>
  );
}
