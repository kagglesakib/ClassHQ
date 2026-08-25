import mongoose from 'mongoose';
import { UserSchema, AttendanceSchema } from './schema';

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const AttendanceModel = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
