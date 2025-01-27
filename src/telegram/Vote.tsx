import { CandidateNomination } from "@/components/CandidateNomination";
import { Handle } from "@/components/dndkit/Item";
import {
  Items,
  MultipleContainers,
} from "@/components/dndkit/MultipleContainers";
import Loading from "@/components/Loading";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { indexByUniqueIdentifier } from "@convex/util/indexByUniqueIdentifier";
import { BottomBar, MainButton, SecondaryButton } from "@twa-dev/sdk/react";
import classNames from "classnames";
import { useMutation, useQuery } from "convex/react";
import { isEqual } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import { PollContext } from "./Layout";

export default function VotePageLoader() {
  const { poll } = useOutletContext<PollContext>();
  const candidates = useQuery(api.candidate.list, { pollId: poll._id });
  const ranking = useQuery(api.ballot.get, { pollId: poll._id });

  if (candidates === undefined || ranking === undefined) return <Loading />;

  return <VotePage poll={poll} candidates={candidates} ranking={ranking} />;
}

function VotePage({
  poll,
  candidates,
  ranking,
}: {
  poll: Doc<"poll">;
  candidates: Doc<"candidate">[];
  ranking: Id<"candidate">[];
}) {
  const saveBallot = useMutation(api.ballot.save);

  const [items, setItems] = useState<Items>(() => {
    const rankingSet = new Set(ranking);
    return {
      ranking,
      candidates: candidates
        .map((candidate) => candidate._id)
        .filter((candidateId) => !rankingSet.has(candidateId)),
    };
  });

  const yourNewNominationIds = useRef<Id<"candidate">[]>([]);
  const scrollToCandidate = useCallback((candidateId: Id<"candidate">) => {
    const element = document.querySelector(
      `[data-candidate-id="${candidateId}"]`,
    );
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      element.classList.add("highlight-candidate");
      setTimeout(() => {
        element.classList.remove("highlight-candidate");
      }, 1500); // Remove class after animation completes
    } else {
      yourNewNominationIds.current.push(candidateId);
    }
  }, []);

  // When new candidates are added, index them and add them to DNDKit's state
  const candidateMap = useRef(indexByUniqueIdentifier(candidates));
  useEffect(() => {
    const newCandidates = [] as Id<"candidate">[];
    for (const candidate of candidates) {
      if (!candidateMap.current.has(candidate._id)) {
        candidateMap.current.set(candidate._id, candidate);
        newCandidates.push(candidate._id);
      }
    }
    setItems((items) => ({
      ...items,
      candidates: [...items.candidates, ...newCandidates],
    }));

    // Highlight your new nominations after the DOM has updated
    requestAnimationFrame(() => {
      const yourNewNominationIdsCopy = [...yourNewNominationIds.current];
      yourNewNominationIds.current = [];
      for (const candidateId of yourNewNominationIdsCopy) {
        scrollToCandidate(candidateId);
      }
    });
  }, [candidates, scrollToCandidate]);

  const submitVote = useCallback(() => {
    saveBallot({
      pollId: poll._id,
      ranking: items.ranking as Id<"candidate">[],
    }).catch((error) => {
      console.error("Error saving ballot", error);
    });
  }, [items.ranking, poll._id, saveBallot]);

  return (
    <>
      <MultipleContainers
        items={items}
        setItems={setItems}
        containerFallbacks={{
          ranking: (
            <div className="fallback">Drag candidates here to vote.</div>
          ),
          candidates: (
            <div className="fallback">
              Drag candidates here if you don't want to vote for them.
            </div>
          ),
        }}
        renderItem={({
          value,
          listeners,
          ref,
          style,
          classes,
          handleProps,
          index,
          containerId,
        }) => (
          <li
            className={classNames(classes, "ranking-item")}
            style={style}
            ref={ref as React.RefObject<HTMLLIElement>}
            data-cypress="draggable-item"
            data-candidate-id={value}
          >
            <Handle
              {...handleProps}
              {...listeners}
              index={containerId == "ranking" ? index! + 1 : null}
            />
            {candidateMap.current.get(value)!.name}
          </li>
        )}
      >
        {({ containerViews }) => (
          <div className="vote-split">
            <div className="ranking">{containerViews["ranking"]}</div>
            <div className="candidates">
              <div className="section-header">Candidates</div>
              {containerViews["candidates"]}
            </div>
          </div>
        )}
      </MultipleContainers>
      {poll.allowNominations && (
        <CandidateNomination
          pollId={poll._id}
          candidateMap={candidateMap}
          scrollToCandidate={scrollToCandidate}
        />
      )}

      <BottomBar>
        {poll.closed ? (
          <SecondaryButton
            text="This poll is closed"
            textColor="#808080"
            disabled
          />
        ) : items.ranking.length > 0 ? (
          isEqual(ranking, items.ranking) ? (
            <MainButton text="Voted" disabled color="#808080" />
          ) : ranking.length > 0 ? (
            <MainButton text="Update Vote" onClick={submitVote} />
          ) : (
            <MainButton text="Vote" onClick={submitVote} />
          )
        ) : ranking.length > 0 ? (
          <MainButton text="Withdraw Vote" onClick={submitVote} />
        ) : (
          <MainButton text="Vote" disabled color="#808080" />
        )}
      </BottomBar>
    </>
  );
}
