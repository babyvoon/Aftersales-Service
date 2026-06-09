'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Shield, Hammer, Clipboard, Play, 
  Coins, Package, Plus, Filter, LogOut, Globe, X, Sun, Moon,
  FileSpreadsheet
} from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import TicketDetailModal from '../components/TicketDetailModal';
import { ServiceTicket, TicketStatus, User as SystemUser, SparePart, UserRole } from '../types';
import './dashboard.css';

// Local Mock Fallback Data (used when backend is not running)
const MOCK_MECHANICS: SystemUser[] = [
  { id: 101, username: 'jdoe', role: 'MECHANIC', fullName: 'John Doe (Senior Mechanic)' },
  { id: 102, username: 'msmith', role: 'MECHANIC', fullName: 'Marcus Smith (Tire & Suspension)' },
  { id: 103, username: 'srogers', role: 'MECHANIC', fullName: 'Sarah Rogers (Electrical Expert)' },
  { id: 104, username: 'tstark', role: 'MECHANIC', fullName: 'Tony Stark (Diagnostics Specialist)' },
];

const INITIAL_PARTS_CATALOG: SparePart[] = [
  { id: 201, partNumber: 'BRK-552', name: 'Premium Ceramic Brake Pads', unitPrice: 89.99, stockQuantity: 12 },
  { id: 202, partNumber: 'FIL-089', name: 'High-Flow Engine Oil Filter', unitPrice: 14.50, stockQuantity: 25 },
  { id: 203, partNumber: 'BAT-990', name: '12V Lead-Acid Car Battery', unitPrice: 145.00, stockQuantity: 4 },
  { id: 204, partNumber: 'WPR-112', name: 'All-Weather Wiper Blades (Set)', unitPrice: 29.99, stockQuantity: 15 },
  { id: 205, partNumber: 'SPK-441', name: 'Iridium Spark Plug (Pack of 4)', unitPrice: 38.00, stockQuantity: 8 },
  { id: 206, partNumber: 'BEL-201', name: 'Serpentine Alternator Belt', unitPrice: 42.50, stockQuantity: 3 },
];

const INITIAL_TICKETS: ServiceTicket[] = [
  {
    id: 1001,
    description: 'Scheduled 50,000km mileage routine maintenance. Needs engine oil replacement, oil filter check, and general brake thickness inspection.',
    status: 'PENDING',
    laborCost: 95.00,
    partsTotal: 0.00,
    subtotal: 95.00,
    vatAmount: 6.65,
    totalWithVat: 101.65,
    vehicleId: 301,
    licensePlate: 'ABC-1234',
    vehicleBrand: 'Isuzu',
    vehicleModel: 'Camry',
    vehicleYear: 2020,
    customerId: 401,
    customerName: 'Alice Johnson',
    customerPhone: '+1-555-0199',
    mechanicId: null,
    mechanicName: null,
    items: [],
    createdAt: '2026-05-30T10:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
  },
  {
    id: 1002,
    description: 'Squeaking noise when braking at low speeds. Check pads wear, rotor resurfacing might be required. Diagnosed thin brake pads.',
    status: 'IN_PROGRESS',
    laborCost: 150.00,
    partsTotal: 89.99,
    subtotal: 239.99,
    vatAmount: 16.80,
    totalWithVat: 256.79,
    vehicleId: 302,
    licensePlate: 'XYZ-9876',
    vehicleBrand: 'Isuzu',
    vehicleModel: 'Civic',
    vehicleYear: 2018,
    customerId: 402,
    customerName: 'Robert Dow',
    customerPhone: '+1-555-0144',
    mechanicId: 101,
    mechanicName: 'John Doe (Senior Mechanic)',
    items: [
      {
        id: 501,
        partId: 201,
        partNumber: 'BRK-552',
        partName: 'Premium Ceramic Brake Pads',
        quantity: 1,
        pricePerUnit: 89.99,
        subtotal: 89.99,
      }
    ],
    createdAt: '2026-05-30T09:15:00Z',
    updatedAt: '2026-05-30T11:20:00Z',
  },
  {
    id: 1003,
    description: 'Vehicle does not crank or start. Battery light active on dashboard. Suspected dead battery. Jumpstart worked, alternator charging is correct.',
    status: 'WAITING_FOR_PARTS',
    laborCost: 60.00,
    partsTotal: 145.00,
    subtotal: 205.00,
    vatAmount: 14.35,
    totalWithVat: 219.35,
    vehicleId: 303,
    licensePlate: 'BAT-1100',
    vehicleBrand: 'Isuzu',
    vehicleModel: 'Explorer',
    vehicleYear: 2017,
    customerId: 403,
    customerName: 'Thomas Wayne',
    customerPhone: '+1-555-0182',
    mechanicId: 103,
    mechanicName: 'Sarah Rogers (Electrical Expert)',
    items: [
      {
        id: 502,
        partId: 203,
        partNumber: 'BAT-990',
        partName: '12V Lead-Acid Car Battery',
        quantity: 1,
        pricePerUnit: 145.00,
        subtotal: 145.00,
      }
    ],
    createdAt: '2026-05-29T14:30:00Z',
    updatedAt: '2026-05-30T08:45:00Z',
  },
  {
    id: 1004,
    description: 'Check engine light blinking. Sputtering engine during acceleration. Spark plugs replacement. Tested compression, cylinders are clean.',
    status: 'COMPLETED',
    laborCost: 120.00,
    partsTotal: 52.50,
    subtotal: 172.50,
    vatAmount: 12.08,
    totalWithVat: 184.58,
    vehicleId: 304,
    licensePlate: 'ENG-5544',
    vehicleBrand: 'Isuzu',
    vehicleModel: '330i',
    vehicleYear: 2021,
    customerId: 404,
    customerName: 'Diana Prince',
    customerPhone: '+1-555-0155',
    mechanicId: 104,
    mechanicName: 'Tony Stark (Diagnostics Specialist)',
    items: [
      {
        id: 503,
        partId: 202,
        partNumber: 'FIL-089',
        partName: 'High-Flow Engine Oil Filter',
        quantity: 1,
        pricePerUnit: 14.50,
        subtotal: 14.50,
      },
      {
        id: 504,
        partId: 205,
        partNumber: 'SPK-441',
        partName: 'Iridium Spark Plug (Pack of 4)',
        quantity: 1,
        pricePerUnit: 38.00,
        subtotal: 38.00,
      }
    ],
    createdAt: '2026-05-29T11:00:00Z',
    updatedAt: '2026-05-30T15:30:00Z',
  },
  {
    id: 1005,
    description: 'Wiper blades leaving streaks, front windshield wash nozzle clogged. Clean nozzle and replace blades.',
    status: 'DELIVERED',
    laborCost: 40.00,
    partsTotal: 29.99,
    subtotal: 69.99,
    vatAmount: 4.90,
    totalWithVat: 74.89,
    vehicleId: 305,
    licensePlate: 'WIP-3322',
    vehicleBrand: 'Isuzu',
    vehicleModel: 'CX-5',
    vehicleYear: 2019,
    customerId: 405,
    customerName: 'Barry Allen',
    customerPhone: '+1-555-0166',
    mechanicId: 102,
    mechanicName: 'Marcus Smith (Tire & Suspension)',
    items: [
      {
        id: 505,
        partId: 204,
        partNumber: 'WPR-112',
        partName: 'All-Weather Wiper Blades (Set)',
        quantity: 1,
        pricePerUnit: 29.99,
        subtotal: 29.99,
      }
    ],
    createdAt: '2026-05-28T09:00:00Z',
    updatedAt: '2026-05-29T16:00:00Z',
  }
];



