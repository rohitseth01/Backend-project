import multer from "multer";

//multer is used as  middle ware//lecture-10  //localpath me file tore karake fir cloudinary me upload karenge

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})

export const upload=multer({
    storage,
})

