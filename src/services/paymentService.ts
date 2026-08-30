import { getMongoDb } from './db';
import { generatePaymentId } from '../utils/id';
import { Payment } from '../types';

export async function getPayments(): Promise<Payment[]> {
  const mongoDb = await getMongoDb();
  return await mongoDb.collection<Payment>('payments')
    .find({}, { projection: { _id: 0 } })
    .sort({ date: -1 })
    .toArray();
}

export async function createPayment(data: Payment): Promise<Payment> {
  const { pid, studentSid, date, amount, paymentMonth, comment } = data;
  if (!studentSid || !date || amount === undefined || !paymentMonth) {
    throw new Error('studentSid, date, amount, and paymentMonth are required');
  }

  const generatedPid = pid || generatePaymentId();
  const newPayment: Payment = {
    pid: generatedPid,
    studentSid,
    date,
    amount: parseInt(amount as any),
    paymentMonth,
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  const mongoDb = await getMongoDb();
  await mongoDb.collection('payments').insertOne(newPayment);
  return newPayment;
}

export async function updatePayment(pid: string, data: Partial<Payment>): Promise<Payment> {
  const { date, amount, paymentMonth, comment } = data;
  if (!date || amount === undefined || !paymentMonth) {
    throw new Error('date, amount, and paymentMonth are required');
  }

  const updateFields: any = {
    date,
    amount: parseInt(amount as any),
    paymentMonth,
    comment: comment || ''
  };

  const mongoDb = await getMongoDb();
  const result = await mongoDb.collection<Payment>('payments').findOneAndUpdate(
    { pid },
    { $set: updateFields },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  if (!result) {
    throw new Error('Payment not found');
  }
  return result as Payment;
}

export async function deletePayment(pid: string): Promise<boolean> {
  const mongoDb = await getMongoDb();
  await mongoDb.collection('payments').deleteOne({ pid });
  return true;
}
