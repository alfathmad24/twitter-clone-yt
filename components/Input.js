import React, { useRef, useState } from "react";
import {
  PhotographIcon,
  XIcon,
  ChartBarIcon,
  CalendarIcon,
  EmojiHappyIcon,
} from "@heroicons/react/outline";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import Image from "next/image";
import { useSession } from "next-auth/react";

function Input() {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();

  const filePickerRef = useRef();

  const sendPost = async () => {
    if (loading) return;
    setLoading(true);

    const newPost = {
      id: session.user.uid,
      name: session.user.name,
      username: session.user.username,
      userImage: session.user.image,
      text: input,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "posts"), newPost);

    const imageRef = ref(storage, `posts/${docRef.id}/image`);

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, "data_url").then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "posts", docRef.id), {
          image: downloadURL,
        });
      });
    }

    setLoading(false);
    setInput("");
    setSelectedFile(null);
    setShowEmojis(false);
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

  const addEmoji = (e) => {
    let sym = e.unified.split("-");
    console.log(sym);
    let codesArray = [];
    sym.forEach((el) => codesArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codesArray);
    setInput(input + emoji);
  };

  return (
    <div
      className={`border-b border-gray-700 p-3 flex space-x-3 z-[1] ${
        loading && "opacity-60"
      }`}
    >
      <div className="z-[1]">
        <Image
          width={44}
          height={44}
          className="w-11 h-11 rounded-full cursor-pointer"
          src={session.user.image}
          alt={session.user.name}
        />
      </div>
      <div className="w-full divide-y divide-gray-700">
        <div className={`${selectedFile && `pb-7`} ${input && `space-y-2.5`}`}>
          <textarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            className="bg-transparent outline-none w-full text-white text-lg resize-none placeholder-gray-500 tracking-wide min-h-[50px]"
            name="tweet"
            id="tweet"
            rows="2"
            placeholder="What's happening?"
          ></textarea>
          {/* <span
            contentEditable
            className="bg-transparent outline-none w-full text-white text-lg resize-none overflow-hidden"
            role="textbox"
          ></span> */}
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
        </div>

        {!loading && (
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
                <ChartBarIcon className="h-[22px] text-[#1d9bf0]" />
              </div>
              <div className="icon" onClick={() => setShowEmojis(!showEmojis)}>
                <EmojiHappyIcon className="h-[22px] text-[#1d9bf0]" />
              </div>
              <div className="icon">
                <CalendarIcon className="h-[22px] text-[#1d9bf0]" />
              </div>

              {showEmojis && (
                <Picker
                  onSelect={addEmoji}
                  style={{
                    position: "absolute",
                    marginTop: "465px",
                    marginLeft: -40,
                    maxWidth: "320px",
                    borderRadius: "20px",
                  }}
                  theme="dark"
                />
              )}
            </div>
            <button
              disabled={!input || input.trim() === ""}
              className=" bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-[#1a8cd8] disabled:hover:bg-[#1d9bf0] disabled:opacity-50 disabled:cursor-default"
              onClick={sendPost}
            >
              Tweet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Input;
