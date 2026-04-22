export const isImage = (filename: string) => {
  return filename.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
};
