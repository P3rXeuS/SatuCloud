"use server";

import { Client, Databases, Query } from "node-appwrite";

export async function checkUserExists(email: string) {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
      .setKey(process.env.NEXT_APPWRITE_KEY!);

    const db = new Databases(client);

    const res = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION!,
      [Query.equal("email", email)]
    );

    if (res.documents.length === 0) return null;
    return res.documents[0];
  } catch (err) {
    console.log("checkUserExists error:", err);
    return null;
  }
}
