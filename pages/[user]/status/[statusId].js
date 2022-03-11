import {
  updateDoc,
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "@firebase/firestore";
import {
  CalendarIcon,
  ChartBarIcon,
  EmojiHappyIcon,
  PhotographIcon,
  XIcon,
} from "@heroicons/react/outline";
import { getProviders, getSession, useSession } from "next-auth/react";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useRecoilState } from "recoil";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import Head from "next/head";

import { db, storage } from "../../../firebase";
import Post from "../../../components/Post";
import Login from "../../../components/Login";
import Comment from "../../../components/Comment";
import { modalState } from "../../../atoms/modalAtom";
import Modal from "../../../components/Modal";
import Sidebar from "../../../components/Sidebar";
import Widgets from "../../../components/Widgets";

function PostPage({ trendingResults, followResults, providers }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useRecoilState(modalState);

  const [post, setPost] = useState();
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  const router = useRouter();
  const { statusId } = router.query;

  const [selectedFile, setSelectedFile] = useState(null);
  const filePickerRef = useRef();

  const sendComment = async (e) => {
    e.preventDefault();

    const newComment = {
      comment: comment,
      userId: session.user.uid,
      username: session.user.username,
      name: session.user.name,
      userImage: session.user.image,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "posts", statusId, "comments"),
      newComment
    );

    const imageRef = ref(storage, `comments/${docRef.id}/image`);

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, "data_url").then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "posts", statusId, "comments", docRef.id), {
          image: downloadURL,
        });
      });
    }

    setComment("");
    setSelectedFile(null);
  };

  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (eventReader) => {
      setSelectedFile(eventReader.target.result);
    };
  };

  useEffect(
    () =>
      onSnapshot(doc(db, "posts", statusId), (snapshot) => {
        setPost(snapshot.data());
      }),
    [db]
  );

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "posts", statusId, "comments"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => setComments(snapshot.docs)
      ),
    [db, statusId]
  );

  if (!session) return <Login providers={providers} />;

  return (
    <div>
      <Head>
        <title>{/* `{post?.username} on Twitter: "{post?.text}" */}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-[#141d26] min-h-screen flex max-w-[1400px] mx-auto">
        <Sidebar />
        <div className="flex-grow border-l border-r border-gray-700 max-w-[600px] sm:ml-[73px] xl:ml-[370px]">
          <div className="flex items-center px-1.5 py-2 border-b border-gray-700 text-[#d9d9d9] font-semibold text-xl gap-x-4 sticky top-0 z-50 bg-[#141d26]">
            <div
              className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0"
              onClick={() => router.push("/")}
            >
              <ArrowLeftIcon className="h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold z-10">Tweet</h2>
          </div>

          <Post id={statusId} post={post} postPage />

          {/* INPUT REPLY */}
          <div className="p-3 flex border-b border-gray-700">
            <img
              src={session.user.image}
              alt=""
              className="h-11 w-11 rounded-full mr-2"
            />
            <div className="flex-grow mt-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tweet your reply"
                rows="2"
                className="pl-2 bg-transparent outline-none text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full h-[40px] min-h-[40px]"
              />

              {selectedFile && (
                <div className="relative">
                  <div
                    className="absolute w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer"
                    onClick={(e) => setSelectedFile(null)}
                  >
                    <XIcon className="text-white h-5" />
                  </div>
                  <img
                    className="rounded-2xl max-h-80 object-contain"
                    src={selectedFile}
                    alt=""
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2.5">
                <div className="flex items-center">
                  <div
                    className="icon"
                    onClick={() => filePickerRef.current.click()}
                  >
                    <PhotographIcon className="h-[22px] text-[#1d9bf0]" />
                    <input
                      type="file"
                      hidden
                      onChange={addImageToPost}
                      ref={filePickerRef}
                    />
                  </div>

                  <div className="icon rotate-90">
                    <ChartBarIcon className="text-[#1d9bf0] h-[22px]" />
                  </div>

                  <div className="icon">
                    <EmojiHappyIcon className="text-[#1d9bf0] h-[22px]" />
                  </div>

                  <div className="icon">
                    <CalendarIcon className="text-[#1d9bf0] h-[22px]" />
                  </div>
                </div>
                <button
                  className="bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-[#1a8cd8] disabled:hover:bg-[#1d9bf0] disabled:opacity-50 disabled:cursor-default"
                  type="submit"
                  onClick={sendComment}
                  disabled={!comment.trim() && !selectedFile}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>

          {comments.length > 0 && (
            <div className="pb-72">
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  id={comment.id}
                  comment={comment.data()}
                />
              ))}
            </div>
          )}
        </div>

        <Widgets
          trendingResults={trendingResults}
          followResults={followResults}
        />

        {isOpen && <Modal />}
      </main>
    </div>
  );
}

export default PostPage;

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
