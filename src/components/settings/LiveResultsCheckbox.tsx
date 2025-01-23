export default function LiveResultsCheckbox({
  value = true,
}: {
  value?: boolean;
}) {
  return (
    <div className="control">
      <label htmlFor="liveResults">
        <input
          name="liveResults"
          type="checkbox"
          id="liveResults"
          defaultChecked={value}
        />
        Show live results in Telegram.
      </label>
    </div>
  );
}
