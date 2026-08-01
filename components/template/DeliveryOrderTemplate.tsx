'use client';

import React, { forwardRef } from 'react';
import { DeliveryOrder, CompanyInfo } from '@/types/delivery-order';

interface DeliveryOrderTemplateProps {
  order: DeliveryOrder;
  /** When provided, value cells become inline-editable */
  onOrderChange?: (updated: DeliveryOrder) => void;
}

/** Inline-editable input — when onChange is undefined it renders as plain text */
function E({
  value,
  onChange,
  dir = 'auto',
  className = '',
  type = 'text',
}: {
  value: string;
  onChange?: (v: string) => void;
  dir?: 'ltr' | 'rtl' | 'auto';
  className?: string;
  type?: 'text' | 'tel' | 'number';
}) {
  if (!onChange) return <span dir={dir} className={className}>{value}</span>;
  return (
    <input
      type={type}
      defaultValue={value}
      dir={dir}
      onBlur={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
      }}
      className={`bg-transparent border-none outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-400 rounded cursor-text ${className}`}
      style={{ width: `${Math.max(value.length, 1)}ch` }}
    />
  );
}

export const DeliveryOrderTemplate = forwardRef<HTMLDivElement, DeliveryOrderTemplateProps>(
  ({ order, onOrderChange }, ref) => {
    /** Helper to patch a top-level field */
    const set = <K extends keyof DeliveryOrder>(key: K, value: DeliveryOrder[K]) =>
      onOrderChange?.({ ...order, [key]: value });

    /** Helper to patch a nested group */
    const setGroup = <G extends keyof DeliveryOrder>(
      group: G,
      field: keyof DeliveryOrder[G],
      value: string
    ) =>
      onOrderChange?.({
        ...order,
        [group]: { ...(order[group] as object), [field]: value },
      });

    const F = onOrderChange ? true : false; // editable flag shorthand

    return (
      <div
        ref={ref}
        id="visual-page-id"
        style={{
          width: '794px', minWidth: '794px', maxWidth: '794px',
          margin: '0 auto', background: 'gray', padding: '0px',
          position: 'relative', display: 'flow-root',
        }}
      >
        <div
          data-role="style-shell"
          style={{ backgroundColor: 'rgb(255,255,255)' }}
          className="font-['Cairo',sans-serif] text-slate-900"
        >
          <div className="min-h-[1123px] bg-white p-[30px] flex flex-col justify-between">
            {/* ── Top Content ── */}
            <div className="flex flex-col gap-[14px]">

              {/* ── HEADER ── */}
              <div className="flex justify-between items-start w-full pt-[6px] pb-[10px]">
                {/* Logo */}
                <div className="flex flex-col items-center justify-center"
                  style={{ width: '138px', height: '103px' }}>
                  <div className="rounded-[4px] flex flex-col items-center justify-center p-[6px]"
                    style={{ width: '130px', height: '115px' }}>
                    {/* eslint-disable-next-html-element-for-img */}
                    <img src="/amar-logo.png" alt="Logo" className="w-full h-full object-contain"
                      style={{ width: '216px', height: '152px' }} />
                  </div>
                </div>

                {/* Company Info + QR */}
                <div className="flex items-start gap-[16px]">
                  <div className="text-right flex flex-col justify-center pt-[2px] dir-rtl">
                    <h1 dir="auto" className="font-extrabold text-black font-cairo" style={{ fontSize: '20px' }}>
                      <E value={order.company.nameAr}
                        onChange={F ? (v) => setGroup('company', 'nameAr' as keyof CompanyInfo, v) : undefined}
                        dir="rtl" />
                    </h1>
                    <p dir="auto" className="font-bold text-gray-800 mt-[4px] font-cairo" style={{ fontSize: '20px' }}>
                      <E value={order.company.addressAr}
                        onChange={F ? (v) => setGroup('company', 'addressAr' as keyof CompanyInfo, v) : undefined}
                        dir="rtl" />
                    </p>
                    <p dir="auto" className="font-bold text-gray-800 mt-[4px] font-cairo" style={{ fontSize: '20px' }}>
                      <E value={order.company.phone}
                        onChange={F ? (v) => setGroup('company', 'phone' as keyof CompanyInfo, v) : undefined}
                        dir="ltr" />
                    </p>
                  </div>
                  {/* QR */}
                  <div className="w-[92px] h-[92px] rounded-[2px] overflow-hidden p-[2px] bg-white flex items-center justify-center">
                    {/* eslint-disable-next-html-element-for-img */}
                    <img src="/qr-code.png" alt="QR Code" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* ── INVOICE META TABLE ── */}
              <div className="w-full border border-gray-400 text-[13px]">
                <div className="flex w-full min-h-[42px]">
                  {/* Invoice Number label */}
                  <div className="w-[210px] bg-[#f0f0f0] border-r border-gray-400 p-[6px] px-[8px] flex items-center justify-between font-bold text-gray-800">
                    <span dir="auto" className="font-['Roboto',sans-serif]">Invoice Number /</span>
                    <span dir="auto" className="dir-rtl">رقم الطلب</span>
                  </div>
                  {/* Invoice Number value */}
                  <div className="w-[70px] border-r border-gray-400 p-[6px] flex items-center justify-center font-bold text-gray-900">
                    <E value={order.invoiceNumber}
                      onChange={F ? (v) => set('invoiceNumber', v) : undefined}
                      dir="ltr" className="font-['Roboto',sans-serif]" />
                  </div>
                  {/* Receipt Date label */}
                  <div className="w-[220px] bg-[#f0f0f0] border-r border-gray-400 p-[6px] px-[8px] flex items-center justify-between font-bold text-gray-800">
                    <span dir="auto" className="font-['Roboto',sans-serif]">Reciept Date /</span>
                    <span dir="auto" className="dir-rtl">تاريخ الاستلام</span>
                  </div>
                  {/* Receipt Date value */}
                  <div className="w-[110px] border-r border-gray-400 p-[6px] flex items-center justify-center font-bold text-gray-800">
                    <E value={order.receiptDate}
                      onChange={F ? (v) => set('receiptDate', v) : undefined}
                      dir="ltr" className="font-['Roboto',sans-serif]" />
                  </div>
                  {/* Delivery Date label */}
                  <div className="w-[210px] bg-[#f0f0f0] border-r border-gray-400 p-[6px] px-[8px] flex items-center justify-between font-bold text-gray-800">
                    <span dir="auto" className="font-['Roboto',sans-serif]">Delivery Date /</span>
                    <span dir="auto" className="dir-rtl">تاريخ التسليم</span>
                  </div>
                  {/* Delivery Date value */}
                  <div className="w-[114px] p-[6px] flex items-center justify-center font-bold text-gray-800">
                    <E value={order.deliveryDate}
                      onChange={F ? (v) => set('deliveryDate', v) : undefined}
                      dir="ltr" className="font-['Roboto',sans-serif]" />
                  </div>
                </div>
              </div>

              {/* ── SECTION 1: CAR INFORMATION ── */}
              <div className="w-full border border-gray-400">
                <div className="bg-[#204978] text-white px-[12px] py-[5px] flex justify-between items-center text-[15px] font-bold">
                  <span dir="auto" className="font-['Roboto',sans-serif]">Car Information</span>
                  <span dir="auto" className="dir-rtl">معلومات المركبة</span>
                </div>
                <div className="w-full text-[13px]">
                  {/* Label Row */}
                  <div className="flex w-full bg-[#f0f0f0] border-b border-gray-400 font-bold text-gray-800">
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Plate number</div>
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Owner</div>
                    <div className="w-[33.33%] p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">ID number</div>
                  </div>
                  {/* Value Row */}
                  <div className="flex w-full font-bold text-gray-900 bg-white">
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] dir-rtl">
                      <E value={order.car.plateNumber} onChange={F ? (v) => setGroup('car', 'plateNumber', v) : undefined} dir="rtl" />
                    </div>
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] dir-rtl">
                      <E value={order.car.owner} onChange={F ? (v) => setGroup('car', 'owner', v) : undefined} dir="rtl" />
                    </div>
                    <div className="w-[33.33%] p-[6px] px-[10px] font-['Roboto',sans-serif]">
                      <E value={order.car.idNumber} onChange={F ? (v) => setGroup('car', 'idNumber', v) : undefined} dir="ltr" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: RECEIVER INFORMATION ── */}
              <div className="w-full border border-gray-400">
                <div className="bg-[#204978] text-white px-[12px] py-[5px] flex justify-between items-center text-[15px] font-bold">
                  <span dir="auto" className="font-['Roboto',sans-serif]">Receiver Information</span>
                  <span dir="auto" className="dir-rtl">معلومات المستلم</span>
                </div>
                <div className="w-full text-[13px]">
                  <div className="flex w-full bg-[#f0f0f0] border-b border-gray-400 font-bold text-gray-800">
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Receiver Name</div>
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Receiver Address</div>
                    <div className="w-[33.33%] p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Receiver Mobile</div>
                  </div>
                  <div className="flex w-full font-bold text-gray-900 bg-white">
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] dir-rtl">
                      <E value={order.receiver.name} onChange={F ? (v) => setGroup('receiver', 'name', v) : undefined} dir="rtl" />
                    </div>
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] dir-rtl">
                      <E value={order.receiver.address} onChange={F ? (v) => setGroup('receiver', 'address', v) : undefined} dir="rtl" />
                    </div>
                    <div className="w-[33.33%] p-[6px] px-[10px] font-['Roboto',sans-serif]">
                      <E value={order.receiver.mobile} onChange={F ? (v) => setGroup('receiver', 'mobile', v) : undefined} dir="ltr" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: TRANSPORTATION INFORMATION ── */}
              <div className="w-full border border-gray-400">
                <div className="bg-[#204978] text-white px-[12px] py-[5px] flex justify-between items-center text-[15px] font-bold">
                  <span dir="auto" className="font-['Roboto',sans-serif]">Transportation Information</span>
                  <span dir="auto" className="dir-rtl">معلومات النقل</span>
                </div>
                <div className="w-full text-[13px]">
                  <div className="flex w-full bg-[#f0f0f0] border-b border-gray-400 font-bold text-gray-800">
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">From City</div>
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">To City</div>
                    <div className="w-[33.33%] p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Order No</div>
                  </div>
                  <div className="flex w-full font-bold text-gray-900 bg-white">
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] dir-rtl">
                      <E value={order.transport.fromCity} onChange={F ? (v) => setGroup('transport', 'fromCity', v) : undefined} dir="rtl" />
                    </div>
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] dir-rtl">
                      <E value={order.transport.toCity} onChange={F ? (v) => setGroup('transport', 'toCity', v) : undefined} dir="rtl" />
                    </div>
                    <div className="w-[33.33%] p-[6px] px-[10px] font-['Roboto',sans-serif]">
                      <E value={order.transport.orderNo} onChange={F ? (v) => setGroup('transport', 'orderNo', v) : undefined} dir="ltr" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: DRIVER INFORMATION ── */}
              <div className="w-full border border-gray-400">
                <div className="bg-[#204978] text-white px-[12px] py-[5px] flex justify-between items-center text-[15px] font-bold">
                  <span dir="auto" className="font-['Roboto',sans-serif]">Driver Information</span>
                  <span dir="auto" className="dir-rtl">معلومات السائق</span>
                </div>
                <div className="w-full text-[13px]">
                  <div className="flex w-full bg-[#f0f0f0] border-b border-gray-400 font-bold text-gray-800">
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Name</div>
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Iqama Number</div>
                    <div className="w-[33.33%] p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Mobile</div>
                  </div>
                  <div className="flex w-full font-bold text-gray-900 bg-white">
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] dir-rtl">
                      <E value={order.driver.name} onChange={F ? (v) => setGroup('driver', 'name', v) : undefined} dir="rtl" />
                    </div>
                    <div className="w-[33.33%] border-r border-gray-400 p-[6px] px-[10px] font-['Roboto',sans-serif]">
                      <E value={order.driver.iqamaNumber} onChange={F ? (v) => setGroup('driver', 'iqamaNumber', v) : undefined} dir="ltr" />
                    </div>
                    <div className="w-[33.33%] p-[6px] px-[10px] font-['Roboto',sans-serif]">
                      <E value={order.driver.mobile} onChange={F ? (v) => setGroup('driver', 'mobile', v) : undefined} dir="ltr" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: LOAD INFORMATION ── */}
              <div className="w-full border border-gray-400">
                <div className="bg-[#204978] text-white px-[12px] py-[5px] flex justify-between items-center text-[15px] font-bold">
                  <span dir="auto" className="font-['Roboto',sans-serif]">Load Information</span>
                  <span dir="auto" className="dir-rtl">معلومات الحمولة</span>
                </div>
                <div className="w-full text-[13px]">
                  <div className="flex w-full bg-[#f0f0f0] border-b border-gray-400 font-bold text-gray-800">
                    <div className="w-[50%] border-r border-gray-400 p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Load Type</div>
                    <div className="w-[50%] p-[6px] px-[10px] text-left font-['Roboto',sans-serif]">Goods Weight</div>
                  </div>
                  <div className="flex w-full font-bold text-gray-900 bg-white">
                    <div className="w-[50%] border-r border-gray-400 p-[6px] px-[10px] dir-rtl">
                      <E value={order.load.type} onChange={F ? (v) => setGroup('load', 'type', v) : undefined} dir="rtl" />
                    </div>
                    <div className="w-[50%] p-[6px] px-[10px] dir-rtl">
                      <E value={order.load.weight} onChange={F ? (v) => setGroup('load', 'weight', v) : undefined} dir="rtl" />
                    </div>
                  </div>
                </div>
              </div>

            </div>{/* end top content */}

            {/* Bottom spacing */}
            <div className="w-full h-[20px]" />
          </div>
        </div>
      </div>
    );
  }
);

DeliveryOrderTemplate.displayName = 'DeliveryOrderTemplate';
