import { CandidateNomination } from "@/components/CandidateNomination";
import { Handle } from "@/components/dndkit/Item";
import {
  Items,
  MultipleContainers,
} from "@/components/dndkit/MultipleContainers";
import Loading from "@/components/Loading";

import PollPage from "@/components/PollPage";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { indexByUniqueIdentifier } from "@convex/util/indexByUniqueIdentifier";
import { BottomBar, MainButton, SecondaryButton } from "@twa-dev/sdk/react";
import classNames from "classnames";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";

export default function VotePageLoader() {
  const { poll } = useOutletContext<{ poll: Doc<"poll"> }>();
  const candidates = useQuery(api.candidate.list, { pollId: poll._id });
  const ranking = useQuery(api.ballot.get, { pollId: poll._id });
  const { user } = useUser();

  if (candidates === undefined || ranking === undefined) return <Loading />;

  return (
    <VotePage
      poll={poll}
      candidates={candidates}
      ranking={ranking}
      user={user}
    />
  );
}

function VotePage({
  poll,
  candidates,
  ranking,
  user,
}: {
  poll: Doc<"poll">;
  candidates: Doc<"candidate">[];
  ranking: Id<"candidate">[];
  user: ReturnType<typeof useUser>["user"];
}) {
  console.log("user", user);
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
    <PollPage poll={poll}>
      <MultipleContainers
        items={items}
        setItems={setItems}
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
          <>
            <div className="main-section">{containerViews["ranking"]}</div>
            <div className="candidates">
              <div className="section-header">Candidates</div>
              {containerViews["candidates"]}
              {poll.allowNominations && (
                <CandidateNomination
                  pollId={poll._id}
                  candidateMap={candidateMap}
                  scrollToCandidate={scrollToCandidate}
                />
              )}
            </div>
          </>
        )}
      </MultipleContainers>
      <BottomBar>
        {poll.closed ? (
          <SecondaryButton
            text="This poll is closed"
            textColor="#808080"
            disabled
          />
        ) : (
          <MainButton text="Submit Vote" onClick={submitVote} />
        )}
      </BottomBar>
    </PollPage>
  );
}
