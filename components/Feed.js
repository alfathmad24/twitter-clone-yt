import React, { useEffect, useState, useRef } from "react";
import { SparklesIcon } from "@heroicons/react/outline";
import Input from "./Input";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import Post from "./Post";
import { useSession } from "next-auth/react";

function Feed({ userId }) {
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [newPosts, setNewPosts] = useState([]);
  const [stuck, setStuck] = useState(false);
  const [newStuck, setNewStuck] = useState([]);

  const prevPostsRef = useRef();

  const { data: session } = useSession();
  const { uid } = session.user;

  // const filterByReference = (arr1, arr2) => {
  //   let res = [];
  //   res = arr1.filter((el) => {
  //     return !arr2.find((element) => {
  //       return element.data().id === el.data().id;
  //     });
  //   });
  //   return res;
  // };

  // useEffect(() => {
  //   const newStucks = filterByReference(newPosts, posts);
  //   setNewStuck(newStucks);
  //   const newStucksFilter = newStucks.filter(
  //     (stuck) => stuck.data().id === session.user.uid
  //   );
  //   // if (newStucksFilter.length > 0) {
  //   //   setPosts([...posts, ...newStucksFilter]);
  //   // }
  //   return newStucks;
  // }, [newPosts, posts]);

  // useEffect(() => {
  //   prevPostsRef.current = posts;
  // }, [posts]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "posts"), orderBy("timestamp", "desc")),
      async (snapshot) => {
        const results = snapshot.docs;
        // const filtered = results.filter((result) =>
        //   following.includes(result.data().id)
        // );
        // const myTweet = results.filter(
        //   (result) => result.data().id === session.user.uid
        // );
        // if (!stuck) {
        //   setPosts(results);
        //   setStuck(true);
        //   return;
        // }
        setPosts(results);
      }
    );
    return unsubscribe;
  }, [stuck, posts]);

  useEffect(
    () =>
      userId &&
      onSnapshot(collection(db, "users", userId, "following"), (snapshot) => {
        const results = snapshot.docs;
        const filter = results.map((result) => result.data().uid);
        filter.push(uid);
        setFollowing(filter);
      }),
    [db, userId]
  );

  return (
    <div className="flex-grow border-l border-r border-gray-700 max-w-[600px] sm:ml-[73px] xl:ml-[370px]">
      <div className="text-white flex items-center sm:justify-between py-2 px-3 sticky top-0 z-10 border-b border-gray-700 bg-[#141d26]">
        <h2 className="text-lg sm:text-xl font-bold z-10">Home</h2>
        <div className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 ml-auto">
          <SparklesIcon className="h-5 text-white" />
        </div>
      </div>
      <Input />
      {/* <div className="py-4 bg-white">
        <p>New post: {newStuck.length}</p>
      </div> */}
      <div className="pb-72">
        {posts.map((post) => (
          <Post key={post.id} id={post.id} post={post.data()} />
        ))}
      </div>
    </div>
  );
}

export default Feed;
