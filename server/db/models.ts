import mongoose from 'mongoose';
import { UserSchema, AttendanceSchema, SystemSettingsSchema } from './schema';

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const AttendanceModel = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export const SystemSettingsModel = mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);
