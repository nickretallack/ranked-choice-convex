import { useCallback, useEffect, useState } from "react";
import {
  Authenticated,
  Unauthenticated,
  useAction,
  useConvex,
} from "convex/react";
import { api } from "@convex/_generated/api";
import Telegram from "@twa-dev/sdk";
import { useNavigate } from "react-router";
import { useUser, useSignIn } from "@clerk/clerk-react";

export default function Start() {
  const validateUser = useAction(api.telegram.actions.validateUser);
  const [loading, setLoading] = useState<boolean>(false);
  const { signIn, setActive } = useSignIn();
  const { user } = useUser();

  const signInHandler = useCallback(() => {
    if (!signIn || !setActive || user || loading) {
      return;
    }
    const createSignIn = async () => {
      setLoading(true);
      try {
        const token = await validateUser({
          initData: Telegram.initData,
        });

        // Create the `SignIn` with the token
        const signInAttempt = await signIn.create({
          strategy: "ticket",
          ticket: token,
        });

        // If the sign-in was successful, set the session to active
        if (signInAttempt.status === "complete") {
          setActive({
            session: signInAttempt.createdSessionId,
          });
          console.log("HOORAY");
        } else {
          // If the sign-in attempt is not complete, check why.
          // User may need to complete further steps.
          console.error(JSON.stringify(signInAttempt, null, 2));
        }
      } catch (err) {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.error("Error:", JSON.stringify(err, null, 2));
      } finally {
        setLoading(false);
      }
    };

    createSignIn().catch(console.error);
  }, [signIn, setActive, user, loading, validateUser]);

  return <button onClick={signInHandler}>Sign in</button>;
  // if (!user) {
  //   return null;
  // }

  // if (loading) {
  //   return <div>Signing you in...</div>;
  // }

  // return <div>Signed in as {user.id}</div>;
}

// export function A() {
//   const validateUser = useAction(api.telegram.actions.validateUser);
//   const navigate = useNavigate();
//   const { signIn, setActive } = useSignIn();

//   const convex = useConvex();

//   const [isInvalid, setIsInvalid] = useState(false);
//   // useEffect(() => {
//   //   // const handler = async () => {
//   // convex.setAuth(
//   //   async () => await validateUser({ initData: Telegram.initData }),
//   //   (isAuthenticated) => {
//   //     console.log("isAuthenticated", isAuthenticated);
//   //     if (isAuthenticated) {
//   //       const pollId = Telegram.initDataUnsafe.start_param;
//   //       navigate(`/telegram/poll/${pollId}`) as void;
//   //     } else {
//   //       setIsInvalid(true);
//   //     }
//   //   },
//   //   );
//   // }, [convex, navigate, validateUser]);

//   return (
//     <div>
//       <button
//         onClick={() => {
//           // const token = await validateUser({ initData: Telegram.initData });
//           // const token =
//           //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqczdiMDhreGpuMDlrOXpxczY1cTBxc3c2OTc2aDFnMSIsImF1ZCI6ImNvbnZleCIsIm5hbWUiOiJTcXVpcmJvICIsInBpY3R1cmUiOiJodHRwczovL3QubWUvaS91c2VycGljLzMyMC9PVEhVZkVucjlsZmJ1S2NFRTBmejNJb0dJSHJLdVJNQ0NjOUl4RkNkRnN3LnN2ZyIsIm5pY2tuYW1lIjoiU3F1aXJibyIsImdpdmVuX25hbWUiOiJTcXVpcmJvIiwiZmFtaWx5X25hbWUiOiIifQ.YG1H81TddeFL-XVrnGmVM9QSQc72m4nwtDULQVd6G34";
//           // console.log("token", token);

//           validateUser({
//             initData: Telegram.initData,
//           }).then(
//             async (token) => {
//               const signInAttempt = await signIn!.create({
//                 strategy: "ticket",
//                 ticket: token,
//               });

//               console.log("token", token);

//               convex.setAuth(
//                 async () => {
//                   return token;
//                   // const token = await validateUser({
//                   //   initData: Telegram.initData,
//                   // });
//                   // console.log("token", token);
//                   // return token;
//                 },
//                 (isAuthenticated) => {
//                   console.log("isAuthenticated", isAuthenticated);
//                   if (isAuthenticated) {
//                     const pollId = Telegram.initDataUnsafe.start_param;
//                     navigate(`/telegram/poll/${pollId}`) as void;
//                   } else {
//                     setIsInvalid(true);
//                   }
//                 },
//               );
//             },
//             (error) => console.error(error),
//           );
//         }}
//       >
//         Auth
//       </button>
//       {isInvalid ? "Invalid telegram user details." : "Just a moment..."}

//       <Authenticated>Yes </Authenticated>
//       <Unauthenticated>No</Unauthenticated>
//     </div>
//   );
// }
