import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './lib/sequelize';
import { BOOKING_STATUS } from './types';
import type { UserRole, BookingStatus } from './types';

// User
export interface UserAttributes { 
  id: number
  name: string
  role: UserRole 
}
type UserCreationAttributes = Optional<UserAttributes, 'id'>
export class User 
  extends Model<UserAttributes, UserCreationAttributes> 
  implements UserAttributes 
{
  declare id: number; 
  declare name: string; 
  declare role: UserRole;
}

User.init({ 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, 
  name: { type: DataTypes.STRING(200), allowNull: false }, 
  role: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: { isIn: [['tenant', 'manager']] }
  } 
}, { sequelize, tableName: 'users', timestamps: false });

// Availability
export interface AvailabilityAttributes { 
  id: number
  managerId: number
  selectedDate: string
  daysOfWeek: string
  startTime: string
  endTime: string
  timeZone: string
}
type AvailabilityCreationAttributes = Optional<AvailabilityAttributes, 'id'>

export class Availability 
  extends Model<AvailabilityAttributes, AvailabilityCreationAttributes> 
  implements AvailabilityAttributes 
{
  declare id: number; 
  declare managerId: number;
  declare selectedDate: string;
  declare daysOfWeek: string; 
  declare startTime: string; 
  declare endTime: string;
  declare timeZone: string;
}
Availability.init({ 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, 
  managerId: { type: DataTypes.INTEGER, allowNull: false },
  selectedDate: { type: DataTypes.STRING(10), allowNull: false },
  daysOfWeek: { type: DataTypes.STRING(20), allowNull: false }, 
  startTime: { type: DataTypes.STRING(5), allowNull: false }, 
  endTime: { type: DataTypes.STRING(5), allowNull: false },
  timeZone: { type: DataTypes.STRING(50), allowNull: false } 
}, { sequelize, tableName: 'availability', timestamps: false });

// Booking
export interface BookingAttributes { 
  id: number
  slotId: number
  bookDate: string
  tenantId: number
  status: BookingStatus
  createdAt: Date
  cancelledAt: Date | null
}
type BookingCreationAttributes = Optional<BookingAttributes, 'id' | 'createdAt' | 'cancelledAt' | 'status'>

export class Booking 
  extends Model<BookingAttributes, BookingCreationAttributes> 
  implements BookingAttributes 
{
  declare id: number; 
  declare slotId: number;
  declare bookDate: string;
  declare tenantId: number;
  declare status: BookingStatus;
  declare createdAt: Date;
  declare cancelledAt: Date | null;
}

Booking.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, 
  slotId: { type: DataTypes.INTEGER, allowNull: false }, 
  bookDate: { type: DataTypes.STRING(10), allowNull: false},
  tenantId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: BOOKING_STATUS.ACTIVE,
    validate: { isIn: [Object.values(BOOKING_STATUS)] }
  },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  cancelledAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
}, { sequelize, tableName: 'bookings', timestamps: false });

// Associations
User.hasMany(Availability, { foreignKey: 'managerId', as: 'availabilities' });
Availability.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
Availability.hasMany(Booking, { foreignKey: 'slotId', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(Availability, { foreignKey: 'slotId', as: 'slot' });
Booking.belongsTo(User, { foreignKey: 'tenantId', as: 'tenant' });

// Schema setup
export async function syncModels(): Promise<void> {
  await sequelize.sync();
  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_bookings_slot_date_active
    ON bookings (slotId, bookDate)
    WHERE status = '${BOOKING_STATUS.ACTIVE}'
  `);
}
