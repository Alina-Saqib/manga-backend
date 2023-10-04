import multer from 'multer';


const storage = multer.memoryStorage(); // Use memory storage to handle files in memory


const Upload = multer ({storage}).fields([
    {name: "thumbnail" ,maxCount:1},
    {name: "pdfFile" ,maxCount:5}
    ])
// const singleUpload = multer ({storage}).single('pdfFile')

// export default singleUpload;

export default Upload;
