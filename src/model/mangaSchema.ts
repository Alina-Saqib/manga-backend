import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/connectDB';

class Manga extends Model {
  public id!: number;
  public title!: string;
  public author!: string;
  public category!: string;
  public description!: string;
  public thumbnail?: string;
  public trending?: boolean;
  public rating?: number;
  public tags?: string[];
  public chapters?: Chapter[];
}

export interface Chapter {
  chapterNumber: number;
  title: string;
  pdfUrl: string;
}

Manga.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
    },
    trending: {
      type: DataTypes.BOOLEAN,
    },
    rating: {
      type: DataTypes.FLOAT,
    },
    tags: {
      type: DataTypes.JSON,
    },
    chapters: {
      type: DataTypes.JSON, 
    },
  },
  {
    sequelize,
    modelName: 'Manga',
    timestamps: true,
    underscored: true,
  }
);

export { Manga };
