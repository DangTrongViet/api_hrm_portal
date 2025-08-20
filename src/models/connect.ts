import { sequelize } from '@config/database';

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
