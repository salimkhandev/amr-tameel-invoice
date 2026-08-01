'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeliveryOrder } from '@/types/delivery-order';
import { DeliveryOrderSchema, DeliveryOrderFormValues } from '@/lib/schema';
import { FormSection } from './FormSection';
import { FormField } from './FormField';

interface DeliveryOrderFormProps {
  order: DeliveryOrder;
  onOrderChange: (updated: DeliveryOrder) => void;
}

export const DeliveryOrderForm: React.FC<DeliveryOrderFormProps> = ({ order, onOrderChange }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeliveryOrderFormValues>({
    resolver: zodResolver(DeliveryOrderSchema),
    defaultValues: order,
    values: order,
  });

  const handleFieldUpdate = (path: string, value: string) => {
    // Helper to deeply set value in state
    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(order));
    let curr = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]]) curr[keys[i]] = {};
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = value;

    onOrderChange(updated);
  };

  return (
    <form className="flex flex-col gap-5 w-full max-w-2xl mx-auto p-4 pb-24">
      {/* SECTION 0: Invoice Meta */}
      <FormSection title="Invoice Meta">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField
            label="Invoice Number"
            name="invoiceNumber"
            value={watch('invoiceNumber')}
            onChange={(e) => handleFieldUpdate('invoiceNumber', e.target.value)}
            error={errors.invoiceNumber?.message}
            dir="ltr"
          />
          <FormField
            label="Receipt Date"
            name="receiptDate"
            type="date"
            value={watch('receiptDate')}
            onChange={(e) => handleFieldUpdate('receiptDate', e.target.value)}
            error={errors.receiptDate?.message}
            dir="ltr"
          />
          <FormField
            label="Delivery Date"
            name="deliveryDate"
            type="date"
            value={watch('deliveryDate')}
            onChange={(e) => handleFieldUpdate('deliveryDate', e.target.value)}
            error={errors.deliveryDate?.message}
            dir="ltr"
          />
        </div>
      </FormSection>

      {/* SECTION: Company Info */}
      <FormSection title="Company Info">
        <FormField
          label="Company Name"
          name="company.nameAr"
          value={watch('company.nameAr')}
          onChange={(e) => handleFieldUpdate('company.nameAr', e.target.value)}
          error={errors.company?.nameAr?.message}
        />
        <FormField
          label="Company Address"
          name="company.addressAr"
          value={watch('company.addressAr')}
          onChange={(e) => handleFieldUpdate('company.addressAr', e.target.value)}
          error={errors.company?.addressAr?.message}
        />
        <FormField
          label="Company Phone"
          name="company.phone"
          value={watch('company.phone')}
          onChange={(e) => handleFieldUpdate('company.phone', e.target.value)}
          error={errors.company?.phone?.message}
        />
      </FormSection>

      {/* SECTION 1: Car Information */}
      <FormSection title="Car Information">
        <FormField
          label="Plate Number"
          name="car.plateNumber"
          value={watch('car.plateNumber')}
          onChange={(e) => handleFieldUpdate('car.plateNumber', e.target.value)}
          error={errors.car?.plateNumber?.message}
        />
        <FormField
          label="Owner"
          name="car.owner"
          value={watch('car.owner')}
          onChange={(e) => handleFieldUpdate('car.owner', e.target.value)}
          error={errors.car?.owner?.message}
        />
        <FormField
          label="ID Number"
          name="car.idNumber"
          value={watch('car.idNumber')}
          onChange={(e) => handleFieldUpdate('car.idNumber', e.target.value)}
          error={errors.car?.idNumber?.message}
          dir="ltr"
        />
      </FormSection>

      {/* SECTION 2: Receiver Information */}
      <FormSection title="Receiver Information">
        <FormField
          label="Receiver Name"
          name="receiver.name"
          value={watch('receiver.name')}
          onChange={(e) => handleFieldUpdate('receiver.name', e.target.value)}
          error={errors.receiver?.name?.message}
        />
        <FormField
          label="Receiver Address"
          name="receiver.address"
          value={watch('receiver.address')}
          onChange={(e) => handleFieldUpdate('receiver.address', e.target.value)}
          error={errors.receiver?.address?.message}
        />
        <FormField
          label="Receiver Mobile"
          name="receiver.mobile"
          value={watch('receiver.mobile')}
          onChange={(e) => handleFieldUpdate('receiver.mobile', e.target.value)}
          error={errors.receiver?.mobile?.message}
          dir="ltr"
        />
      </FormSection>

      {/* SECTION 3: Transportation Information */}
      <FormSection title="Transportation Information">
        <FormField
          label="From City"
          name="transport.fromCity"
          value={watch('transport.fromCity')}
          onChange={(e) => handleFieldUpdate('transport.fromCity', e.target.value)}
          error={errors.transport?.fromCity?.message}
        />
        <FormField
          label="To City"
          name="transport.toCity"
          value={watch('transport.toCity')}
          onChange={(e) => handleFieldUpdate('transport.toCity', e.target.value)}
          error={errors.transport?.toCity?.message}
        />
        <FormField
          label="Order No"
          name="transport.orderNo"
          value={watch('transport.orderNo')}
          onChange={(e) => handleFieldUpdate('transport.orderNo', e.target.value)}
          error={errors.transport?.orderNo?.message}
          dir="ltr"
        />
      </FormSection>

      {/* SECTION 4: Driver Information */}
      <FormSection title="Driver Information">
        <FormField
          label="Name"
          name="driver.name"
          value={watch('driver.name')}
          onChange={(e) => handleFieldUpdate('driver.name', e.target.value)}
          error={errors.driver?.name?.message}
        />
        <FormField
          label="Iqama Number"
          name="driver.iqamaNumber"
          value={watch('driver.iqamaNumber')}
          onChange={(e) => handleFieldUpdate('driver.iqamaNumber', e.target.value)}
          error={errors.driver?.iqamaNumber?.message}
          dir="ltr"
        />
        <FormField
          label="Mobile"
          name="driver.mobile"
          value={watch('driver.mobile')}
          onChange={(e) => handleFieldUpdate('driver.mobile', e.target.value)}
          error={errors.driver?.mobile?.message}
          dir="ltr"
        />
      </FormSection>

      {/* SECTION 5: Load Information */}
      <FormSection title="Load Information">
        <FormField
          label="Load Type"
          name="load.type"
          value={watch('load.type')}
          onChange={(e) => handleFieldUpdate('load.type', e.target.value)}
          error={errors.load?.type?.message}
        />
        <FormField
          label="Goods Weight"
          name="load.weight"
          value={watch('load.weight')}
          onChange={(e) => handleFieldUpdate('load.weight', e.target.value)}
          error={errors.load?.weight?.message}
        />
      </FormSection>
    </form>
  );
};
