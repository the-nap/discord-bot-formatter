import config from '../config-loader.mjs';
import imgbbUploader from "imgbb-uploader"; 

export async function upload(svgString){
  const apiKey = config.imgbbKey;
   if (!svgString || typeof svgString !== "string") {
      throw new Error("uploadSvgToImgbb requires a non-empty SVG string");
    }
  
    const base64Svg = Buffer.from(svgString, "utf8").toString("base64");
  
    const payload = {
      apiKey: apiKey,
      base64string: base64Svg,
  };
  
    const result = await imgbbUploader(payload);
  
    // Normalize common URL fields for easier downstream consumption
    const url =
      result?.url ||
      result?.display_url ||
      result?.data?.url ||
      result?.data?.display_url;

    if (!url) {
      throw new Error(
        `ImgBB upload succeeded but no URL found in response: ${JSON.stringify(result)}`
      );
    }
  return url;


}
