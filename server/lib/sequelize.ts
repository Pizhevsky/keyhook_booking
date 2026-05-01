import { Sequelize, Transaction } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
  dialect:  'sqlite',
  storage:  path.join(process.cwd(), 'data.sqlite'),
  logging:  false,
  pool: { max: 5, min: 0, acquire: 30_000, idle: 10_000 },
});

export async function withTransaction<T>(
  fn: (t: Transaction) => Promise<T>,
): Promise<T> {
  return sequelize.transaction(fn);
}

export default sequelize;
