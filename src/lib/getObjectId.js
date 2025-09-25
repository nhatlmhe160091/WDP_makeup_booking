import { ObjectId } from "mongodb";

export default function getObjectId(access_token) {
  try {
    if (!access_token) {
      return null;
    }

    // Convert string to ObjectId
    const objectId = new ObjectId(access_token);

    // validate ObjectId
    if (objectId.toString() !== access_token) {
      throw new Error("Invalid access token");
    }

    return objectId;
  } catch (error) {
    return null;
  }
}
