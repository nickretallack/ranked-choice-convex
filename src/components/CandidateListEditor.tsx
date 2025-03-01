import { useEffect, useRef } from "react";

type Props = {
  candidates: string[];
  setCandidates: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function CandidatesListEditor({
  candidates,
  setCandidates,
}: Props) {
  const focusIndexRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update refs array when candidates change
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, candidates.length);
    console.log(inputRefs.current, focusIndexRef.current);

    // Focus the new input if focusIndexRef is set
    if (
      focusIndexRef.current !== null &&
      inputRefs.current[focusIndexRef.current]
    ) {
      inputRefs.current[focusIndexRef.current]?.focus();
      focusIndexRef.current = null;
    }
  }, [candidates]); // Now triggered when candidates array changes

  return (
    <div className="candidates-editor">
      <div className="section-header">Candidates</div>
      <div className="panel left">
        {candidates.map((candidate, index) => (
          <div key={index}>
            <button
              className="delete-button"
              type="button"
              onClick={(event) => {
                console.log(index);
                event.preventDefault();
                focusIndexRef.current = index + 1;
                setCandidates((candidates) => candidates.toSpliced(index, 1));
              }}
            >
              x
            </button>

            <input
              placeholder="Someone..."
              className="text-input"
              ref={(el) => (inputRefs.current[index] = el)}
              name="candidate"
              value={candidate}
              onChange={(event) => {
                setCandidates((candidates) => {
                  const newCandidates = [...candidates];
                  newCandidates[index] = event.target.value;
                  return newCandidates;
                });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  focusIndexRef.current = index + 1;
                  setCandidates((candidates) =>
                    candidates.toSpliced(index + 1, 0, ""),
                  );
                  setTimeout(() => {});
                }
              }}
            />
          </div>
        ))}

        <button
          type="button"
          className="add-button"
          onClick={(event) => {
            event.preventDefault();
            focusIndexRef.current = candidates.length;
            setCandidates((candidates) => [...candidates, ""]);
          }}
        >
          <div className="add-button-icon">+</div>
          <div>Nominate a Candidate</div>
        </button>
      </div>
    </div>
  );
}
