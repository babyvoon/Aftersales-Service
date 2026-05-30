'use client';

import React, { useState } from 'react';
import { 
  Clock, CheckCircle, Wrench, AlertTriangle, ArrowRight, 
  Car, User, ArrowLeftRight, Package, Eye
} from 'lucide-react';
import { ServiceTicket, TicketStatus, UserRole } from '../types';

interface KanbanBoardProps {
  tickets: ServiceTicket[];
  onStatusChange: (ticketId: number, newStatus: TicketStatus) => void;
  onOpenDetails: (ticket: ServiceTicket) => void;
  currentRole: UserRole;
  language: 'EN' | 'TH';
}

const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  PENDING: ['IN_PROGRESS', 'WAITING_FOR_PARTS'],
  IN_PROGRESS: ['WAITING_FOR_PARTS', 'COMPLETED'],
  WAITING_FOR_PARTS: ['IN_PROGRESS'],
  COMPLETED: ['DELIVERED'],
  DELIVERED: [],
};

const TRANSLATIONS = {
  EN: {
    dragGuide: "Drag cards between columns to change status, or use quick-action buttons inside cards.",
    pending: "Pending Intake",
    inProgress: "In Progress",
    waitingParts: "Waiting for Parts",
    completed: "Completed",
    delivered: "Delivered / Settled",
    viewDetails: "View Details",
    mechanic: "Mechanic:",
    unassigned: "Unassigned",
    totalBill: "Total Bill:",
    noTickets: "No tickets in this status.",
    to: "To",
    accessDeniedMech: "Access Denied: Mechanics can only transition tickets to 'In Progress' or 'Completed'.",
    invalidTransition: "Invalid transition: Tickets in '{from}' status cannot be moved directly to '{to}'.",
    invalidMovement: "Invalid movement."
  },
  TH: {
    dragGuide: "ลากการ์ดระหว่างคอลัมน์เพื่อเปลี่ยนสถานะ หรือใช้ปุ่มลัดด่วนด้านในการ์ดเพื่อเปลี่ยนขั้นตอน",
    pending: "รับรถ / ตรวจอาการ",
    inProgress: "กำลังซ่อมบำรุง",
    waitingParts: "รอชิ้นส่วนอะไหล่",
    completed: "ซ่อมเสร็จสิ้น",
    delivered: "ส่งมอบรถ / ปิดงาน",
    viewDetails: "ดูรายละเอียด",
    mechanic: "ช่างผู้ดูแล:",
    unassigned: "ยังไม่มอบหมาย",
    totalBill: "ยอดรวมสุทธิ:",
    noTickets: "ไม่มีใบงานในสถานะนี้",
    to: "ย้ายไป",
    accessDeniedMech: "ปฏิเสธการเข้าถึง: ช่างสามารถเปลี่ยนสถานะไปที่ 'กำลังซ่อมบำรุง' หรือ 'ซ่อมเสร็จสิ้น' เท่านั้น",
    invalidTransition: "ไม่สามารถเปลี่ยนขั้นตอนได้: จากใบงานสถานะ '{from}' ไปยัง '{to}' โดยตรงไม่ได้",
    invalidMovement: "การเคลื่อนย้ายไม่ถูกต้อง"
  }
};

