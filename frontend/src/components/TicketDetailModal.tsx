/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, User, Car, FileText, Wrench, Plus, Trash2, 
  Coins, Calendar, AlertCircle, Printer, Check 
} from 'lucide-react';
import { ServiceTicket, User as SystemUser, SparePart, TicketItem, UserRole } from '../types';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ServiceTicket | null;
  onUpdateTicket: (updatedTicket: ServiceTicket) => void;
  onDeleteTicket: (ticketId: number) => void;
  currentRole: UserRole;
  mechanics: SystemUser[];
  partsCatalog: SparePart[];
  language: 'EN' | 'TH';
}

const TRANSLATIONS = {
  EN: {
    ticket: "Ticket",
    details: "Service Ticket Details",
    loggedAs: "Logged in as",
    readOnlyBanner: "You have view-only access to this ticket.",
    editBanner: "You have full edit access.",
    custInfo: "Customer Information",
    vehInfo: "Vehicle Details",
    custId: "ID",
    vehPlate: "Plate",
    vehId: "Vehicle ID",
    issueDesc: "Issue Description",
    assignedMech: "Assigned Mechanic",
    laborCost: "Labor Cost (฿)",
    unassigned: "Unassigned",
    saveSuccess: "Changes Saved!",
    saveDetails: "Save Details",
    spareParts: "Spare Parts & Materials",
    itemsCount: "items",
    addSpare: "Add Spare Part",
    qty: "Qty",
    addPartBtn: "Add Part",
    partDetailsTh: "Part Details",
    unitPriceTh: "Unit Price",
    subtotalTh: "Subtotal",
    noParts: "No spare parts added to this service ticket yet.",
    billingReceipt: "Live Billing Receipt",
    laborCostReceipt: "Labor Cost:",
    partsMaterials: "Parts & Materials:",
    subtotalReceipt: "Subtotal:",
    vatAmount: "VAT (7.0%):",
    totalBill: "TOTAL BILL (INC. VAT):",
    created: "Created",
    deleteBtn: "Soft Delete Ticket",
    confirmDelete: "Are you sure you want to soft-delete this service ticket? This action can be undone by database administrators.",
    insufficientStock: "Insufficient stock. Only {qty} units available.",
    cannotAddMore: "Cannot add more. Total would be {qty}, which exceeds available stock ({stock}).",
  },
  TH: {
    ticket: "ใบงานหมายเลข",
    details: "รายละเอียดงานบริการซ่อมบำรุง",
    loggedAs: "เข้าสู่ระบบด้วยสิทธิ์",
    readOnlyBanner: "คุณมีสิทธิ์ดูข้อมูลของใบงานนี้ได้อย่างเดียว",
    editBanner: "คุณมีสิทธิ์แก้ไขข้อมูลและจัดการใบงานนี้ได้อย่างเต็มที่",
    custInfo: "ข้อมูลรายละเอียดลูกค้า",
    vehInfo: "ข้อมูลรายละเอียดรถยนต์",
    custId: "รหัสลูกค้า",
    vehPlate: "ป้ายทะเบียน",
    vehId: "รหัสรถยนต์",
    issueDesc: "คำอธิบายอาการเสีย / งานซ่อมบำรุง",
    assignedMech: "ช่างเทคนิคผู้ดูแลงาน",
    laborCost: "ค่าบริการค่าแรงช่าง (฿)",
    unassigned: "ยังไม่มอบหมาย",
    saveSuccess: "บันทึกข้อมูลสำเร็จ!",
    saveDetails: "บันทึกข้อมูลบิล",
    spareParts: "ชิ้นส่วนอะไหล่และอุปกรณ์ประกอบ",
    itemsCount: "รายการ",
    addSpare: "เพิ่มรายการอะไหล่ในใบงาน",
    qty: "จำนวน",
    addPartBtn: "เพิ่มรายการอะไหล่",
    partDetailsTh: "รายละเอียดสินค้าอะไหล่",
    unitPriceTh: "ราคาต่อหน่วย",
    subtotalTh: "รวมเงิน",
    noParts: "ยังไม่ได้เพิ่มรายการอะไหล่ในใบงานซ่อมนี้",
    billingReceipt: "ใบเสร็จแจ้งยอดค่าบริการ",
    laborCostReceipt: "ค่าแรงบริการช่าง:",
    partsMaterials: "ยอดรวมค่าอะไหล่:",
    subtotalReceipt: "ยอดรวมก่อนภาษี:",
    vatAmount: "ภาษีมูลค่าเพิ่ม (7.0%):",
    totalBill: "ยอดชำระสุทธิ (รวม VAT):",
    created: "สร้างขึ้นเมื่อ",
    deleteBtn: "ลบใบงาน (Soft Delete)",
    confirmDelete: "คุณแน่ใจหรือไม่ว่าต้องการลบใบงานซ่อมบำรุงนี้ชั่วคราว? การดำเนินการนี้สามารถกู้คืนได้โดยผู้ดูแลระบบ",
    insufficientStock: "อะไหล่ในคลังมีไม่พอ มีเหลืออยู่เพียง {qty} ชิ้นเท่านั้น",
    cannotAddMore: "ไม่สามารถเพิ่มได้ ยอดรวมเท่ากับ {qty} ชิ้น ซึ่งมีมากกว่าคลังสินค้าคงเหลือ ({stock} ชิ้น)",
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
  onUpdateTicket,
  onDeleteTicket,
  currentRole,
  mechanics,
  partsCatalog,
  language,
}: TicketDetailModalProps) {
  const [description, setDescription] = useState('');
  const [laborCost, setLaborCost] = useState<number>(0);
  const [mechanicId, setMechanicId] = useState<number | null>(null);
  
  // State for adding a part
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [partError, setPartError] = useState<string | null>(null);
  
  // State for success feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const t = TRANSLATIONS[language];

  // Sync state with ticket when it opens or changes
  useEffect(() => {
    if (ticket) {
      setDescription(ticket.description);
      setLaborCost(ticket.laborCost);
      setMechanicId(ticket.mechanicId);
      setSelectedPartId(partsCatalog[0]?.id || null);
      setPartQuantity(1);
      setPartError(null);
      setSaveSuccess(false);
      setShowDeleteConfirm(false);
    }
  }, [ticket, partsCatalog]);

  if (!isOpen || !ticket) return null;

  const isReadOnly = currentRole === 'MECHANIC';
  const isAdmin = currentRole === 'ADMIN';

  // Handle general field changes (Labor, Description, Mechanic)
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    try {
      const res = await fetch(`${API_BASE_URL}/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description,
          laborCost: Number(laborCost),
          mechanicId: mechanicId || null
        })
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          onUpdateTicket(body.data);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving general details:", err);
      alert("Failed to connect to server");
    }
  };

  // Add parts to ticket
  const handleAddPart = async () => {
    if (isReadOnly) return;
    if (!selectedPartId) return;

    const selectedPart = partsCatalog.find(p => p.id === selectedPartId);
    if (!selectedPart) return;

    // Check if quantity exceeds stock
    if (partQuantity > selectedPart.stockQuantity) {
      setPartError(t.insufficientStock.replace('{qty}', selectedPart.stockQuantity.toString()));
      return;
    }

    setPartError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/tickets/${ticket.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partId: selectedPartId,
          quantity: partQuantity
        })
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          onUpdateTicket(body.data);
          setPartQuantity(1);
          setPartError(null);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setPartError(err.message || "Failed to add part");
      }
    } catch (err) {
      console.error("Error adding part:", err);
      setPartError("Failed to connect to server");
    }
  };

  // Remove parts from ticket
  const handleRemovePart = async (itemId: number) => {
    if (isReadOnly) return;

    try {
      const res = await fetch(`${API_BASE_URL}/tickets/${ticket.id}/items/${itemId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          onUpdateTicket(body.data);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to remove part");
      }
    } catch (err) {
      console.error("Error removing part:", err);
      alert("Failed to connect to server");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      {/* Sidebar Drawer Container */}
      <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:p-8 flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t.ticket} #{ticket.id}
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  ticket.status === 'PENDING' ? 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  ticket.status === 'WAITING_FOR_PARTS' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                  ticket.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                }`}>
                  {language === 'EN' ? ticket.status.replace(/_/g, ' ') : TRANSLATIONS.TH[ticket.status as keyof typeof TRANSLATIONS.TH]}
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                {t.details}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-650 dark:hover:bg-slate-900 dark:hover:text-slate-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Role Mode Banner */}
          <div className={`mt-4 rounded-lg p-3 text-xs flex items-center justify-between ${
            isReadOnly 
              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/50' 
              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {t.loggedAs} <strong className="font-semibold">{currentRole}</strong>. 
                {isReadOnly ? ` ${t.readOnlyBanner}` : ` ${t.editBanner}`}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-8">
            {/* Customer & Vehicle Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Customer Info Card */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <User className="h-4 w-4 text-slate-400" />
                  {t.custInfo}
                </h3>
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="font-medium text-slate-800 dark:text-white">{ticket.customerName}</p>
                  <p className="text-slate-500 dark:text-slate-400">{ticket.customerPhone}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t.custId}: #{ticket.customerId}</p>
                </div>
              </div>

              {/* Vehicle Info Card */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Car className="h-4 w-4 text-slate-400" />
                  {t.vehInfo}
                </h3>
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="font-medium text-slate-800 dark:text-white">
                    {ticket.vehicleBrand} {ticket.vehicleModel} ({ticket.vehicleYear})
                  </p>
                  <p className="text-slate-655 dark:text-slate-300">
                    {t.vehPlate}: <span className="rounded bg-slate-150 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">{ticket.licensePlate}</span>
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t.vehId}: #{ticket.vehicleId}</p>
                </div>
              </div>
            </div>

            {/* Edit Ticket Form */}
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-505">
                  <FileText className="h-3.5 w-3.5" />
                  {t.issueDesc}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isReadOnly}
                  rows={3}
                  className="mt-1.5 w-full login-style-textarea text-slate-900 dark:text-white"
                  placeholder="Describe the diagnostics or client issues..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-505">
                    <Wrench className="h-3.5 w-3.5" />
                    {t.assignedMech}
                  </label>
                  <select
                    value={mechanicId || ''}
                    onChange={(e) => setMechanicId(e.target.value ? Number(e.target.value) : null)}
                    disabled={isReadOnly}
                    className="mt-1.5 w-full login-style-input text-slate-900 dark:text-white"
                  >
                    <option value="">{t.unassigned}</option>
                    {mechanics.map((mech) => (
                      <option key={mech.id} value={mech.id}>
                        {mech.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-550">
                    <Coins className="h-3.5 w-3.5" />
                    {t.laborCost}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    disabled={isReadOnly}
                    className="mt-1.5 w-full login-style-input text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="login-style-submit cursor-pointer inline-flex items-center gap-1.5 text-white"
                  >
                    {saveSuccess ? <Check className="h-3.5 w-3.5" /> : null}
                    {saveSuccess ? t.saveSuccess : t.saveDetails}
                  </button>
                </div>
              )}
            </form>

            {/* Spare Parts / Line Items Module */}
            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center justify-between">
                <span>{t.spareParts}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500 dark:bg-slate-900">
                  {ticket.items.length} {t.itemsCount}
                </span>
              </h3>

              {/* Add Part Sub-Form (Only for Admin/Advisor) */}
              {!isReadOnly && (
                <div className="mt-4 rounded-xl border border-slate-200/60 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505 mb-3">
                    {t.addSpare}
                  </h4>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <select
                        value={selectedPartId || ''}
                        onChange={(e) => {
                          setSelectedPartId(e.target.value ? Number(e.target.value) : null);
                          setPartError(null);
                        }}
                        className="w-full login-style-input text-slate-900 dark:text-white text-xs p-2"
                      >
                        {partsCatalog.map((part) => (
                          <option key={part.id} value={part.id}>
                            {part.name} ({part.partNumber}) — ฿{part.unitPrice.toFixed(2)} (Qty: {part.stockQuantity})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={partQuantity}
                        onChange={(e) => {
                          setPartQuantity(Math.max(1, parseInt(e.target.value) || 1));
                          setPartError(null);
                        }}
                        className="w-full login-style-input text-slate-900 dark:text-white text-xs p-2"
                        placeholder={t.qty}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t.addPartBtn}
                    </button>
                  </div>
                  {partError && (
                    <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {partError}
                    </p>
                  )}
                </div>
              )}

              {/* Items List Table */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs dark:divide-slate-800">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3">{t.partDetailsTh}</th>
                      <th className="p-3 text-center">{t.qty}</th>
                      <th className="p-3 text-right">{t.unitPriceTh}</th>
                      <th className="p-3 text-right">{t.subtotalTh}</th>
                      {!isReadOnly && <th className="p-3 text-center w-10"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ticket.items.length === 0 ? (
                      <tr>
                        <td colSpan={isReadOnly ? 4 : 5} className="p-6 text-center text-slate-400 dark:text-slate-505">
                          {t.noParts}
                        </td>
                      </tr>
                    ) : (
                      ticket.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                          <td className="p-3">
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{item.partName}</p>
                            <p className="font-mono text-[10px] text-slate-400">{item.partNumber}</p>
                          </td>
                          <td className="p-3 text-center font-medium text-slate-700 dark:text-slate-300">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right text-slate-600 dark:text-slate-300">
                            ฿{item.pricePerUnit.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                            ฿{item.subtotal.toFixed(2)}
                          </td>
                          {!isReadOnly && (
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePart(item.id)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-900"
                                title="Remove part"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice / Billing Receipt Module */}
            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Printer className="h-4.5 w-4.5 text-slate-400" />
                {t.billingReceipt}
              </h3>
              
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950 font-mono text-xs text-slate-600 dark:text-slate-400 space-y-2 relative overflow-hidden">
                <div className="absolute right-4 top-4 text-slate-100 dark:text-slate-900 font-extrabold text-5xl pointer-events-none select-none tracking-widest uppercase">
                  Invoice
                </div>
                
                <div className="flex justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-800">
                  <span>AFTERSALES AUTO CENTER</span>
                  <span>DATE: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="space-y-1.5 py-2">
                  <div className="flex justify-between">
                    <span>{t.laborCostReceipt}</span>
                    <span>฿{ticket.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.partsMaterials}</span>
                    <span>฿{ticket.partsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 border-t border-slate-105 pt-1.5 dark:border-slate-900">
                    <span>{t.subtotalReceipt}</span>
                    <span>฿{ticket.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{t.vatAmount}</span>
                    <span>฿{ticket.vatAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t-2 border-double border-slate-300 pt-2 text-sm font-bold text-slate-800 dark:border-slate-700 dark:text-white">
                  <span>{t.totalBill}</span>
                  <span>฿{ticket.totalWithVat.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (e.g. Delete) */}
        {isAdmin && (
          <div className="mt-8 border-t border-slate-100 pt-4 dark:border-slate-800 flex justify-between items-center">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{t.created} {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition dark:border-rose-900/30 dark:bg-rose-950/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t.deleteBtn}
            </button>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Alert icon with breathing animation */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 ring-8 ring-rose-50 dark:ring-rose-950/10 mb-4 animate-pulse">
                <AlertCircle className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'EN' ? 'Confirm Soft Delete' : 'ยืนยันการลบใบงาน'}
              </h3>
              
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
                {t.confirmDelete}
              </p>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 text-xs font-semibold dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition duration-200 cursor-pointer"
              >
                {language === 'EN' ? 'Cancel' : 'ยกเลิก'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTicket(ticket.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white px-4 py-2.5 text-xs font-semibold shadow-lg shadow-rose-500/10 transition duration-200 cursor-pointer"
              >
                {language === 'EN' ? 'Delete Ticket' : 'ยืนยันลบใบงาน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
