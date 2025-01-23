export default function PollTitleField({ value = "" }: { value?: string }) {
  return (
    <div className="form-control">
      <label htmlFor="title">Title</label>
      <input
        name="title"
        id="title"
        defaultValue={value}
        required
        // aria-invalid={errors?.title ? "true" : "false"}
      />
      {/* {errors?.title && <p className="error">{errors.title}</p>} */}
    </div>
  );
}