export default function KanbanBoard({
  tickets,
  onStatusChange,
  onOpenDetails,
  currentRole,
  language,
}: KanbanBoardProps) {
  const [draggedTicketId, setDraggedTicketId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TicketStatus | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  const COLUMNS: { id: TicketStatus; label: string; color: string; bg: string; border: string; icon: React.ReactNode }[] = [
    { 
      id: 'PENDING', 
      label: t.pending, 
      color: 'text-slate-700 dark:text-slate-300', 
      bg: 'bg-slate-100/50 dark:bg-slate-900/30', 
      border: 'border-slate-200 dark:border-slate-800',
      icon: <Clock className="h-4 w-4" /> 
    },
    { 
      id: 'IN_PROGRESS', 
      label: t.inProgress, 
      color: 'text-blue-700 dark:text-blue-300', 
      bg: 'bg-blue-50/30 dark:bg-blue-950/10', 
      border: 'border-blue-200/50 dark:border-blue-900/30',
      icon: <Wrench className="h-4 w-4 text-blue-500" /> 
    },
    { 
      id: 'WAITING_FOR_PARTS', 
      label: t.waitingParts, 
      color: 'text-amber-700 dark:text-amber-300', 
      bg: 'bg-amber-50/30 dark:bg-amber-950/10', 
      border: 'border-amber-200/50 dark:border-amber-900/30',
      icon: <Package className="h-4 w-4 text-amber-500" /> 
    },
    { 
      id: 'COMPLETED', 
      label: t.completed, 
      color: 'text-emerald-700 dark:text-emerald-300', 
      bg: 'bg-emerald-50/30 dark:bg-emerald-950/10', 
      border: 'border-emerald-200/50 dark:border-emerald-900/30',
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> 
    },
    { 
      id: 'DELIVERED', 
      label: t.delivered, 
      color: 'text-indigo-700 dark:text-indigo-300', 
      bg: 'bg-indigo-50/30 dark:bg-indigo-950/10', 
      border: 'border-indigo-200/50 dark:border-indigo-900/30',
      icon: <CheckCircle className="h-4 w-4 text-indigo-500" /> 
    },
  ];

  // Validate state transition & role permissions
  const validateTransition = (ticket: ServiceTicket, targetStatus: TicketStatus): { valid: boolean; error?: string } => {
    const currentStatus = ticket.status;

    if (currentStatus === targetStatus) {
      return { valid: true };
    }

    // Role-based restrictions
    if (currentRole === 'MECHANIC') {
      if (targetStatus !== 'IN_PROGRESS' && targetStatus !== 'COMPLETED') {
        return {
          valid: false,
          error: t.accessDeniedMech,
        };
      }
    }

    // State machine rule validation
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      const fromLabel = language === 'EN' ? currentStatus.replace(/_/g, ' ') : TRANSLATIONS.TH[currentStatus as keyof typeof TRANSLATIONS.TH];
      const toLabel = language === 'EN' ? targetStatus.replace(/_/g, ' ') : TRANSLATIONS.TH[targetStatus as keyof typeof TRANSLATIONS.TH];
      
      return {
        valid: false,
        error: t.invalidTransition.replace('{from}', fromLabel).replace('{to}', toLabel),
      };
    }

    return { valid: true };
  };

  // HTML5 Drag Event Handlers
  const handleDragStart = (e: React.DragEvent, ticketId: number) => {
    setDraggedTicketId(ticketId);
    e.dataTransfer.setData('text/plain', ticketId.toString());
    e.dataTransfer.effectAllowed = 'move';
    setValidationError(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TicketStatus) => {
    e.preventDefault();
    if (dragOverCol !== columnId) {
      setDragOverCol(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TicketStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const ticketIdStr = e.dataTransfer.getData('text/plain') || draggedTicketId?.toString();
    
    if (!ticketIdStr) return;
    const ticketId = Number(ticketIdStr);
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;

    const validation = validateTransition(ticket, targetStatus);
    if (validation.valid) {
      onStatusChange(ticketId, targetStatus);
      setValidationError(null);
    } else {
      setValidationError(validation.error || t.invalidMovement);
      setTimeout(() => setValidationError(null), 4000);
    }
    
    setDraggedTicketId(null);
  };

  const handleQuickMove = (ticket: ServiceTicket, targetStatus: TicketStatus) => {
    const validation = validateTransition(ticket, targetStatus);
    if (validation.valid) {
      onStatusChange(ticket.id, targetStatus);
      setValidationError(null);
    } else {
      setValidationError(validation.error || t.invalidMovement);
      setTimeout(() => setValidationError(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert for Validation Errors */}
      {validationError && (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-xl dark:border-rose-950 dark:bg-rose-950/80 animate-in fade-in slide-in-from-bottom-5">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <div className="text-xs text-rose-800 dark:text-rose-200 font-semibold">
            {validationError}
          </div>
          <button 
            onClick={() => setValidationError(null)} 
            className="ml-auto rounded-lg p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900"
          >
            <Clock className="h-3 w-3 rotate-45" />
          </button>
        </div>
      )}

      {/* Guide Header for Drag & Drop transitions */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 font-medium">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span>{t.dragGuide}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-300"></span> {t.pending}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-450"></span> {t.inProgress}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-450"></span> {t.waitingParts}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-450"></span> {t.completed}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-400"></span> {t.delivered}
          </span>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2">
        {COLUMNS.map((column) => {
          const columnTickets = tickets.filter((t) => t.status === column.id);
          const isOver = dragOverCol === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col rounded-2xl border p-4 transition-all duration-300 min-h-[500px] ${column.bg} ${
                isOver 
                  ? 'border-blue-500 ring-2 ring-blue-500/20 scale-[1.01] bg-blue-50/50 dark:bg-blue-950/20' 
                  : column.border
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {column.icon}
                  <span className={column.color}>{column.label}</span>
                </div>
                <span className="rounded-full bg-slate-200/60 px-2 py-0.5 font-bold text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {columnTickets.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="mt-3 flex-1 space-y-3 overflow-y-auto">
                {columnTickets.length === 0 ? (
                  <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {t.noTickets}
                    </p>
                  </div>
                ) : (
                  columnTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ticket.id)}
                      className={`group relative flex flex-col p-4 cursor-grab active:cursor-grabbing hover:scale-[1.02] ${
                        ticket.status === 'PENDING' ? 'glowing-card glowing-card-slate' :
                        ticket.status === 'IN_PROGRESS' ? 'glowing-card glowing-card-blue' :
                        ticket.status === 'WAITING_FOR_PARTS' ? 'glowing-card glowing-card-amber' :
                        ticket.status === 'COMPLETED' ? 'glowing-card glowing-card-emerald' :
                        'glowing-card glowing-card-blue'
                      }`}
                    >
                      {/* Ticket ID & Top Section */}
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span>{language === 'EN' ? 'TICKET' : 'ใบงาน'} #{ticket.id}</span>
                        <button
                          onClick={() => onOpenDetails(ticket)}
                          className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition"
                        >
                          <Eye className="h-3 w-3" />
                          <span>{t.viewDetails}</span>
                        </button>
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">
                        {ticket.description}
                      </p>

                      {/* Vehicle Badge */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Car className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {ticket.licensePlate}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({ticket.vehicleBrand} {ticket.vehicleModel})
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <User className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                        <span className="truncate">{ticket.customerName}</span>
                      </div>

                      {/* Mechanic Info */}
                      <div className="mt-3.5 border-t border-slate-100 pt-2 dark:border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 uppercase tracking-wider">{language === 'EN' ? 'Mechanic:' : 'ช่างประจำงาน:'}</span>
                        <span className={`font-semibold rounded px-1.5 py-0.5 ${
                          ticket.mechanicName 
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300 font-normal italic'
                        }`}>
                          {ticket.mechanicName || t.unassigned}
                        </span>
                      </div>

                      {/* Price / Invoice summary */}
                      <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="text-slate-400 font-normal">{t.totalBill}</span>
                        <span className="text-slate-900 dark:text-white">${ticket.totalWithVat.toFixed(2)}</span>
                      </div>

                      {/* Quick Move Buttons (Visible on hover on desktop, always visible on mobile) */}
                      <div className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800 flex flex-wrap gap-1.5 justify-end">
                        {VALID_TRANSITIONS[ticket.status]?.map((nextStatus) => {
                          const isRoleValid = !(currentRole === 'MECHANIC' && nextStatus !== 'IN_PROGRESS' && nextStatus !== 'COMPLETED');
                          if (!isRoleValid) return null;

                          const statusLabel = language === 'EN' 
                            ? nextStatus.replace(/_/g, ' ') 
                            : TRANSLATIONS.TH[nextStatus as keyof typeof TRANSLATIONS.TH];

                          return (
                            <button
                              key={nextStatus}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickMove(ticket, nextStatus);
                              }}
                              className="inline-flex items-center gap-0.5 rounded bg-slate-50 border border-slate-200/60 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-tight dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-blue-950/20 dark:hover:text-blue-300 transition"
                            >
                              <span>{t.to} {statusLabel}</span>
                              <ArrowRight className="h-2 w-2" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
