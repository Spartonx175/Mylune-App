import { cookies } from "next/headers";
import { CAT_COOKIE, DEFAULT_CAT, isCat, type CatId } from "./cats";

/** The companion cat chosen on this device (cookie), or the default. Server-side only. */
export async function getCompanionCat(): Promise<CatId> {
  const v = (await cookies()).get(CAT_COOKIE)?.value;
  return isCat(v) ? v : DEFAULT_CAT;
}
