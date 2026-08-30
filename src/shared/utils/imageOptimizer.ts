import imageCompression from 'browser-image-compression';

export const optimizeImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/webp',
  };

  try {
    const compressedBlob = await imageCompression(file, options);

    return new File([compressedBlob], `${file.name.split('.')[0]}.webp`, {
      type: 'image/webp',
    });
  } catch (error) {
    console.error('Ошибка оптимизации через библиотеку:', error);
    return file;
  }
};