const TRANSLATIONS = {
  EN: {
    appTitle: "AFTERSALES SERVICE",
    dashboard: "Dashboard",
    appSubtitle: "Automotive Repair Center Operations Control",
    roleLabel: "Role:",
    advisor: "Advisor",
    mechanic: "Mechanic",
    admin: "Admin",
    newServiceIntake: "New Service Intake",
    simulationContext: "Current Simulation Context",
    adminRoleMode: "System Administrator Role Mode",
    advisorRoleMode: "Service Advisor (SA) Role Mode",
    mechanicRoleMode: "Assigned Mechanic Role Mode",
    adminRights: "✓ Create intake tickets, edit details, assign mechanics, modify billing, add parts, and soft-delete tickets.",
    advisorRights: "✓ Create intake tickets, edit details, assign mechanics, modify billing, and add parts. Soft-delete is disabled.",
    mechanicRights: "⚠ Read-only for billing, spare parts, and ticket descriptions. Can only update status to \"In Progress\" or \"Completed\".",
    rbacEnabled: "RBAC Enabled",
    activeWorkshop: "Active Workshop",
    inProgressOrWaiting: "In-progress or awaiting parts",
    pendingIntake: "Pending Intake",
    awaitingDiagnostic: "Awaiting diagnostic triage",
    completedRevenue: "Completed Revenue",
    sumSettled: "Sum of settled tickets inc. VAT",
    inventoryAlerts: "Inventory Alerts",
    lowStockWarning: "Items with stock < 5 units",
    kanbanFlowTitle: "Workshop Kanban Flow",
    liveStatus: "Live Workspace Status",
    visualPipeline: "Visual drag-and-drop state-machine validation pipeline",
    filters: "Filters:",
    allVehicles: "All Vehicles",
    signOut: "Sign Out",
    
    // Create Intake Form
    newIntakeForm: "New Service Intake Form",
    custDetails: "1. Customer Details",
    custName: "Customer Full Name",
    phone: "Phone Number",
    vehDetails: "2. Vehicle Details",
    licensePlate: "License Plate",
    brand: "Brand",
    model: "Model",
    year: "Year",
    serviceCosts: "3. Service & Costs",
    serviceDesc: "Diagnostic / Service Description",
    laborCost: "Initial Labor Cost (฿)",
    cancel: "Cancel",
    confirmIntake: "Confirm Intake",
    
    // Form placeholders
    placeholderName: "Jane Doe",
    placeholderPhone: "+1 (555) 0180",
    placeholderPlate: "NY-8822",
    placeholderBrand: "Isuzu",
    placeholderModel: "D-Max",
    placeholderDesc: "Oil change and checking squeaking sounds under steering wheel column...",
    
    // Tooltips
    tooltipThemeLight: "Switch to Light Mode",
    tooltipThemeDark: "Switch to Dark Mode",
  },
  TH: {
    appTitle: "ระบบบริการหลังการขาย",
    dashboard: "แผงควบคุม",
    appSubtitle: "ระบบควบคุมและบริหารงานซ่อมบำรุงศูนย์บริการรถยนต์",
    roleLabel: "สิทธิ์ผู้ใช้:",
    advisor: "พนักงานรับรถ",
    mechanic: "ช่างเทคนิค",
    admin: "ผู้ดูแลระบบ",
    newServiceIntake: "รับรถเข้ารับบริการ",
    simulationContext: "บทบาทจำลองที่ใช้งานอยู่",
    adminRoleMode: "โหมดผู้ดูแลระบบ (Administrator)",
    advisorRoleMode: "โหมดพนักงานรับรถ (Service Advisor)",
    mechanicRoleMode: "โหมดช่างเทคนิคซ่อมบำรุง (Mechanic)",
    adminRights: "✓ สามารถเปิดใบงานใหม่, แก้ไขข้อมูล, มอบหมายงานช่าง, จัดการอะไหล่/บิล และลบใบงานชั่วคราวได้เต็มรูปแบบ",
    advisorRights: "✓ สามารถเปิดใบงานใหม่, แก้ไขข้อมูล, มอบหมายงานช่าง, จัดการอะไหล่/บิลได้ (ไม่ได้รับอนุญาตให้ลบใบงาน)",
    mechanicRights: "⚠ สิทธิ์อ่านอย่างเดียวสำหรับค่าแรงและอะไหล่ สามารถอัปเดตย้ายสถานะบอร์ดได้เฉพาะขั้นตอนซ่อมบำรุงเท่านั้น",
    rbacEnabled: "เปิดใช้งานสิทธิ์",
    activeWorkshop: "กำลังซ่อมในอู่",
    inProgressOrWaiting: "กำลังดำเนินการซ่อมหรือรออะไหล่",
    pendingIntake: "รับรถ / รอตรวจอาการ",
    awaitingDiagnostic: "รอดำเนินการประเมินอาการซ่อม",
    completedRevenue: "ปิดงานรับเงินแล้ว",
    sumSettled: "ยอดชำระของงานที่ส่งมอบแล้ว (รวม VAT)",
    inventoryAlerts: "คลังอะไหล่เตือนภัย",
    lowStockWarning: "จำนวนรายการอะไหล่ที่มีน้อยกว่า 5 ชิ้น",
    kanbanFlowTitle: "ผังงานขั้นตอนซ่อมบำรุง",
    liveStatus: "สถานะการทำงานปัจจุบัน",
    visualPipeline: "ระบบตรวจสอบวงจรการทำงานอัตโนมัติ (State-Machine)",
    filters: "ตัวกรอง:",
    allVehicles: "รถยนต์ทั้งหมด",
    signOut: "ออกจากระบบ",
    
    // Create Intake Form
    newIntakeForm: "ฟอร์มรับรถเข้ารับบริการใหม่",
    custDetails: "1. รายละเอียดข้อมูลลูกค้า",
    custName: "ชื่อ-นามสกุล ลูกค้า",
    phone: "เบอร์โทรติดต่อ",
    vehDetails: "2. รายละเอียดข้อมูลรถยนต์",
    licensePlate: "เลขทะเบียนรถยนต์",
    brand: "ยี่ห้อรถยนต์",
    model: "รุ่นรถยนต์",
    year: "ปีผลิต (ค.ศ.)",
    serviceCosts: "3. รายละเอียดงานซ่อมและค่าบริการ",
    serviceDesc: "อาการเสีย / ขอบเขตงานประเมินซ่อมบำรุง",
    laborCost: "ประมาณการค่าบริการค่าแรงเริ่มต้น (฿)",
    cancel: "ยกเลิก",
    confirmIntake: "ยืนยันรับรถเข้าซ่อม",
    
    // Form placeholders
    placeholderName: "สมชาย ดีใจ",
    placeholderPhone: "081-234-5678",
    placeholderPlate: "กข-1234",
    placeholderBrand: "อีซูซุ",
    placeholderModel: "ดีแม็ก",
    placeholderDesc: "เปลี่ยนถ่ายน้ำมันเครื่อง และตรวจเช็กเสียงดังเวลากดเบรก...",
    
    // Tooltips
    tooltipThemeLight: "เปลี่ยนเป็นโหมดสว่าง",
    tooltipThemeDark: "เปลี่ยนเป็นโหมดมืด",
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function Page() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<UserRole>('SERVICE_ADVISOR');
  const [language, setLanguage] = useState<'EN' | 'TH'>('TH');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<SparePart[]>([]);
  const [mechanics, setMechanics] = useState<SystemUser[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  
  // Create ticket state
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newLicensePlate, setNewLicensePlate] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newDescription, setNewDescription] = useState('');
  const [newLaborCost, setNewLaborCost] = useState<number>(80);

  const [isMounted, setIsMounted] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tickets`);
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data && body.data.length > 0) {
          setTickets(body.data);
          return;
        }
      }
      setTickets(INITIAL_TICKETS);
    } catch (err) {
      console.error("Error fetching tickets, using mock fallback:", err);
      setTickets(INITIAL_TICKETS);
    }
  };

  const fetchParts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/parts`);
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data && body.data.length > 0) {
          setPartsCatalog(body.data);
          return;
        }
      }
      setPartsCatalog(INITIAL_PARTS_CATALOG);
    } catch (err) {
      console.error("Error fetching parts, using mock fallback:", err);
      setPartsCatalog(INITIAL_PARTS_CATALOG);
    }
  };

  const fetchMechanics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/mechanics`);
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data && body.data.length > 0) {
          setMechanics(body.data);
          return;
        }
      }
      setMechanics(MOCK_MECHANICS);
    } catch (err) {
      console.error("Error fetching mechanics, using mock fallback:", err);
      setMechanics(MOCK_MECHANICS);
    }
  };

  // Load configuration from sessionStorage
  useEffect(() => {
    const savedRole = sessionStorage.getItem('simulated_role') as UserRole;
    const savedLang = sessionStorage.getItem('simulated_lang') as 'EN' | 'TH';
    const savedTheme = sessionStorage.getItem('simulated_theme') as 'light' | 'dark';
    
    if (!savedRole) {
      router.push('/login');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentRole(savedRole);
      setIsMounted(true);
      
      // Fetch initial data from backend APIs
      fetchTickets();
      fetchParts();
      fetchMechanics();
    }
    
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      setLanguage('TH');
      sessionStorage.setItem('simulated_lang', 'TH');
    }

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('light');
      sessionStorage.setItem('simulated_theme', 'light');
    }
  }, [router]);

  // Handle HTML document class toggles for selector dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    sessionStorage.setItem('simulated_theme', theme);
  }, [theme]);

  const changeRoleAndSync = (newRole: UserRole) => {
    setCurrentRole(newRole);
    sessionStorage.setItem('simulated_role', newRole);
    if (newRole === 'ADMIN') {
      sessionStorage.setItem('simulated_username', 'Administrator');
    } else if (newRole === 'SERVICE_ADVISOR') {
      sessionStorage.setItem('simulated_username', 'Service Advisor');
    } else {
      sessionStorage.setItem('simulated_username', 'John Doe (Mechanic)');
    }
  };

  const changeLanguage = (lang: 'EN' | 'TH') => {
    setLanguage(lang);
    sessionStorage.setItem('simulated_lang', lang);
  };

  const exportToExcel = () => {
    const reportDate = new Date().toLocaleString(language === 'TH' ? 'th-TH' : 'en-US');
    const title = language === 'TH' 
      ? 'รายงานสรุปข้อมูลงานซ่อมบำรุงและบริการหลังการขาย' 
      : 'VEHICLE REPAIR & AFTERSALES OPERATIONS SUMMARY';
    const subtitle = language === 'TH'
      ? `พิมพ์รายงาน ณ วันที่: ${reportDate} | ระบบควบคุมปฏิบัติการศูนย์บริการรถยนต์`
      : `Generated on: ${reportDate} | Automotive Repair Center Operations Control`;

    const headers = language === 'TH' ? [
      'ID ใบงาน', 'ชื่อลูกค้า', 'เบอร์โทรศัพท์', 'ทะเบียนรถ', 'ยี่ห้อ', 'รุ่น', 'ปีผลิต', 
      'รายละเอียดอาการเสีย', 'ช่างผู้ดูแล', 'ขั้นตอนสถานะ', 'ค่าแรง (฿)', 'ค่าอะไหล่ (฿)', 
      'ยอดรวมก่อน VAT (฿)', 'ภาษี VAT 7% (฿)', 'ยอดชำระสุทธิ (฿)', 'วันที่เปิดใบงาน'
    ] : [
      'Ticket ID', 'Customer Name', 'Phone', 'License Plate', 'Brand', 'Model', 'Year', 
      'Description', 'Assigned Mechanic', 'Status', 'Labor Cost (฿)', 'Parts Total (฿)', 
      'Subtotal (฿)', 'VAT Amount (฿)', 'Total Bill (฿)', 'Created At'
    ];

    const getStatusText = (status: TicketStatus) => {
      if (language === 'TH') {
        switch (status) {
          case 'PENDING': return 'รับรถ / ตรวจอาการ';
          case 'IN_PROGRESS': return 'กำลังซ่อมบำรุง';
          case 'WAITING_FOR_PARTS': return 'รอชิ้นส่วนอะไหล่';
          case 'COMPLETED': return 'ซ่อมเสร็จสิ้น';
          case 'DELIVERED': return 'ส่งมอบรถ / ปิดงาน';
          default: return status;
        }
      } else {
        return status.replace(/_/g, ' ');
      }
    };

    // Calculate sums
    let totalLabor = 0;
    let totalParts = 0;
    let totalSubtotal = 0;
    let totalVat = 0;
    let totalBillVal = 0;

    tickets.forEach(ticket => {
      totalLabor += ticket.laborCost;
      totalParts += ticket.partsTotal;
      totalSubtotal += ticket.subtotal;
      totalVat += ticket.vatAmount;
      totalBillVal += ticket.totalWithVat;
    });

    const getCleanString = (val: unknown) => {
      if (val === null || val === undefined) return '';
      return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Construct table rows HTML
    const rowsHtml = tickets.map(ticket => {
      const statusText = getStatusText(ticket.status);
      const mechName = ticket.mechanicName || (language === 'TH' ? 'ยังไม่มอบหมาย' : 'Unassigned');
      const formattedDate = new Date(ticket.createdAt).toLocaleString(language === 'TH' ? 'th-TH' : 'en-US');

      // Status cell styles
      let statusStyle = 'color: #475569; font-weight: bold; text-align: center;';
      if (ticket.status === 'PENDING') statusStyle = 'color: #64748b; font-weight: bold; background-color: #f1f5f9; text-align: center;';
      else if (ticket.status === 'IN_PROGRESS') statusStyle = 'color: #1d4ed8; font-weight: bold; background-color: #eff6ff; text-align: center;';
      else if (ticket.status === 'WAITING_FOR_PARTS') statusStyle = 'color: #b45309; font-weight: bold; background-color: #fffbeb; text-align: center;';
      else if (ticket.status === 'COMPLETED') statusStyle = 'color: #047857; font-weight: bold; background-color: #ecfdf5; text-align: center;';
      else if (ticket.status === 'DELIVERED') statusStyle = 'color: #4338ca; font-weight: bold; background-color: #e0e7ff; text-align: center;';

      return `
        <tr>
          <td class="text-center" style="font-weight: bold; color: #1e3a8a;">#${ticket.id}</td>
          <td class="text-left">${getCleanString(ticket.customerName)}</td>
          <td class="text-center font-mono">${getCleanString(ticket.customerPhone)}</td>
          <td class="text-center font-mono" style="background-color: #fafafa; font-weight: 500;">${getCleanString(ticket.licensePlate)}</td>
          <td class="text-left">${getCleanString(ticket.vehicleBrand)}</td>
          <td class="text-left">${getCleanString(ticket.vehicleModel)}</td>
          <td class="text-center">${ticket.vehicleYear}</td>
          <td class="text-left" style="font-size: 9.5pt; color: #475569;">${getCleanString(ticket.description)}</td>
          <td class="text-left" style="font-weight: 500;">${getCleanString(mechName)}</td>
          <td style="${statusStyle}">${getCleanString(statusText)}</td>
          <td class="text-right" style="color: #0f172a;">฿${ticket.laborCost.toFixed(2)}</td>
          <td class="text-right" style="color: #0f172a;">฿${ticket.partsTotal.toFixed(2)}</td>
          <td class="text-right" style="color: #0f172a; font-weight: 500;">฿${ticket.subtotal.toFixed(2)}</td>
          <td class="text-right" style="color: #64748b;">฿${ticket.vatAmount.toFixed(2)}</td>
          <td class="text-right" style="color: #10b981; font-weight: bold;">฿${ticket.totalWithVat.toFixed(2)}</td>
          <td class="text-center" style="color: #64748b; font-size: 9.5pt;">${formattedDate}</td>
        </tr>
      `;
    }).join('');

    const totalLabel = language === 'TH' ? 'สรุปยอดเงินรวมทั้งหมด' : 'Grand Total Summary';

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Service Tickets Summary</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; }
          table { border-collapse: collapse; }
          .title-text { font-size: 16pt; font-weight: bold; color: #1e3a8a; text-align: left; }
          .subtitle-text { font-size: 10pt; color: #475569; text-align: left; }
          th { background-color: #2563eb; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 10px 8px; text-align: center; font-size: 11pt; }
          td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10.5pt; color: #334155; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .font-mono { font-family: 'Courier New', Courier, monospace; }
          .total-row td { background-color: #f8fafc; border-top: 2px solid #64748b; border-bottom: 2px double #64748b; font-weight: bold; font-size: 11pt; color: #0f172a; }
        </style>
      </head>
      <body>
        <table>
          <colgroup>
            <col width="100" />
            <col width="160" />
            <col width="140" />
            <col width="110" />
            <col width="110" />
            <col width="110" />
            <col width="75" />
            <col width="320" />
            <col width="170" />
            <col width="140" />
            <col width="110" />
            <col width="110" />
            <col width="120" />
            <col width="100" />
            <col width="130" />
            <col width="180" />
          </colgroup>
          
          <tr><td colspan="16" class="title-text" style="border: none; padding-bottom: 2px;"><b>${title}</b></td></tr>
          <tr><td colspan="16" class="subtitle-text" style="border: none; padding-bottom: 15px;">${subtitle}</td></tr>
          <tr><td colspan="16" style="height: 10px; border: none;"></td></tr>

          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          
          <tbody>
            ${rowsHtml}
            
            <tr class="total-row">
              <td colspan="10" class="text-right" style="padding-right: 15px;"><b>${totalLabel} (THB):</b></td>
              <td class="text-right">฿${totalLabor.toFixed(2)}</td>
              <td class="text-right">฿${totalParts.toFixed(2)}</td>
              <td class="text-right">฿${totalSubtotal.toFixed(2)}</td>
              <td class="text-right" style="color: #64748b;">฿${totalVat.toFixed(2)}</td>
              <td class="text-right" style="color: #10b981;">฿${totalBillVal.toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aftersales_report_${new Date().toISOString().slice(0,10)}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const t = TRANSLATIONS[language];

  // Live calculations for dashboard metrics
  const metrics = useMemo(() => {
    const active = tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_PARTS').length;
    const pending = tickets.filter(t => t.status === 'PENDING').length;
    const completed = tickets.filter(t => t.status === 'COMPLETED').length;
    const revenue = tickets.filter(t => t.status === 'DELIVERED').reduce((sum, t) => sum + t.totalWithVat, 0);
    const lowStockCount = partsCatalog.filter(p => p.stockQuantity < 5).length;

    return { active, pending, completed, revenue, lowStockCount };
  }, [tickets, partsCatalog]);

  // Handle status transition update
  const handleStatusChange = async (ticketId: number, newStatus: TicketStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          const updatedTicket = body.data;
          setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
          if (selectedTicket && selectedTicket.id === ticketId) {
            setSelectedTicket(updatedTicket);
          }
          return;
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to update status");
        return;
      }
    } catch (err) {
      console.error("Error updating status, falling back to local simulation:", err);
    }

    // Local simulation fallback
    setTickets(prev => 
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      })
    );

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Handle updates from Detail Modal
  const handleUpdateTicket = (updatedTicket: ServiceTicket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    fetchParts(); // Sync parts stock after update
  };

  // Handle soft deleting a ticket
  const handleDeleteTicket = async (ticketId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        setSelectedTicket(null);
        fetchParts(); // Sync parts stock after delete
        return;
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to delete ticket");
        return;
      }
    } catch (err) {
      console.error("Error deleting ticket, falling back to local simulation:", err);
    }

    // Local simulation fallback
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setPartsCatalog(prevCatalog => 
        prevCatalog.map(part => {
          const item = ticket.items.find(i => i.partId === part.id);
          if (item) {
            return {
              ...part,
              stockQuantity: part.stockQuantity + item.quantity
            };
          }
          return part;
        })
      );
    }

    setTickets(prev => prev.filter(t => t.id !== ticketId));
    setSelectedTicket(null);
  };

  // Create new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'MECHANIC') return;

    try {
      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: newCustomerName,
          customerPhone: newCustomerPhone,
          licensePlate: newLicensePlate.toUpperCase(),
          vehicleBrand: newBrand,
          vehicleModel: newModel,
          vehicleYear: Number(newYear),
          description: newDescription,
          laborCost: Number(newLaborCost),
          mechanicId: null
        })
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          setTickets(prev => [body.data, ...prev]);
          setIsCreating(false);

          setNewCustomerName('');
          setNewCustomerPhone('');
          setNewLicensePlate('');
          setNewBrand('');
          setNewModel('');
          setNewYear(new Date().getFullYear());
          setNewDescription('');
          setNewLaborCost(80);
          fetchParts(); // Sync parts catalog
          return;
        }
      }
      console.warn("Backend ticket creation failed or was unexpected. Falling back to local simulation.");
    } catch (err) {
      console.error("Error creating ticket, falling back to local simulation:", err);
    }

    // Local simulation fallback
    const labor = Number(newLaborCost);
    const subtotal = labor;
    const vat = Number((subtotal * 0.07).toFixed(2));
    const total = Number((subtotal + vat).toFixed(2));

    const newTicket: ServiceTicket = {
      id: Date.now(),
      description: newDescription,
      status: 'PENDING',
      laborCost: labor,
      partsTotal: 0.00,
      subtotal,
      vatAmount: vat,
      totalWithVat: total,
      vehicleId: Math.floor(Math.random() * 1000) + 500,
      licensePlate: newLicensePlate.toUpperCase(),
      vehicleBrand: newBrand,
      vehicleModel: newModel,
      vehicleYear: Number(newYear),
      customerId: Math.floor(Math.random() * 1000) + 500,
      customerName: newCustomerName,
      customerPhone: newCustomerPhone,
      mechanicId: null,
      mechanicName: null,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTickets(prev => [newTicket, ...prev]);
    setIsCreating(false);

    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewLicensePlate('');
    setNewBrand('');
    setNewModel('');
    setNewYear(new Date().getFullYear());
    setNewDescription('');
    setNewLaborCost(80);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-650 dark:text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Ambient glowing circles in background */}
      <div className="dashboard-ambient-rings">
        <div className="dashboard-ambient-ring-1" style={{ '--clr': '#00ff0a' } as React.CSSProperties}>
          <i></i><i></i><i></i>
        </div>
        <div className="dashboard-ambient-ring-2" style={{ '--clr': '#ff0057' } as React.CSSProperties}>
          <i></i><i></i><i></i>
        </div>
      </div>

      {/* Top Banner Navigation */}
      <header className="border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95 p-5 sticky top-0 z-40 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          
          {/* Logo & Title (Enlarged and styled with rotating neon lines) */}
          <div className="flex items-center gap-5">
            <div className="header-logo-ring-wrapper">
              <div className="header-logo-ring" style={{ '--clr': '#2563eb' } as React.CSSProperties}>
                <i style={{ '--clr': '#00ff0a' } as React.CSSProperties}></i>
                <i style={{ '--clr': '#ff0057' } as React.CSSProperties}></i>
                <i style={{ '--clr': '#fffd44' } as React.CSSProperties}></i>
                <div className="header-logo-content">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
                {t.appTitle}
                <span className="rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700 px-2.5 py-1 text-xs font-bold uppercase tracking-widest shadow-sm">
                  {t.dashboard}
                </span>
              </h1>
              <p className="text-base text-slate-500 dark:text-slate-400 font-semibold mt-1">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Controls: Theme, Language, Role, and Sign out */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Theme Toggle (Sun/Moon) */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="inline-flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition duration-200 cursor-pointer"
              title={theme === 'light' ? t.tooltipThemeDark : t.tooltipThemeLight}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-1 transition-colors duration-300">
              <span className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
              </span>
              <button
                onClick={() => changeLanguage('TH')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  language === 'TH'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                TH
              </button>
              <button
                onClick={() => changeLanguage('EN')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  language === 'EN'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>

            {/* Active Role Badge (Read-only) */}
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 px-3 py-1.5 text-xs font-bold transition-colors duration-300">
              <Shield className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500">{t.roleLabel}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] text-white uppercase tracking-wider ${
                currentRole === 'ADMIN' ? 'bg-rose-600' :
                currentRole === 'SERVICE_ADVISOR' ? 'bg-blue-600' :
                'bg-amber-600'
              }`}>
                {currentRole === 'ADMIN' ? t.admin :
                 currentRole === 'SERVICE_ADVISOR' ? t.advisor :
                 t.mechanic}
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                sessionStorage.clear();
                router.push('/login');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-550 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 px-3.5 py-2 text-xs font-bold transition duration-200 cursor-pointer"
              title={t.signOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t.signOut}</span>
            </button>

            {/* Create Ticket Button (Advisor or Admin only) */}
            {currentRole !== 'MECHANIC' && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-lg ring-4 ring-emerald-500/10 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                {t.newServiceIntake}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 w-full flex-1 space-y-6 z-10">
        
        {/* Role Permissions Notification Bar */}
        <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-opacity-80 dark:bg-opacity-40 backdrop-blur-sm transition-colors duration-300 ${
          currentRole === 'ADMIN' 
            ? 'bg-rose-50/80 border-rose-200/60 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-300' 
            : currentRole === 'SERVICE_ADVISOR'
            ? 'bg-blue-50/80 border-blue-200/60 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300'
            : 'bg-amber-50/80 border-amber-200/60 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300'
        }`}>
          <div className="flex items-start gap-2.5">
            <div className={`rounded-lg p-1.5 ${
              currentRole === 'ADMIN' ? 'bg-rose-900/30' : currentRole === 'SERVICE_ADVISOR' ? 'bg-blue-900/30' : 'bg-amber-900/30'
            }`}>
              {currentRole === 'ADMIN' ? <Shield className="h-5 w-5" /> : currentRole === 'SERVICE_ADVISOR' ? <Users className="h-5 w-5" /> : <Hammer className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.simulationContext}</p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {currentRole === 'ADMIN' && t.adminRoleMode}
                {currentRole === 'SERVICE_ADVISOR' && t.advisorRoleMode}
                {currentRole === 'MECHANIC' && t.mechanicRoleMode}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {currentRole === 'ADMIN' && t.adminRights}
                {currentRole === 'SERVICE_ADVISOR' && t.advisorRights}
                {currentRole === 'MECHANIC' && t.mechanicRights}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500 shrink-0 self-end sm:self-center border border-slate-200 dark:border-slate-800 rounded px-2 py-0.5">
            {t.rbacEnabled}
          </span>
        </div>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Active Workshop */}
          <div className="glowing-card glowing-card-blue p-4 flex items-center justify-between group transition duration-200">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.activeWorkshop}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics.active}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.inProgressOrWaiting}</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition duration-200">
              <Play className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Intake Queue */}
          <div className="glowing-card glowing-card-slate p-4 flex items-center justify-between group transition duration-200">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.pendingIntake}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics.pending}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.awaitingDiagnostic}</p>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-900 p-3 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition duration-200">
              <Clipboard className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Delivered Revenue */}
          <div className="glowing-card glowing-card-emerald p-4 flex items-center justify-between group transition duration-200">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.completedRevenue}</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">฿{metrics.revenue.toFixed(2)}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.sumSettled}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition duration-200">
              <Coins className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Inventory Alerts */}
          <div className="glowing-card glowing-card-amber p-4 flex items-center justify-between group transition duration-200">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.inventoryAlerts}</p>
              <h3 className={`text-2xl font-extrabold ${metrics.lowStockCount > 0 ? 'text-amber-650 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>{metrics.lowStockCount}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.lowStockWarning}</p>
            </div>
            <div className={`rounded-xl p-3 group-hover:scale-110 transition duration-200 ${
              metrics.lowStockCount > 0 ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
            }`}>
              <Package className="h-5 w-5" />
            </div>
          </div>

        </section>

        {/* Kanban Board Container */}
        <section className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 p-4 shadow-sm dark:shadow-xl transition-colors duration-300 kanban-board-wrapper">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-150 dark:border-slate-850 pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.kanbanFlowTitle}</span>
                <span className="text-xs font-normal text-slate-500">{t.liveStatus}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.visualPipeline}</p>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-slate-500">{t.filters}</span>
              <span className="rounded bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 flex items-center gap-1 font-semibold">
                <Filter className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                {t.allVehicles} ({tickets.length})
              </span>
              <button
                onClick={exportToExcel}
                className="rounded bg-emerald-600 hover:bg-emerald-500 border border-emerald-700 dark:border-emerald-600 text-white px-2.5 py-1.5 flex items-center gap-1.5 font-bold cursor-pointer transition shadow-sm hover:scale-[1.02] active:scale-95"
                title={language === 'TH' ? 'ส่งออกรายงานสรุปเป็นไฟล์ Excel' : 'Export summary report to Excel'}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{language === 'TH' ? 'ส่งออกรายงาน Excel' : 'Export Excel'}</span>
              </button>
            </div>
          </div>
          
          <KanbanBoard 
            tickets={tickets} 
            onStatusChange={handleStatusChange} 
            onOpenDetails={setSelectedTicket}
            currentRole={currentRole}
            language={language}
          />
        </section>
      </main>

      {/* Slide-over Detail Modal */}
      <TicketDetailModal 
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        onUpdateTicket={handleUpdateTicket}
        onDeleteTicket={handleDeleteTicket}
        currentRole={currentRole}
        mechanics={mechanics}
        partsCatalog={partsCatalog}
        language={language}
      />

      {/* Create Ticket Modal Backdrop */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-blue-500" />
                {t.newIntakeForm}
              </h3>
              <button 
                onClick={() => setIsCreating(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-4 text-xs">
              
              {/* Customer Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">{t.custDetails}</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-slate-650 dark:text-slate-400 mb-1 font-medium">{t.custName}</label>
                    <input 
                      type="text" 
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full login-style-input text-slate-900 dark:text-white"
                      placeholder={t.placeholderName}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-650 dark:text-slate-400 mb-1 font-medium">{t.phone}</label>
                    <input 
                      type="text" 
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className="w-full login-style-input text-slate-900 dark:text-white"
                      placeholder={t.placeholderPhone}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">{t.vehDetails}</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-slate-650 dark:text-slate-400 mb-1 font-medium">{t.licensePlate}</label>
                    <input 
                      type="text" 
                      value={newLicensePlate}
                      onChange={(e) => setNewLicensePlate(e.target.value)}
                      className="w-full login-style-input text-slate-900 dark:text-white font-mono uppercase"
                      placeholder={t.placeholderPlate}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-650 dark:text-slate-400 mb-1 font-medium">{t.brand}</label>
                    <input 
                      type="text" 
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="w-full login-style-input text-slate-900 dark:text-white"
                      placeholder={t.placeholderBrand}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-650 dark:text-slate-400 mb-1 font-medium">{t.model}</label>
                    <input 
                      type="text" 
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="w-full login-style-input text-slate-900 dark:text-white"
                      placeholder={t.placeholderModel}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-650 dark:text-slate-400 mb-1 font-medium">{t.year}</label>
                    <input 
                      type="number" 
                      value={newYear}
                      onChange={(e) => setNewYear(parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full login-style-input text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">{t.serviceCosts}</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-650 dark:text-slate-400 mb-1 font-medium">{t.serviceDesc}</label>
                    <textarea 
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full login-style-textarea text-slate-900 dark:text-white"
                      placeholder={t.placeholderDesc}
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-650 dark:text-slate-400 mb-1 font-medium">{t.laborCost}</label>
                    <input 
                      type="number" 
                      min="0"
                      value={newLaborCost}
                      onChange={(e) => setNewLaborCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full login-style-input text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="login-style-cancel bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition duration-200 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="login-style-submit cursor-pointer text-white"
                >
                  {t.confirmIntake}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
