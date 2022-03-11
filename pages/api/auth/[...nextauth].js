import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../firebase";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.username = session.user.name
        .split(" ")
        .join("")
        .toLocaleLowerCase();
      session.user.uid = token.sub;

      const users = [];

      const querySnapshot = await getDocs(query(collection(db, "users")));

      querySnapshot.forEach((doc) => {
        users.push({ ...doc.data(), id: doc.id });
      });

      const userExist = users.find((user) => user.email === session.user.email);

      if (!userExist) {
        await addDoc(collection(db, "users"), session.user);
      }

      return session;
    },
  },
});
