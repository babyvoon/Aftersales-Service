package com.aftersales.loader;

import com.aftersales.entity.*;
import com.aftersales.enums.TicketStatus;
import com.aftersales.enums.UserRole;
import com.aftersales.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final SparePartRepository sparePartRepository;
    private final ServiceTicketRepository ticketRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping seeder.");
            return;
        }

        log.info("Seeding database with default mock data...");

        // 1. Seed Users (Mechanics, Advisors, Admins)
        User mechanic1 = User.builder().username("jdoe").passwordHash("password").role(UserRole.MECHANIC).fullName("John Doe (Senior Mechanic)").build();
        User mechanic2 = User.builder().username("msmith").passwordHash("password").role(UserRole.MECHANIC).fullName("Marcus Smith (Tire & Suspension)").build();
        User mechanic3 = User.builder().username("srogers").passwordHash("password").role(UserRole.MECHANIC).fullName("Sarah Rogers (Electrical Expert)").build();
        User mechanic4 = User.builder().username("tstark").passwordHash("password").role(UserRole.MECHANIC).fullName("Tony Stark (Diagnostics Specialist)").build();
        User advisor = User.builder().username("advisor").passwordHash("password").role(UserRole.SERVICE_ADVISOR).fullName("Service Advisor").build();
        User admin = User.builder().username("admin").passwordHash("password").role(UserRole.ADMIN).fullName("Administrator").build();

        userRepository.saveAll(List.of(mechanic1, mechanic2, mechanic3, mechanic4, advisor, admin));

        // 2. Seed Customers
        Customer c1 = Customer.builder().fullName("Alice Johnson").phoneNumber("+1-555-0199").email("alice@example.com").address("123 Main St").build();
        Customer c2 = Customer.builder().fullName("Robert Dow").phoneNumber("+1-555-0144").email("robert@example.com").address("456 Elm St").build();
        Customer c3 = Customer.builder().fullName("Thomas Wayne").phoneNumber("+1-555-0182").email("thomas@example.com").address("Wayne Manor").build();
        Customer c4 = Customer.builder().fullName("Diana Prince").phoneNumber("+1-555-0155").email("diana@example.com").address("Themyscira").build();
        Customer c5 = Customer.builder().fullName("Barry Allen").phoneNumber("+1-555-0166").email("barry@example.com").address("Central City").build();
        Customer c6 = Customer.builder().fullName("Peter Parker").phoneNumber("+1-555-0211").email("peter@example.com").address("Queens, NY").build();
        Customer c7 = Customer.builder().fullName("Clark Kent").phoneNumber("+1-555-0312").email("clark@example.com").address("Metropolis").build();
        Customer c8 = Customer.builder().fullName("Steve Rogers").phoneNumber("+1-555-0422").email("steve@example.com").address("Brooklyn, NY").build();
        Customer c9 = Customer.builder().fullName("Bruce Banner").phoneNumber("+1-555-0533").email("bruce@example.com").address("Green Country").build();
        Customer c10 = Customer.builder().fullName("Natasha Romanoff").phoneNumber("+1-555-0644").email("natasha@example.com").address("St. Petersburg").build();
        Customer c11 = Customer.builder().fullName("Wanda Maximoff").phoneNumber("+1-555-0755").email("wanda@example.com").address("Westview").build();
        Customer c12 = Customer.builder().fullName("Loki Laufeyson").phoneNumber("+1-555-0866").email("loki@example.com").address("Asgard").build();

        customerRepository.saveAll(List.of(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12));

        // 3. Seed Vehicles
        Vehicle v1 = Vehicle.builder().customer(c1).licensePlate("ABC-1234").vinNumber("VIN10000000000001").brand("Toyota").model("Camry").year(2020).build();
        Vehicle v2 = Vehicle.builder().customer(c2).licensePlate("XYZ-9876").vinNumber("VIN10000000000002").brand("Honda").model("Civic").year(2018).build();
        Vehicle v3 = Vehicle.builder().customer(c3).licensePlate("BAT-1100").vinNumber("VIN10000000000003").brand("Ford").model("Explorer").year(2017).build();
        Vehicle v4 = Vehicle.builder().customer(c4).licensePlate("ENG-5544").vinNumber("VIN10000000000004").brand("BMW").model("330i").year(2021).build();
        Vehicle v5 = Vehicle.builder().customer(c5).licensePlate("WIP-3322").vinNumber("VIN10000000000005").brand("Mazda").model("CX-5").year(2019).build();
        Vehicle v6 = Vehicle.builder().customer(c6).licensePlate("SPIDER-1").vinNumber("VIN10000000000006").brand("Toyota").model("Corolla").year(2015).build();
        Vehicle v7 = Vehicle.builder().customer(c7).licensePlate("SUPER-99").vinNumber("VIN10000000000007").brand("Chevrolet").model("Corvette").year(2022).build();
        Vehicle v8 = Vehicle.builder().customer(c8).licensePlate("CAP-1941").vinNumber("VIN10000000000008").brand("Jeep").model("Wrangler").year(2016).build();
        Vehicle v9 = Vehicle.builder().customer(c8).licensePlate("STARK-4").vinNumber("VIN10000000000009").brand("Audi").model("R8").year(2020).build();
        Vehicle v10 = Vehicle.builder().customer(c9).licensePlate("GREEN-8").vinNumber("VIN10000000000010").brand("Tesla").model("Model S").year(2023).build();
        Vehicle v11 = Vehicle.builder().customer(c10).licensePlate("BLACK-W").vinNumber("VIN10000000000011").brand("Porsche").model("911").year(2021).build();
        Vehicle v12 = Vehicle.builder().customer(c11).licensePlate("WITCH-7").vinNumber("VIN10000000000012").brand("Volvo").model("XC90").year(2019).build();
        Vehicle v13 = Vehicle.builder().customer(c12).licensePlate("MISCHIEF").vinNumber("VIN10000000000013").brand("Dodge").model("Charger").year(2018).build();

        vehicleRepository.saveAll(List.of(v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13));

        // 4. Seed Spare Parts
        SparePart p1 = SparePart.builder().partNumber("BRK-552").name("Premium Ceramic Brake Pads").unitPrice(new BigDecimal("89.99")).stockQuantity(12).build();
        SparePart p2 = SparePart.builder().partNumber("FIL-089").name("High-Flow Engine Oil Filter").unitPrice(new BigDecimal("14.50")).stockQuantity(25).build();
        SparePart p3 = SparePart.builder().partNumber("BAT-990").name("12V Lead-Acid Car Battery").unitPrice(new BigDecimal("145.00")).stockQuantity(4).build();
        SparePart p4 = SparePart.builder().partNumber("WPR-112").name("All-Weather Wiper Blades (Set)").unitPrice(new BigDecimal("29.99")).stockQuantity(15).build();
        SparePart p5 = SparePart.builder().partNumber("SPK-441").name("Iridium Spark Plug (Pack of 4)").unitPrice(new BigDecimal("38.00")).stockQuantity(8).build();
        SparePart p6 = SparePart.builder().partNumber("BEL-201").name("Serpentine Alternator Belt").unitPrice(new BigDecimal("42.50")).stockQuantity(3).build();

        sparePartRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));

        // 5. Seed Tickets
        ServiceTicket t1 = ServiceTicket.builder()
                .vehicle(v1)
                .description("Scheduled 50,000km mileage routine maintenance. Needs engine oil replacement, oil filter check, and general brake thickness inspection.")
                .status(TicketStatus.PENDING)
                .laborCost(new BigDecimal("95.00"))
                .totalCost(new BigDecimal("95.00"))
                .build();

        ServiceTicket t2 = ServiceTicket.builder()
                .vehicle(v2)
                .assignedMechanic(mechanic1)
                .description("Squeaking noise when braking at low speeds. Check pads wear, rotor resurfacing might be required. Diagnosed thin brake pads.")
                .status(TicketStatus.IN_PROGRESS)
                .laborCost(new BigDecimal("150.00"))
                .totalCost(new BigDecimal("239.99"))
                .build();

        ServiceTicket t3 = ServiceTicket.builder()
                .vehicle(v3)
                .assignedMechanic(mechanic3)
                .description("Vehicle does not crank or start. Battery light active on dashboard. Suspected dead battery. Jumpstart worked, alternator charging is correct.")
                .status(TicketStatus.WAITING_FOR_PARTS)
                .laborCost(new BigDecimal("60.00"))
                .totalCost(new BigDecimal("205.00"))
                .build();

        ServiceTicket t4 = ServiceTicket.builder()
                .vehicle(v4)
                .assignedMechanic(mechanic4)
                .description("Check engine light blinking. Sputtering engine during acceleration. Spark plugs replacement. Tested compression, cylinders are clean.")
                .status(TicketStatus.COMPLETED)
                .laborCost(new BigDecimal("120.00"))
                .totalCost(new BigDecimal("172.50"))
                .build();

        ServiceTicket t5 = ServiceTicket.builder()
                .vehicle(v5)
                .assignedMechanic(mechanic2)
                .description("Wiper blades leaving streaks, front windshield wash nozzle clogged. Clean nozzle and replace blades.")
                .status(TicketStatus.DELIVERED)
                .laborCost(new BigDecimal("40.00"))
                .totalCost(new BigDecimal("69.99"))
                .build();

        ServiceTicket t6 = ServiceTicket.builder()
                .vehicle(v6)
                .description("Needs engine diagnostic. Check engine light is on and engine running rough under load.")
                .status(TicketStatus.PENDING)
                .laborCost(new BigDecimal("80.00"))
                .totalCost(new BigDecimal("80.00"))
                .build();

        ServiceTicket t7 = ServiceTicket.builder()
                .vehicle(v7)
                .assignedMechanic(mechanic2)
                .description("Tire rotation and wheel alignment. Left pull noted while driving at highway speeds.")
                .status(TicketStatus.IN_PROGRESS)
                .laborCost(new BigDecimal("110.00"))
                .totalCost(new BigDecimal("110.00"))
                .build();

        ServiceTicket t8 = ServiceTicket.builder()
                .vehicle(v8)
                .assignedMechanic(mechanic1)
                .description("Transmission fluid flush. Grinding noise when shifting from 2nd to 3rd gear.")
                .status(TicketStatus.WAITING_FOR_PARTS)
                .laborCost(new BigDecimal("180.00"))
                .totalCost(new BigDecimal("180.00"))
                .build();

        ServiceTicket t9 = ServiceTicket.builder()
                .vehicle(v9)
                .assignedMechanic(mechanic3)
                .description("A/C recharge and cabin air filter replacement. Air smells musty and doesn't blow cold enough.")
                .status(TicketStatus.COMPLETED)
                .laborCost(new BigDecimal("95.00"))
                .totalCost(new BigDecimal("95.00"))
                .build();

        ServiceTicket t10 = ServiceTicket.builder()
                .vehicle(v10)
                .assignedMechanic(mechanic2)
                .description("Headlight bulb replacement and windshield washer fluid top-off.")
                .status(TicketStatus.DELIVERED)
                .laborCost(new BigDecimal("30.00"))
                .totalCost(new BigDecimal("30.00"))
                .build();

        ServiceTicket t11 = ServiceTicket.builder()
                .vehicle(v11)
                .description("Coolant leak under passenger side. Engine temperature gauge rising fast during idle.")
                .status(TicketStatus.PENDING)
                .laborCost(new BigDecimal("75.00"))
                .totalCost(new BigDecimal("75.00"))
                .build();

        ServiceTicket t12 = ServiceTicket.builder()
                .vehicle(v12)
                .assignedMechanic(mechanic2)
                .description("Suspension inspection. Squeaking when going over speed bumps or rough surfaces.")
                .status(TicketStatus.IN_PROGRESS)
                .laborCost(new BigDecimal("135.00"))
                .totalCost(new BigDecimal("135.00"))
                .build();

        ServiceTicket t13 = ServiceTicket.builder()
                .vehicle(v13)
                .assignedMechanic(mechanic1)
                .description("Brake rotor resurfacing. Squealing when stopping. Left front rotor has deep grooves.")
                .status(TicketStatus.WAITING_FOR_PARTS)
                .laborCost(new BigDecimal("160.00"))
                .totalCost(new BigDecimal("160.00"))
                .build();

        ServiceTicket t14 = ServiceTicket.builder()
                .vehicle(v6)
                .assignedMechanic(mechanic4)
                .description("Spark plug and ignition coil replacement. Cylinder 3 misfire code P0303 detected.")
                .status(TicketStatus.COMPLETED)
                .laborCost(new BigDecimal("140.00"))
                .totalCost(new BigDecimal("140.00"))
                .build();

        ServiceTicket t15 = ServiceTicket.builder()
                .vehicle(v7)
                .assignedMechanic(mechanic3)
                .description("Regular 10,000km oil change, oil filter replacement, and tire pressure check.")
                .status(TicketStatus.DELIVERED)
                .laborCost(new BigDecimal("45.00"))
                .totalCost(new BigDecimal("45.00"))
                .build();

        ticketRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15));

        // Add items to tickets
        TicketItem item1 = TicketItem.builder().serviceTicket(t2).sparePart(p1).quantity(1).pricePerUnit(p1.getUnitPrice()).subtotal(p1.getUnitPrice()).build();
        TicketItem item2 = TicketItem.builder().serviceTicket(t3).sparePart(p3).quantity(1).pricePerUnit(p3.getUnitPrice()).subtotal(p3.getUnitPrice()).build();
        TicketItem item3 = TicketItem.builder().serviceTicket(t4).sparePart(p2).quantity(1).pricePerUnit(p2.getUnitPrice()).subtotal(p2.getUnitPrice()).build();
        TicketItem item4 = TicketItem.builder().serviceTicket(t4).sparePart(p5).quantity(1).pricePerUnit(p5.getUnitPrice()).subtotal(p5.getUnitPrice()).build();
        TicketItem item5 = TicketItem.builder().serviceTicket(t5).sparePart(p4).quantity(1).pricePerUnit(p4.getUnitPrice()).subtotal(p4.getUnitPrice()).build();

        t2.addTicketItem(item1); t2.recalculateTotal(); ticketRepository.save(t2);
        t3.addTicketItem(item2); t3.recalculateTotal(); ticketRepository.save(t3);
        t4.addTicketItem(item3); t4.addTicketItem(item4); t4.recalculateTotal(); ticketRepository.save(t4);
        t5.addTicketItem(item5); t5.recalculateTotal(); ticketRepository.save(t5);

        log.info("Database seeding completed successfully!");
    }
}
