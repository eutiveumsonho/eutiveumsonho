import { getDreamById } from "./db/reads";

export function isDreamOwner(dreamId, userEmail) {
    const dream = await getDreamById(dreamId)

    if (!dream) {
        throw new Error("No errors should get here!")
    }

   return dream.userEmail === userEmail
}