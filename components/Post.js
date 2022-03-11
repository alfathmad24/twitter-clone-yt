import {
  ChartBarIcon,
  ChatIcon,
  DotsHorizontalIcon,
  HeartIcon,
  ShareIcon,
  SwitchHorizontalIcon,
  TrashIcon,
  RefreshIcon,
} from "@heroicons/react/outline";
import {
  HeartIcon as HeartIconFilled,
  ChatIcon as ChatIconFilled,
} from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import Moment from "react-moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { modalState, postIdState } from "../atoms/modalAtom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import moment from "moment";
import { deleteObject, ref } from "firebase/storage";

function Post({ id, post, postPage }) {
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const [postId, setPostId] = useRecoilState(postIdState);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [liked, setLiked] = useState(false);

  const router = useRouter();
  const { statusId } = router.query;

  useEffect(
    () =>
      onSnapshot(collection(db, "posts", id, "comments"), (snapshot) =>
        setComments(snapshot.docs)
      ),
    [db, id]
  );

  useEffect(
    () =>
      onSnapshot(collection(db, "posts", id, "likes"), (snapshot) =>
        setLikes(snapshot.docs)
      ),
    [db, id]
  );

  useEffect(
    () =>
      setLiked(likes.findIndex((like) => like.id === session.user.uid) !== -1),
    [likes]
  );

  const deletePost = async () => {
    const imageRef = ref(storage, post.image);

    if (post.image) {
      deleteObject(imageRef);
    }

    deleteDoc(doc(db, "posts", id));
    router.push("/");
  };

  const likePost = async () => {
    if (liked) {
      await deleteDoc(doc(db, "posts", id, "likes", session.user.uid));
      return;
    }
    await setDoc(doc(db, "posts", id, "likes", session.user.uid), {
      username: session.user.username,
    });
  };

  return (
    <div
      className={`p-3 flex ${
        !postPage &&
        "cursor-pointer border-b border-gray-700 hover:bg-[#696969] hover:bg-opacity-10 transition duration-300 ease-out"
      }`}
      onClick={() => router.push(`/${post.username}/status/${id}`)}
    >
      {!postPage && (
        <img
          src={post.userImage}
          alt={post.name}
          className="h-11 w-11 rounded-full mr-4"
        />
      )}
      <div className="flex flex-col space-y-2 w-full">
        <div className={`flex ${!postPage && "justify-between"}`}>
          {postPage && (
            <img
              src={post.userImage}
              alt={post.name}
              className="h-11 w-11 rounded-full mr-4"
            />
          )}
          <div className="text-[#6e767d]">
            <div className="inline-block group">
              <h4
                className={`font-bold text-[15px] sm:text-base text-[#ffff] group-hover:underline z-20 ${
                  !postPage && "inline-block"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/${post.username}`);
                }}
              >
                {post.name}
              </h4>
              <span
                className={`text-sm sm:text-[15px] ${!postPage && "ml-1.5"}`}
              >
                @{post.username}
              </span>
            </div>{" "}
            ·{" "}
            <span className="hover:underline text-sm sm:text-[15px]">
              <Moment fromNow>{post.timestamp?.toDate()}</Moment>
            </span>
            {!postPage && (
              <p className="text-[#ffff] text-[15px] sm:text-base mt-0.5">
                {post.text}
              </p>
            )}
          </div>
          <div className="icon group flex-shrink-0 ml-auto">
            <DotsHorizontalIcon className="h-5 text-[#6e767d] group-hover:text-[#1d9bf0]" />
          </div>
        </div>

        {postPage && (
          <div className="">
            <p className="text-[#ffff] text-[22px] mt-0.5">{post.text}</p>
            <div className="text-[#6e767d] mt-4">
              <span className="cursor-pointer hover:underline">
                {moment(new Date(post.timestamp.toDate())).format(
                  "hh:mm A · MMM DD, YYYY"
                )}
              </span>{" "}
              · <span>Twitter for iPhone</span>
            </div>
          </div>
        )}

        {post.image && (
          <div className="mr-2 mt-4">
            <img
              src={post.image}
              alt=""
              className="rounded-2xl max-h-[700px] w-full object-cover"
            />
          </div>
        )}

        {postPage && (
          <div className="border-y border-gray-700 text-[#6e767d]">
            <div className="py-4 flex space-x-4 justify-start ">
              {comments.length > 0 && (
                <div className="flex">
                  <span className="font-bold text-white mr-2">
                    {comments.length}
                  </span>
                  <p>Retweets</p>
                </div>
              )}
              <div className="flex">
                <span className="font-bold text-white mr-2">1</span>
                <p>Quote Tweet</p>
              </div>
              {likes.length > 0 && (
                <div className="flex">
                  <span className="font-bold text-white mr-2">
                    {likes.length}
                  </span>
                  <p>Likes</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIONS TWEET START */}
        <div
          className={`${postPage && "border-b border-gray-700 text-[#6e767d]"}`}
        >
          <div
            className={`text-[#6e767d] flex justify-between w-10/12 ${
              postPage && "mx-auto pb-1.5"
            }`}
          >
            {/* MENTION */}
            <div
              className="flex items-center space-x-1 group"
              onClick={(e) => {
                e.stopPropagation();
                setPostId(id);
                setIsOpen(true);
              }}
            >
              <div className="icon group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10">
                <ChatIcon className="h-5 group-hover:text-[#1d9bf0]" />
              </div>
              {comments.length > 0 && !postPage && (
                <span className="group-hover:text-[#1d9bf0] text-sm">
                  {comments.length}
                </span>
              )}
            </div>

            {/* RETWEET */}
            <div className="flex items-center space-x-1 group">
              <div className="icon group-hover:bg-green-500/10">
                <RefreshIcon className="h-5 group-hover:text-green-500" />
              </div>
            </div>

            {/* LIKE */}
            <div
              className="flex items-center space-x-1 group"
              onClick={(e) => {
                e.stopPropagation();
                likePost();
              }}
            >
              <div className="icon group-hover:bg-pink-600/10">
                {liked ? (
                  <HeartIconFilled className="h-5 text-pink-600" />
                ) : (
                  <HeartIcon className="h-5 group-hover:text-pink-600" />
                )}
              </div>
              {likes.length > 0 && !postPage && (
                <span
                  className={`group-hover:text-pink-600 text-sm ${
                    liked && "text-pink-600"
                  }`}
                >
                  {likes.length}
                </span>
              )}
            </div>

            {/* SHARE */}
            <div className="icon group">
              <ShareIcon className="h-5 group-hover:text-[#1d9bf0]" />
            </div>
            {/* BAR */}
            <div className="icon group">
              <ChartBarIcon className="h-5 group-hover:text-[#1d9bf0]" />
            </div>
            {/* DELETE */}
            {session.user.uid === post.id && (
              <div
                className="flex items-center space-x-1 group"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePost();
                }}
              >
                <div className="icon group-hover:bg-red-600/10">
                  <TrashIcon className="h-5 group-hover:text-red-600" />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ACTIONS TWEET END */}
      </div>
    </div>
  );
}

export default Post;
