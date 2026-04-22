export const getMediaDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const media = file.type.startsWith("audio/")
      ? new Audio(url)
      : document.createElement("video");

    media.src = url;

    media.onloadedmetadata = () => {
      resolve(media.duration); // Thời lượng tính bằng giây
      URL.revokeObjectURL(url); // Cleanup
    };

    media.onerror = () => {
      reject(new Error("Cannot load media"));
      URL.revokeObjectURL(url);
    };
  });
};
