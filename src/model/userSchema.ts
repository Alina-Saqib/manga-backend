// User.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/connectDB';

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public display_name!: string;
}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true, // Enable timestamps
    underscored: true, 
  }
);

export default User;
