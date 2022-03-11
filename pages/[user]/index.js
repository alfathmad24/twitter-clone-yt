import Head from "next/head";
import Image from "next/image";
import { getProviders, getSession, useSession } from "next-auth/react";

import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
// import { useRecoilState } from "recoil";
// import { modalState } from "../atoms/modalAtom";
import Widgets from "../../components/Widgets";
import Profile from "../../components/Profile";
import Login from "../../components/Login";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebase";

export default function UserPage(props) {
  const {
    trendingResults,
    followResults,
    providers,
    user,
    userFollowing,
    userFollowers,
  } = props;

  // const [isOpen, setIsOpen] = useRecoilState(modalState);

  const { data: session } = useSession();

  if (!session) return <Login providers={providers} />;

  return (
    <div className="">
      <Head>
        <title>Twitter</title>
        <meta name="description" content="Twitter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-[#141d26] min-h-screen flex max-w-[1400px] mx-auto">
        {/* Sidebar */}
        <Sidebar />
        {/* Feed */}
        <Profile
          user={user}
          id={user.id}
          userFollowing={userFollowing}
          userFollowers={userFollowers}
        />
        {/* Widgets */}
        {/* <Widgets
          trendingResults={trendingResults}
          followResults={followResults}
        /> */}
        {/* Modal */}
        {/* {isOpen && <Modal />} */}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;

  const username = params.user;

  // const trendingResults = await fetch("https://jsonkeeper.com/b/NKEV").then(
  //   (res) => res.json()
  // );
  // const followResults = await fetch("https://jsonkeeper.com/b/WWMJ").then(
  //   (res) => res.json()
  // );

  const users = [];

  const querySnapshot = await getDocs(collection(db, "users"));

  querySnapshot.forEach((doc) => {
    users.push({ ...doc.data(), id: doc.id });
  });

  const user = users.find((user) => user.username === username);

  const userFollowing = await getDocs(
    collection(db, "users", user.id, "following")
  );
  const userFollowers = await getDocs(
    collection(db, "users", user.id, "followers")
  );

  const providers = await getProviders();
  const session = await getSession(context);

  return {
    props: {
      // trendingResults,
      // followResults,
      providers,
      session,
      user,
      userFollowing: userFollowing.docs.length,
      userFollowers: userFollowers.docs.length,
    },
  };
}
