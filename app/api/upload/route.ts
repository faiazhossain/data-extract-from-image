import { NextRequest } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const focusLat = formData.get("focus_lat");
    const focusLon = formData.get("focus_lon");

    if (!file) {
      return new Response("No file received.", { status: 400 });
    }

    // Compress the image before sending to API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compress the image with Sharp - reduce quality and resize if over certain dimensions
    const compressedImageBuffer = await sharp(buffer)
      .resize({
        width: 1280, // Limit max width to 1280px
        height: 1280, // Limit max height to 1280px
        fit: "inside", // Maintain aspect ratio
        withoutEnlargement: true, // Don't enlarge if smaller than these dimensions
      })
      .jpeg({ quality: 80 }) // Compress to JPEG with 80% quality
      .toBuffer();

    // Create a new compressed file object - Convert Buffer to Uint8Array for compatibility with File constructor
    const compressedFile = new File(
      [new Uint8Array(compressedImageBuffer)],
      file.name,
      {
        type: "image/jpeg",
      }
    );

    // Create form data for the Barikoi API
    const barikoiFormData = new FormData();
    barikoiFormData.append("file", compressedFile);

    // Construct the URL with focus coordinates if they exist
    let apiUrl = "https://usage.bmapsbd.com/extract";
    if (focusLat && focusLon) {
      apiUrl += `?focus_lat=${focusLat}&focus_lon=${focusLon}`;
    }

    // Forward the request to the Barikoi API
    const response = await fetch(apiUrl, {
      method: "POST",
      body: barikoiFormData,
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Send back the processed data
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return new Response(JSON.stringify({ error: "Failed to process image" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
