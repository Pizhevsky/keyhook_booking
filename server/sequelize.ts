import { Sequelize } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({ 
  dialect: 'sqlite', 
  storage: path.join(process.cwd(), 'data.sqlite'), 
  logging: false 
});

export default sequelize;
