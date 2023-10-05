import { Request, Response } from 'express';
import { Manga ,Chapter}from '../model/mangaSchema';
import FtpClient from 'ftp-ts';
import { Op } from 'sequelize';
const ftp = new FtpClient();
require('dotenv').config(); 


const ftpConfig = {
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT!),
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  path: process.env.FTP_PATH,
};

export const mangaUpload = async (req: Request, res: Response) => {
  let ftpConnection: any = null;
  try {
    const { title, author, category, description, trending, rating, tags, chapters } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files['thumbnail'] || !files['chapters']) {
      throw new Error('Both thumbnail and chapters must be provided.');
    }

    const thumbnail = files['thumbnail'][0];
    const chapterFiles = files['chapters'];
  

    const thumbnailUrl = await uploadImageToFTP(thumbnail);
    const splitags= tags.split(',');

    const manga = await Manga.create({
      title,
      author,
      category,
      description,
      thumbnail: thumbnailUrl,
      trending,
      rating,
      tags: splitags,
    });

    const ftpConnection = await ftp.connect(ftpConfig);
    await ftpConnection.cwd('/public_html');

    const chapterObjects: Chapter[] = [];

    for (let i = 0; i < chapters.length ; i++) {
      const chapterData = chapters[i];
      const chapterFile = chapterFiles[i];

      if (!chapterFile) {
        throw new Error('PDF file must be provided for each chapter.');
      }
      const pdfUrl = await uploadToFTP(ftpConnection,chapterFile);
      console.log(pdfUrl)
      const chapter: Chapter = {
        chapterNumber: chapterData.chapterNumber,
        title: chapterData.title,
        pdfUrl,
      };
     
      chapterObjects.push(chapter);
    }

    manga.chapters = chapterObjects;
    await manga.save();

    res.status(201).json({ message: 'Manga uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }finally{
    if (ftpConnection) {
     
      ftpConnection.end();
    }
  }
};


async function uploadToFTP(ftpConnection: any, file: Express.Multer.File | undefined): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    let ftpFilePath = '';

    try {
      ftpFilePath = `pdf_${Date.now()}_${file.originalname}`;
      await ftpConnection.put(file.buffer, ftpFilePath);
      resolve(ftpFilePath);
    } catch (err) {
      reject(err);
    }
  });
}








function uploadImageToFTP(file: Express.Multer.File | undefined): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!file) {
      reject(new Error('No Image provided'));
      return;
    }

    let ftpImagePath = '';

    ftp.connect(ftpConfig)
      .then(() => {
        return ftp.cwd('/public_html');
      })
      .then(() => {
        // Use a unique file name or modify as needed
        ftpImagePath = `Image_${Date.now()}_${file.originalname}`;
        return ftp.put(file.buffer, ftpImagePath);
      })
      .then(() => {
        ftp.end();
        resolve(ftpImagePath);
      })
      .catch((err) => {
        ftp.end();
        reject(err);
      });
  });
}




export const mangaGet = async (req: Request, res: Response) => {
  try {
    const mangaId = req.params.id;
    const manga = await Manga.findByPk(mangaId);
    
    if (!manga) {
      return res.status(404).json({ error: 'Manga not found' });
    }
    
    
    res.status(200).json({manga})
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getAllManga = async (req: Request, res: Response) => {
  // const page = parseInt(req.query.page as string) || 1;
  // const perPage = 10; 
  try {

    // const offset = (page - 1) * perPage;
    // const allManga = await Manga.findAndCountAll({
    //   limit: perPage,
    //   offset: offset,});

    const allManga = await Manga.findAll();

      
    // const totalPages = Math.ceil(allManga.count / perPage);
    // res.status(200).json({  manga: allManga.rows,
    //   currentPage: page,
    //   totalPages: totalPages,});

    res.status(200).json(allManga)
  } catch (error) {
    console.error('Error fetching manga:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const searchManga = async (req: Request, res: Response) => {
  const title = req.query.title;
  const category = req.query.category;
  const page = parseInt(req.query.page as string) || 1;
  const perPage = 10; 

  try {
    let whereClause = {}; 

   
    if (title || category) {
      whereClause = {
        [Op.or]: [
          title
            ? {
                title: {
                  [Op.like]: `${title}%`,
                },
              }
            : {},
          category
            ? {
                category: {
                  [Op.like]: `%${category}%`,
                },
              }
            : {},
        ],
      };
    }

    const offset = (page - 1) * perPage;

    const manga = await Manga.findAndCountAll({
      where: whereClause, 
      limit: perPage,
      offset: offset,
    });

    const totalPages = Math.ceil(manga.count / perPage);

    res.status(200).json({
      manga: manga.rows,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const mangaDelete = async (req: Request, res: Response) =>{
  const mangaId = req.params.id;

  const manga = await Manga.findByPk(mangaId);
  if (!manga) {
    return res.status(404).json({ error: 'Manga not found' });

    
  }
  const ftpConnection = await ftp.connect(ftpConfig);
  await ftpConnection.cwd('/public_html');
  try{
  if (manga.thumbnail) {
    await deleteFromFTP(ftpConnection, manga.thumbnail);
  }

  if (manga.chapters) {
    for (const chapter of manga.chapters) {
      if (chapter.pdfUrl) {
        await deleteFromFTP(ftpConnection, chapter.pdfUrl);
      }
    }
  }

  await manga.destroy();

  res.status(200).json({ message: 'Manga deleted successfully' });

}catch(error){
  console.error(`Manga delete error: ${error}`);
  res.status(500).json({ error: 'Internal server error' });
}finally {

  ftpConnection.end();
}



}


const deleteFromFTP = async(ftpConnection: any,filePath: string) =>{

  try {
    await ftpConnection.delete(filePath);
    console.log(`Deleted file from FTP: ${filePath}`);
  } catch (error) {
    console.error(`FTP delete error: ${error}`);
  }
}






