import multer from 'multer';


const storage = multer.memoryStorage();
const upload = multer({ storage });


// const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//     filename: function (req,file,cb) {
//       cb(null, file.originalname)
//     }
//   });



export default upload;
