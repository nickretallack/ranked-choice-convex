export default function PollTitleField({ value = "" }: { value?: string }) {
  return (
    <div className="panel">
      <div>
        <input
          className="text-input"
          name="title"
          placeholder="Poll Name"
          defaultValue={value}
          required
        />
      </div>
    </div>
  );
}
