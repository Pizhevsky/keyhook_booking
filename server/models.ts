import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './sequelize';

export interface UserAttributes { 
  id: number; 
  name: string; 
  role: 'tenant' | 'manager' 
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number; 
  public name!: string; 
  public role!: 'tenant' | 'manager';
}
User.init({ 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, 
  name: { type: DataTypes.STRING, allowNull: false }, 
  role: { type: DataTypes.STRING, allowNull: false } 
}, { sequelize, tableName: 'users' });

export interface AvailabilityAttributes { 
  id: number; 
  managerId: number;
  selectedDate: string; 
  daysOfWeek: string; 
  startTime: string; 
  endTime: string;
  timeZone: string;
}
export interface AvailabilityCreationAttributes extends Optional<AvailabilityAttributes, 'id'> {}

export class Availability extends Model<AvailabilityAttributes, AvailabilityCreationAttributes> implements AvailabilityAttributes {
  public id!: number; 
  public managerId!: number;
  public selectedDate!: string;
  public daysOfWeek!: string; 
  public startTime!: string; 
  public endTime!: string;
  public timeZone!: string;
}
Availability.init({ 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, 
  managerId: { type: DataTypes.INTEGER, allowNull: false },
  selectedDate: { type: DataTypes.STRING, allowNull: false },
  daysOfWeek: { type: DataTypes.STRING, allowNull: false }, 
  startTime: { type: DataTypes.STRING, allowNull: false }, 
  endTime: { type: DataTypes.STRING, allowNull: false },
  timeZone: { type: DataTypes.STRING, allowNull: false } 
}, { sequelize, tableName: 'availability' });

export interface BookingAttributes { 
  id: number; 
  slotId: number; 
  bookDate: string;
  tenantId: number;
  createdAt?: Date 
}
export interface BookingCreationAttributes extends Optional<BookingAttributes, 'id'> {}

export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number; 
  public slotId!: number;
  public bookDate!: string;
  public tenantId!: number;
  public createdAt?: Date;
}
Booking.init({ 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, 
  slotId: { type: DataTypes.INTEGER, allowNull: false }, 
  bookDate: { type: DataTypes.INTEGER, allowNull: false},
  tenantId: { type: DataTypes.INTEGER, allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW } 
}, { sequelize, tableName: 'bookings', timestamps: false });

User.hasMany(Availability, { foreignKey: 'managerId' });
Availability.belongsTo(User, { foreignKey: 'managerId' });
Availability.hasMany(Booking, { foreignKey: 'slotId' });
Booking.belongsTo(Availability, { foreignKey: 'slotId' });

export async function syncModels() {
  await sequelize.sync();
}
