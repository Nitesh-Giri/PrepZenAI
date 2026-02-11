import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    try{
        // Let the browser set the Content-Type header with the proper multipart boundary
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData);
        return response.data;
    }catch (error){
        console.error("Image upload failed:", error);
        throw error;
    }
};

export default uploadImage;