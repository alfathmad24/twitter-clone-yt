import {
  ChartBarIcon,
  ChatIcon,
  DotsHorizontalIcon,
  HeartIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Moment from "react-moment";
import { useRecoilState } from "recoil";
import { postIdState } from "../atoms/modalAtom";
import { db, storage } from "../firebase";

function Comment({ comment, id: commentId }) {
  const router = useRouter();
  const { id } = router.query;

  const { data: session } = useSession();

  const deleteComment = () => {
    const imageRef = ref(storage, comment.image);

    if (comment.image) {
      deleteObject(imageRef);
    }

    deleteDoc(doc(db, "posts", id, "comments", commentId));
  };

  return (
    <div className="p-3 flex cursor-pointer border-b border-gray-700 hover:bg-[#696969] hover:bg-opacity-10 transition duration-300 ease-out">
      <img
        src={comment?.userImage}
        alt=""
        className="h-11 w-11 rounded-full mr-4"
      />
      <div className="flex flex-col space-y-2 w-full">
        <div className="flex justify-between">
          <div className="text-[#6e767d]">
            <div className="inline-block group">
              <h4 className="font-bold text-[#d9d9d9] text-[15px] sm:text-base inline-block group-hover:underline">
                {comment?.name}
              </h4>
              <span className="ml-1.5 text-sm sm:text-[15px]">
                @{comment?.username}{" "}
              </span>
            </div>{" "}
            ·{" "}
            <span className="hover:underline text-sm sm:text-[15px]">
              <Moment fromNow>{comment?.timestamp?.toDate()}</Moment>
            </span>
            <p className="text-[#d9d9d9] mt-0.5 max-w-lg text-[15px] sm:text-base">
              {comment?.comment}
            </p>
            {comment.image && (
              <div className="mr-2 mt-4">
                <img
                  src={comment.image}
                  alt=""
                  className="rounded-2xl max-h-[700px] w-full object-cover"
                />
              </div>
            )}
          </div>
          <div className="icon group flex-shrink-0">
            <DotsHorizontalIcon className="h-5 text-[#6e767d] group-hover:text-[#1d9bf0]" />
          </div>
        </div>

        <div className="text-[#6e767d] flex justify-between w-10/12">
          <div className="icon group">
            <ChatIcon className="h-5 group-hover:text-[#1d9bf0]" />
          </div>

          <div className="flex items-center space-x-1 group">
            <div className="icon group-hover:bg-pink-600/10">
              <HeartIcon className="h-5 group-hover:text-pink-600" />
            </div>
            <span className="group-hover:text-pink-600 text-sm"></span>
          </div>

          <div className="icon group">
            <ShareIcon className="h-5 group-hover:text-[#1d9bf0]" />
          </div>
          <div className="icon group">
            <ChartBarIcon className="h-5 group-hover:text-[#1d9bf0]" />
          </div>
          {/* DELETE */}
          {session.user.uid === comment.userId && (
            <div
              className="flex items-center space-x-1 group"
              onClick={(e) => {
                e.stopPropagation();
                deleteComment();
              }}
            >
              <div className="icon group-hover:bg-red-600/10">
                <TrashIcon className="h-5 group-hover:text-red-600" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;
