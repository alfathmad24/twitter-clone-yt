import Head from "next/head";
import Image from "next/image";
import { getProviders, getSession, useSession } from "next-auth/react";

import Feed from "../components/Feed";
import Sidebar from "../components/Sidebar";
import Login from "../components/Login";
import Modal from "../components/Modal";
import { useRecoilState } from "recoil";
import { modalState } from "../atoms/modalAtom";
import Widgets from "../components/Widgets";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";

export default function HomePage(props) {
  const { trendingResults, followResults, providers } = props;

  const [userId, setUserId] = useState();
  const [users, setUsers] = useState([]);

  const [isOpen, setIsOpen] = useRecoilState(modalState);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      const users = [];
      const querySnapshot = await getDocs(query(collection(db, "users")));

      await querySnapshot.forEach((doc) => {
        users.push({ ...doc.data(), id: doc.id });
      });

      const userExist = await users.find(
        (user) => user.email === session?.user.email
      );

      setUserId(userExist?.id);
    };

    fetchUsers();
  }, [session, db]);

  useEffect(
    () =>
      onSnapshot(collection(db, "users"), (snapshot) =>
        setUsers(snapshot.docs)
      ),
    [db]
  );

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
        <Feed userId={userId} />
        {/* Widgets */}
        <Widgets
          trendingResults={trendingResults}
          followResults={users}
          id={session.user.uid}
        />
        {/* Modal */}
        {isOpen && <Modal />}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const trendingResults = await fetch("https://jsonkeeper.com/b/NKEV").then(
    (res) => res.json()
  );
  const followResults = await fetch("https://jsonkeeper.com/b/WWMJ").then(
    (res) => res.json()
  );

  const providers = await getProviders();
  const session = await getSession(context);

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session,
    },
  };
}
