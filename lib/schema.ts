import { z } from 'zod';

export const CompanySchema = z.object({
  nameAr: z.string().min(1, 'اسم الشركة مطلوب'),
  addressAr: z.string().min(1, 'عنوان الشركة مطلوب'),
  phone: z.string().min(1, 'رقم هاتف الشركة مطلوب'),
  logoDataUrl: z.string().optional(),
});

export const CarSchema = z.object({
  plateNumber: z.string().min(1, 'رقم اللوحة مطلوب'),
  owner: z.string().min(1, 'اسم المالك مطلوب'),
  idNumber: z.string().min(1, 'رقم الهوية مطلوب'),
});

export const ReceiverSchema = z.object({
  name: z.string().min(1, 'اسم المستلم مطلوب'),
  address: z.string().min(1, 'عنوان المستلم مطلوب'),
  mobile: z.string().min(1, 'جوال المستلم مطلوب'),
});

export const TransportSchema = z.object({
  fromCity: z.string().min(1, 'مدينة القيام مطلوبة'),
  toCity: z.string().min(1, 'مدينة الوصول مطلوبة'),
  orderNo: z.string().min(1, 'رقم الإذن مطلوب'),
});

export const DriverSchema = z.object({
  name: z.string().min(1, 'اسم السائق مطلوب'),
  iqamaNumber: z.string().min(1, 'رقم الإقامة مطلوب'),
  mobile: z.string().min(1, 'جوال السائق مطلوب'),
});

export const LoadSchema = z.object({
  type: z.string().min(1, 'نوع الحمولة مطلوب'),
  weight: z.string().min(1, 'وزن البضاعة مطلوب'),
});

export const DeliveryOrderSchema = z.object({
  id: z.string(),
  schemaVersion: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  invoiceNumber: z.string().min(1, 'رقم الفاتورة مطلوب'),
  receiptDate: z.string().min(1, 'تاريخ الاستلام مطلوب'),
  deliveryDate: z.string().min(1, 'تاريخ التسليم مطلوب'),
  company: CompanySchema,
  car: CarSchema,
  receiver: ReceiverSchema,
  transport: TransportSchema,
  driver: DriverSchema,
  load: LoadSchema,
});

export type DeliveryOrderFormValues = z.infer<typeof DeliveryOrderSchema>;
