import { Handle } from "@/components/dndkit/Item";
import {
  Items,
  MultipleContainers,
} from "@/components/dndkit/MultipleContainers";

import PollNav from "@/components/PollNav";
import PollPage from "@/components/PollPage";
import { indexByUniqueIdentifier } from "@/util/indexByUniqueIdentifier";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import Telegram from "@twa-dev/sdk";
import classNames from "classnames";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

export default function VotePageLoader() {
  const pollId = useParams().pollId! as Id<"poll">;
  const poll = useQuery(api.poll.get, { id: pollId });
  const candidates = useQuery(api.candidate.list, { pollId });
  const ranking = useQuery(api.ballot.get, { pollId });
  const { user } = useUser();

  if (!(poll && candidates && ranking)) return null;

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

  // const scrollToCandidate = useCallback((candidateId: Id<"candidate">) => {
  //   const element = document.querySelector(
  //     `[data-candidate-id="${candidateId}"]`,
  //   );
  //   if (element) {
  //     element.scrollIntoView({ behavior: "smooth" });
  //     element.classList.add("highlight-candidate");
  //     setTimeout(() => {
  //       element.classList.remove("highlight-candidate");
  //     }, 1500); // Remove class after animation completes
  //   }
  // }, []);

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
  }, [candidates]);

  const submitVote = useCallback(() => {
    saveBallot({
      pollId: poll._id,
      ranking: items.ranking as Id<"candidate">[],
    }).catch((error) => {
      console.error("Error saving ballot", error);
    });
  }, [items.ranking, poll._id, saveBallot]);

  useEffect(() => {
    Telegram?.MainButton.show().setText("Submit Vote");
    return () => {
      Telegram?.MainButton.hide();
    };
  }, []);

  useEffect(() => {
    Telegram?.MainButton.onClick(submitVote);
    return () => {
      Telegram?.MainButton.offClick(submitVote);
    };
  }, [submitVote]);

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
            className={classNames(classes)}
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
            <div className="main-section">
              <PollNav poll={poll} personId={user?.externalId} />
              {containerViews["ranking"]}
            </div>
            <div className="candidates">
              <h2>Candidates</h2>
              {containerViews["candidates"]}
              {/* <CandidateNomination
                pollId={poll.id}
                candidateMap={candidateMap}
                scrollToCandidate={scrollToCandidate}
              /> */}
            </div>
          </>
        )}
      </MultipleContainers>
    </PollPage>
  );
}
