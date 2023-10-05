import multer from 'multer';


const storage = multer.memoryStorage(); // Use memory storage to handle files in memory


const Upload = multer ({storage}).fields([
    {name: "thumbnail" ,maxCount:1},
    {name: "chapters" ,maxCount:10}
    ])


export default Upload;
