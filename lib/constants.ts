import { DeliveryOrder } from '@/types/delivery-order';

// Current schema version for localStorage & IndexedDB record migrations
export const CURRENT_SCHEMA_VERSION = 1;

// Default initial values matching original reference invoice
export const DEFAULT_DELIVERY_ORDER: Omit<DeliveryOrder, 'id' | 'createdAt' | 'updatedAt'> = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  invoiceNumber: '00669',
  receiptDate: '2026-05-20',
  deliveryDate: '2026-05-25',
  company: {
    nameAr: 'شركة ليونة للتجارة',
    addressAr: '٢١٨١ حي العزيزية بحرة',
    phone: '٠٥٤٧٧٧٧٩٦٣',
    logoDataUrl: './amar-logo.png',
  },
  car: {
    plateNumber: 'ب ط و 6318',
    owner: 'شركة ليونة للتجارة',
    idNumber: '7002526817',
  },
  receiver: {
    name: 'شركة ليونة للتجارة',
    address: 'الخرج',
    mobile: '0547777963',
  },
  transport: {
    fromCity: 'تبوك',
    toCity: 'الخرج',
    orderNo: '001',
  },
  driver: {
    name: 'محمدخان',
    iqamaNumber: '2309163413',
    mobile: '0547777963',
  },
  load: {
    type: 'خزانات',
    weight: '12تن',
  },
};

// Bilingual field labels map
export const FIELD_LABELS = {
  invoiceNumber: { en: 'Invoice Number', ar: 'رقم الطلب' },
  receiptDate: { en: 'Reciept Date', ar: 'تاريخ الاستلام' },
  deliveryDate: { en: 'Delivery Date', ar: 'تاريخ التسليم' },
  carInformation: { en: 'Car Information', ar: 'معلومات المركبة' },
  plateNumber: { en: 'Plate number', ar: 'رقم لوحة المركبة' },
  owner: { en: 'Owner', ar: 'المالك' },
  idNumber: { en: 'ID number', ar: 'رقم الهوية' },
  receiverInformation: { en: 'Receiver Information', ar: 'معلومات المستلم' },
  receiverName: { en: 'Receiver Name', ar: 'اسم المستلم' },
  receiverAddress: { en: 'Receiver Address', ar: 'عنوان المستلم' },
  receiverMobile: { en: 'Receiver Mobile', ar: 'جوال المستلم' },
  transportationInformation: { en: 'Transportation Information', ar: 'معلومات النقل' },
  fromCity: { en: 'From City', ar: 'من مدينة' },
  toCity: { en: 'To City', ar: 'إلى مدينة' },
  orderNo: { en: 'Order No', ar: 'رقم الأذن' },
  driverInformation: { en: 'Driver Information', ar: 'معلومات السائق' },
  driverName: { en: 'Name', ar: 'اسم السائق' },
  iqamaNumber: { en: 'Iqama Number', ar: 'رقم الإقامة' },
  driverMobile: { en: 'Mobile', ar: 'جوال السائق' },
  loadInformation: { en: 'Load Information', ar: 'معلومات الحمولة' },
  loadType: { en: 'Load Type', ar: 'نوع الحمولة' },
  goodsWeight: { en: 'Goods Weight', ar: 'وزن البضاعة' },
} as const;
