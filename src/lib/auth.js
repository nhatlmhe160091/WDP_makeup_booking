import { decrypt } from "@muahub/utils/Security";
import getObjectId from "./getObjectId";

export function getToken(req) {
  const authorization = req.headers.get("authorization");
  const token = authorization?.split(" ")[1];

  if (!token) {
    return null;
  }

  return token;
}

export const validateToken = async (req) => {
  const token = await getToken(req);
  if (!token) {
    return null;
  }
  try {
    let decryptedToken = await decrypt(token);
    decryptedToken = JSON.parse(decryptedToken);
    decryptedToken = decryptedToken.id;
    return getObjectId(decryptedToken);
  } catch (error) {
    return null;
  }
};
