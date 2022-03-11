import React, { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  CakeIcon,
  CalendarIcon,
  LocationMarkerIcon,
  SparklesIcon,
} from "@heroicons/react/outline";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Post from "./Post";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function Profile({ user, id, userFollowing, userFollowers }) {
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followed, setFollowed] = useState();
  const [userId, setUserId] = useState();

  const router = useRouter();

  const { data: session } = useSession();
  const { uid, email } = session.user;

  const followHandler = async () => {
    if (followed) {
      console.log(followed);
      await deleteDoc(doc(db, "users", userId, "following", user.uid));
      await deleteDoc(doc(db, "users", user.id, "followers", uid));
      return;
    }

    await setDoc(doc(db, "users", userId, "following", user.uid), user);
    await setDoc(doc(db, "users", user.id, "followers", uid), session.user);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const users = [];
      const querySnapshot = await getDocs(query(collection(db, "users")));

      await querySnapshot.forEach((doc) => {
        users.push({ ...doc.data(), id: doc.id });
      });

      const userExist = await users.find((user) => user.uid === uid);

      console.log(userExist.id);

      setUserId(userExist.id);
    };

    fetchUsers();
  }, [uid, db]);

  useEffect(
    () =>
      id &&
      onSnapshot(collection(db, "users", id, "followers"), (snapshot) =>
        setFollowers(snapshot.docs)
      ),
    [db, id]
  );

  useEffect(
    () =>
      userId &&
      onSnapshot(collection(db, "users", userId, "following"), (snapshot) =>
        setFollowing(snapshot.docs)
      ),
    [db, userId]
  );

  useEffect(
    () =>
      setFollowed(
        following.findIndex((follow) => follow.id === user.uid) !== -1
      ),
    [following]
  );

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "posts"), orderBy("timestamp", "desc")),
        (snapshot) => {
          setPosts(snapshot.docs);
        }
      ),
    [db]
  );

  return (
    <div className="flex-grow border-l border-r border-gray-700 max-w-[600px] sm:ml-[73px] xl:ml-[370px]">
      <div className="flex items-center px-1.5 py-1 border-b border-gray-700 text-[#d9d9d9] font-semibold text-xl gap-x-4 sticky top-0 z-50 bg-[#141d26]">
        <div
          className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0"
          onClick={() => router.push("/")}
        >
          <ArrowLeftIcon className="h-5 text-white" />
        </div>
        <div className="">
          <h2 className="text-lg sm:text-xl font-bold z-10">{user.name}</h2>
          <p className="text-[12px] text-[#6e767d]">5,840 Tweets</p>
        </div>
      </div>

      {/* PROFILE */}
      <div className="pb-10 border-b border-gray-700">
        <div className="">
          <img
            src="https://pbs.twimg.com/profile_banners/227211450/1577573999/1080x360"
            alt=""
          />
        </div>
        <div className="flex items-center justify-between p-3">
          <img
            src={user.image}
            alt={user.name}
            className="h-[130px] w-[130px] rounded-full -mt-20 border-4 border-[#141d26]"
          />
          {session.user.uid === user.uid ? (
            <button className="bg-transparent hover:bg-[#ffffff1a] rounded-full text-white font-semibold hover:text-white py-1.5 px-4 border border-blue">
              Edit Profile
            </button>
          ) : (
            <button
              className={`bg-white hover:bg-[#ececec] rounded-full text-[#141d26] font-semibold py-1.5 px-4 border border-blue ${
                followed &&
                "hover:bg-transparent hover:border-[red] hover:text-[red]"
              }`}
              onClick={followHandler}
            >
              {followed ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="text-white p-3">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-[#6e767d]">@{user.username}</p>
          <p className="my-4">Bio</p>
          <div className="flex justify-start items-center space-x-4 text-[#6e767d] text-[15px]">
            <div className="flex items-center justify-between space-x-2">
              <LocationMarkerIcon className="h-4" />
              <p>Jakarta Capital Region</p>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <CakeIcon className="h-5" />
              <p>Born August 24, 1997</p>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <CalendarIcon className="h-5" />
              <p>Joined December 2010</p>
            </div>
          </div>

          <div className="flex space-x-4 mt-4">
            <div className="flex space-x-1">
              <h2 className="font-bold">{userFollowing}</h2>
              <p className="text-[#6e767d]">Following</p>
            </div>
            <div className="flex space-x-1">
              <h2 className="font-bold">{userFollowers}</h2>
              <p className="text-[#6e767d]">Followers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-72">
        {posts.map(
          (post) =>
            post.data().id === user.uid && (
              <Post key={post.id} id={post.id} post={post.data()} />
            )
        )}
      </div>
    </div>
  );
}

export default Profile;
