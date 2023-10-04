import axios from 'axios'; 
import { Request, Response } from 'express';
import FormData from 'form-data';
import { Manga ,Chapter}from '../model/mangaSchema';
import { validationResult } from 'express-validator';
import FtpClient from 'ftp-ts';
import { Op } from 'sequelize';
const ftp = new FtpClient();
require('dotenv').config(); 

require('dotenv').config(); // Load environment variables from .env file

const ftpConfig = {
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT!), // Parse the port as an integer
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  path: process.env.FTP_PATH,
};


export const mangaUpload = async (req: Request, res: Response) => {
  try {
    const { title, author, category, description, trending, rating, tags, chapters } = req.body;

    // Check if req.files is defined and is an object with the expected field names
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files['thumbnail']) {
      throw new Error('Both thumbnail must be provided.');
    }

    const thumbnail = files['thumbnail'][0];
    console.log(chapters);

    // Step 1: Upload thumbnail to the FTP server
    const thumbnailUrl = await uploadImageToFTP(thumbnail);

    // Step 2: Upload PDF files and store their URLs
    const chapterObjects: Chapter[] = [];

    for (const chapterData of chapters) {
      const { chapterNumber, title: chapterTitle, pdfFile } = chapterData;

      if (!pdfFile) {
        throw new Error('PDF file must be provided for each chapter.');
      }

      const pdfUrl = await uploadToFTP(pdfFile); // Replace with your PDF upload function

      // Create a chapter object and add it to the chapterObjects array
      const chapter: Chapter = {
        chapterNumber,
        title: chapterTitle,
        pdfUrl,
      };
      chapterObjects.push(chapter);
    }

    // Step 3: Create a manga object with chapters and save it in the database
    const manga = await Manga.create({
      title,
      author,
      category,
      description,
      thumbnail: thumbnailUrl,
      trending,
      rating,
      tags,
      chapters: chapterObjects, // Add the chapterObjects array to the manga object
    });

    res.status(201).json({ message: 'Manga uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// FTP Upload function
function uploadToFTP(file: Express.Multer.File | undefined): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    let ftpFilePath = '';

    ftp.connect(ftpConfig)
      .then(() => {
        return ftp.cwd('/public_html');
      })
      .then(() => {
        // Use a unique file name or modify as needed
        ftpFilePath = `pdf_${Date.now()}_${file.originalname}`;
        return ftp.put(file.buffer, ftpFilePath);
      })
      .then(() => {
        ftp.end();
        resolve(ftpFilePath);
      })
      .catch((err) => {
        ftp.end();
        reject(err);
      });
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







// export const mangaGet = async (req: Request, res: Response) => {
//   try {
//     const mangaId = req.params.id;
//     const manga = await Manga.findByPk(mangaId);

//     if (!manga) {
//       return res.status(404).json({ error: 'Manga not found' });
//     }

//     // Send manga metadata
//     const mangaData = {
//       title: manga.title,
//       author: manga.author,
//       category: manga.category,
//       description: manga.description
//     };
    
//     if (typeof manga.thumbnail !== 'string') {
//       return res.status(404).json({ error: 'Image not found' });
//     }
//     else if(typeof manga.pdfFile !== 'string'){
//       return res.status(404).json({ error: 'PDF file not found' });

//     }
    
//     const imageName = manga.thumbnail;
//     const imageUrl = `${process.env.PDF_URL}${imageName}`;

//     // Construct the PDF file URL based on manga ID
//     const pdfFileName = manga.pdfFile;
//     const pdfUrl = `${process.env.PDF_URL}${pdfFileName}`;

//     // Use axios to fetch the PDF file from the remote URL
//   //  const [imageResponse, pdfResponse] = await Promise.all([
//   //     axios.get(imageUrl, { responseType: 'stream' }),
//   //     axios.get(pdfUrl, { responseType: 'stream' }),
//   //   ]);

   
//       // Create a JSON response with manga data and URLs
//       const jsonResponse = {
//         mangaData,
//         imageUrl,
//         pdfUrl
//       };

   

//     res.status(200).json(jsonResponse);

//     // // Check if the response status is OK
//     // if (response.status === 200) {
//     //   res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
//     //   res.setHeader('Content-Type', 'application/pdf');
//     //   response.data.pipe(res); // Stream the file as the response
//     // } else {
//     //   res.status(404).json({ error: 'PDF file not found' });
//     // }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const List = async( req: Request, res: Response) =>{


//   console.log(req.body)
//   res.status(200).json({ message: "List endpoint reached" });
// }

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


