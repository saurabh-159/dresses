export function imageKitUrl(
    filePath: string,
    width?: number
  ) {
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  
    if (!endpoint) {
      return filePath;
    }
  
    if (!width) {
      return `${endpoint}${filePath}`;
    }
  
    return `${endpoint}${filePath}?tr=w-${width}`;
  }