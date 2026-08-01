export interface CompanyInfo {
  nameAr: string;
  addressAr: string;
  phone: string;
  logoDataUrl?: string;
}

export interface CarInfo {
  plateNumber: string;
  owner: string;
  idNumber: string;
}

export interface ReceiverInfo {
  name: string;
  address: string;
  mobile: string;
}

export interface TransportInfo {
  fromCity: string;
  toCity: string;
  orderNo: string;
}

export interface DriverInfo {
  name: string;
  iqamaNumber: string;
  mobile: string;
}

export interface LoadInfo {
  type: string;
  weight: string;
}

export interface DeliveryOrder {
  id: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  invoiceNumber: string;
  receiptDate: string;
  deliveryDate: string;
  company: CompanyInfo;
  car: CarInfo;
  receiver: ReceiverInfo;
  transport: TransportInfo;
  driver: DriverInfo;
  load: LoadInfo;
}

export interface OrderHistoryEntry {
  id: string;
  invoiceNumber: string;
  deliveryDate: string;
  createdAt: string;
  order: DeliveryOrder;
  pdfBlob?: Blob;
}
