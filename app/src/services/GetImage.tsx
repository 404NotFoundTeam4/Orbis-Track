const BASE_URL = import.meta.env.VITE_MY_IMAGE_PATH;

const getImageUrl = (filename: string | null | undefined) => {
  if (!filename || filename === "") {
    return "/default-profile.png";
  }
  if (
    (typeof filename === "string" && filename.startsWith("blob:")) ||
    filename.startsWith("http")
  )
    return filename;
  
  return `${BASE_URL}/${filename}`;
};

export default getImageUrl;
