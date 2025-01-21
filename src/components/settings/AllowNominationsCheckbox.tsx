export default function AllowNominationsCheckbox({
  value,
}: {
  value: boolean;
}) {
  return (
    <div className="control">
      <label htmlFor="allowNominations">
        <input
          name="allowNominations"
          type="checkbox"
          id="allowNominations"
          defaultChecked={value}
        />
        Allow voters to nominate new candidates.
      </label>
    </div>
  );
}
