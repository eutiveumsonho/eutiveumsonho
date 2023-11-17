/**
 * Hit Chiron with data for AI training.
 * What is Chiron? Read below 👇
 * @link https://github.com/eutiveumsonho/chiron
 */
export async function hitChiron(data) {
  return fetch(process.env.CHIRON_URL + "/api/data/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apiKey: process.env.CHIRON_API_KEY,
      vendorId: process.env.CHIRON_VENDOR_ID,
    },
    body: { data },
  });
}
