import { addMissingWordFreqData } from "../db/migrations";
let EXECUTED = false;

// use this for manual cleanup (example: add missing data; make it consistent)
if (process.env.NEXT_MANUAL_SIG_HANDLE) {
  console.log("MANUAL SIG HANDLE IS ON");

  if (!EXECUTED) {
    const response = new Promise((resolve, _) => {
      resolve(addMissingWordFreqData());
    });

    console.warn(JSON.stringify(response));

    EXECUTED = true;
  }
}
