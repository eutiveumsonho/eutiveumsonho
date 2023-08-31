import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export default function () {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 60,
            color: "black",
            background: "#f6f6f6",
            width: "100%",
            height: "100%",
            paddingTop: 50,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            width="256"
            height="256"
            src={"https://eutiveumsonho.com/android-chrome-512x512.png"}
            style={{
              borderRadius: 128,
            }}
          />
          <p>Eu tive um sonho</p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
