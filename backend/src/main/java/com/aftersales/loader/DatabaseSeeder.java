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
        log.info("Running database seeder validation...");

        // Force update all existing vehicles' brands and models to Isuzu
        try {
            List<Vehicle> allVehicles = vehicleRepository.findAll();
            for (Vehicle v : allVehicles) {
                boolean modified = false;
                if (!"Isuzu".equalsIgnoreCase(v.getBrand())) {
                    v.setBrand("Isuzu");
                    modified = true;
                }
                String currentModel = v.getModel();
                String newModel = mapToIsuzuModel(currentModel);
                if (!currentModel.equalsIgnoreCase(newModel)) {
                    v.setModel(newModel);
                    modified = true;
                }
                if (modified) {
                    vehicleRepository.save(v);
                    log.info("Updated vehicle brand/model to Isuzu {} for plate: {}", v.getModel(), v.getLicensePlate());
                }
            }
        } catch (Exception e) {
            log.error("Failed to force update vehicle brands/models to Isuzu: ", e);
        }

        // 1. Seed Users (Mechanics, Advisors, Admins)
        User mechanic1 = getOrCreateUser("jdoe", UserRole.MECHANIC, "John Doe (Senior Mechanic)");
        User mechanic2 = getOrCreateUser("msmith", UserRole.MECHANIC, "Marcus Smith (Tire & Suspension)");
        User mechanic3 = getOrCreateUser("srogers", UserRole.MECHANIC, "Sarah Rogers (Electrical Expert)");
        User mechanic4 = getOrCreateUser("tstark", UserRole.MECHANIC, "Tony Stark (Diagnostics Specialist)");
        getOrCreateUser("advisor", UserRole.SERVICE_ADVISOR, "Service Advisor");
        getOrCreateUser("admin", UserRole.ADMIN, "Administrator");

        // 2. Seed Spare Parts
        SparePart p1 = getOrCreateSparePart("BRK-552", "Premium Ceramic Brake Pads", new BigDecimal("89.99"), 12);
        SparePart p2 = getOrCreateSparePart("FIL-089", "High-Flow Engine Oil Filter", new BigDecimal("14.50"), 25);
        SparePart p3 = getOrCreateSparePart("BAT-990", "12V Lead-Acid Car Battery", new BigDecimal("145.00"), 4);
        SparePart p4 = getOrCreateSparePart("WPR-112", "All-Weather Wiper Blades (Set)", new BigDecimal("29.99"), 15);
        SparePart p5 = getOrCreateSparePart("SPK-441", "Iridium Spark Plug (Pack of 4)", new BigDecimal("38.00"), 8);
        SparePart p6 = getOrCreateSparePart("BEL-201", "Serpentine Alternator Belt", new BigDecimal("42.50"), 3);

        // 3. Seed Customers, Vehicles, and Tickets if tickets are empty
        if (ticketRepository.count() == 0) {
            log.info("No service tickets found. Seeding default customers, vehicles, and tickets...");

            // Seed Customers
            Customer c1 = getOrCreateCustomer("Alice Johnson", "+1-555-0199", "alice@example.com", "123 Main St");
            Customer c2 = getOrCreateCustomer("Robert Dow", "+1-555-0144", "robert@example.com", "456 Elm St");
            Customer c3 = getOrCreateCustomer("Thomas Wayne", "+1-555-0182", "thomas@example.com", "Wayne Manor");
            Customer c4 = getOrCreateCustomer("Diana Prince", "+1-555-0155", "diana@example.com", "Themyscira");
            Customer c5 = getOrCreateCustomer("Barry Allen", "+1-555-0166", "barry@example.com", "Central City");
            Customer c6 = getOrCreateCustomer("Peter Parker", "+1-555-0211", "peter@example.com", "Queens, NY");
            Customer c7 = getOrCreateCustomer("Clark Kent", "+1-555-0312", "clark@example.com", "Metropolis");
            Customer c8 = getOrCreateCustomer("Steve Rogers", "+1-555-0422", "steve@example.com", "Brooklyn, NY");
            Customer c9 = getOrCreateCustomer("Bruce Banner", "+1-555-0533", "bruce@example.com", "Green Country");
            Customer c10 = getOrCreateCustomer("Natasha Romanoff", "+1-555-0644", "natasha@example.com", "St. Petersburg");
            Customer c11 = getOrCreateCustomer("Wanda Maximoff", "+1-555-0755", "wanda@example.com", "Westview");
            Customer c12 = getOrCreateCustomer("Loki Laufeyson", "+1-555-0866", "loki@example.com", "Asgard");

            // Seed Vehicles
            Vehicle v1 = getOrCreateVehicle(c1, "ABC-1234", "VIN10000000000001", "Isuzu", "D-Max", 2020);
            Vehicle v2 = getOrCreateVehicle(c2, "XYZ-9876", "VIN10000000000002", "Isuzu", "MU-X", 2018);
            Vehicle v3 = getOrCreateVehicle(c3, "BAT-1100", "VIN10000000000003", "Isuzu", "MU-7", 2017);
            Vehicle v4 = getOrCreateVehicle(c4, "ENG-5544", "VIN10000000000004", "Isuzu", "D-Max Spark", 2021);
            Vehicle v5 = getOrCreateVehicle(c5, "WIP-3322", "VIN10000000000005", "Isuzu", "MU-X Onyx", 2019);
            Vehicle v6 = getOrCreateVehicle(c6, "SPIDER-1", "VIN10000000000006", "Isuzu", "D-Max Cab4", 2015);
            Vehicle v7 = getOrCreateVehicle(c7, "SUPER-99", "VIN10000000000007", "Isuzu", "Trooper", 2022);
            Vehicle v8 = getOrCreateVehicle(c8, "CAP-1941", "VIN10000000000008", "Isuzu", "MU-X Ultimate", 2016);
            Vehicle v9 = getOrCreateVehicle(c8, "STARK-4", "VIN10000000000009", "Isuzu", "D-Max V-Cross", 2020);
            Vehicle v10 = getOrCreateVehicle(c9, "GREEN-8", "VIN10000000000010", "Isuzu", "Elf", 2023);
            Vehicle v11 = getOrCreateVehicle(c10, "BLACK-W", "VIN10000000000011", "Isuzu", "Rodeo", 2021);
            Vehicle v12 = getOrCreateVehicle(c11, "WITCH-7", "VIN10000000000012", "Isuzu", "Trooper SE", 2019);
            Vehicle v13 = getOrCreateVehicle(c12, "MISCHIEF", "VIN10000000000013", "Isuzu", "D-Max Hi-Lander", 2018);

            // Seed Tickets
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
        }

        // Seed 4 additional PENDING tickets if they don't already exist
        try {
            log.info("Checking if additional PENDING tickets need to be seeded...");
            
            Customer c8 = getOrCreateCustomer("Steve Rogers", "+1-555-0422", "steve@example.com", "Brooklyn, NY");
            Customer c9 = getOrCreateCustomer("Bruce Banner", "+1-555-0533", "bruce@example.com", "Green Country");
            Customer c10 = getOrCreateCustomer("Natasha Romanoff", "+1-555-0644", "natasha@example.com", "St. Petersburg");

            Vehicle v8 = getOrCreateVehicle(c8, "CAP-1941", "VIN10000000000008", "Isuzu", "MU-X Ultimate", 2016);
            Vehicle v9 = getOrCreateVehicle(c8, "STARK-4", "VIN10000000000009", "Isuzu", "D-Max V-Cross", 2020);
            Vehicle v10 = getOrCreateVehicle(c9, "GREEN-8", "VIN10000000000010", "Isuzu", "Elf", 2023);
            Vehicle v11 = getOrCreateVehicle(c10, "BLACK-W", "VIN10000000000011", "Isuzu", "Rodeo", 2021);

            // Avoid duplicate seeding by checking if there's already a ticket with the same vehicle in PENDING status
            boolean t16Exists = ticketRepository.findAll().stream().anyMatch(t -> t.getVehicle().getId().equals(v8.getId()) && t.getStatus() == TicketStatus.PENDING);
            boolean t17Exists = ticketRepository.findAll().stream().anyMatch(t -> t.getVehicle().getId().equals(v9.getId()) && t.getStatus() == TicketStatus.PENDING);
            boolean t18Exists = ticketRepository.findAll().stream().anyMatch(t -> t.getVehicle().getId().equals(v10.getId()) && t.getStatus() == TicketStatus.PENDING);
            boolean t19Exists = ticketRepository.findAll().stream().anyMatch(t -> t.getVehicle().getId().equals(v11.getId()) && t.getStatus() == TicketStatus.PENDING);

            if (!t16Exists) {
                ServiceTicket t16 = ServiceTicket.builder()
                        .vehicle(v8)
                        .description("Scheduled 40,000km check-up. Engine oil change, fluid check, and front suspension inspection.")
                        .status(TicketStatus.PENDING)
                        .laborCost(new BigDecimal("80.00"))
                        .totalCost(new BigDecimal("80.00"))
                        .build();
                ticketRepository.save(t16);
                log.info("Seeded pending ticket t16.");
            }

            if (!t17Exists) {
                ServiceTicket t17 = ServiceTicket.builder()
                        .vehicle(v9)
                        .description("Battery charging indicator is red. Alternator check or battery replacement needed.")
                        .status(TicketStatus.PENDING)
                        .laborCost(new BigDecimal("90.00"))
                        .totalCost(new BigDecimal("90.00"))
                        .build();
                ticketRepository.save(t17);
                log.info("Seeded pending ticket t17.");
            }

            if (!t18Exists) {
                ServiceTicket t18 = ServiceTicket.builder()
                        .vehicle(v10)
                        .description("Brake pedal feels spongy. Check brake fluid level and inspect front/rear brake hoses for leaks.")
                        .status(TicketStatus.PENDING)
                        .laborCost(new BigDecimal("100.00"))
                        .totalCost(new BigDecimal("100.00"))
                        .build();
                ticketRepository.save(t18);
                log.info("Seeded pending ticket t18.");
            }

            if (!t19Exists) {
                ServiceTicket t19 = ServiceTicket.builder()
                        .vehicle(v11)
                        .description("Slight squealing sound from alternator belt. Belt tension adjustment or replacement needed.")
                        .status(TicketStatus.PENDING)
                        .laborCost(new BigDecimal("50.00"))
                        .totalCost(new BigDecimal("50.00"))
                        .build();
                ticketRepository.save(t19);
                log.info("Seeded pending ticket t19.");
            }

            // Seed another 4 PENDING tickets (t20 - t23) to provide more test data sets
            log.info("Seeding second set of additional PENDING tickets...");
            Customer c12 = getOrCreateCustomer("Loki Laufeyson", "+1-555-0866", "loki@example.com", "Asgard");
            Vehicle v20 = getOrCreateVehicle(c8, "STARK-5", "VIN10000000000020", "Isuzu", "D-Max Cab4", 2021);
            Vehicle v21 = getOrCreateVehicle(c9, "HULK-3", "VIN10000000000021", "Isuzu", "MU-X Onyx", 2019);
            Vehicle v22 = getOrCreateVehicle(c10, "SPY-007", "VIN10000000000022", "Isuzu", "Trooper SE", 2022);
            Vehicle v23 = getOrCreateVehicle(c12, "THOR-8", "VIN10000000000023", "Isuzu", "MU-7", 2018);

            boolean t20Exists = ticketRepository.findAll().stream().anyMatch(t -> t.getVehicle().getId().equals(v20.getId()) && t.getStatus() == TicketStatus.PENDING);
            boolean t21Exists = ticketRepository.findAll().stream().anyMatch(t -> t.getVehicle().getId().equals(v21.getId()) && t.getStatus() == TicketStatus.PENDING);
            boolean t22Exists = ticketRepository.findAll().stream().anyMatch(t -> t.getVehicle().getId().equals(v22.getId()) && t.getStatus() == TicketStatus.PENDING);
            boolean t23Exists = ticketRepository.findAll().stream().anyMatch(t -> t.getVehicle().getId().equals(v23.getId()) && t.getStatus() == TicketStatus.PENDING);

            if (!t20Exists) {
                ServiceTicket t20 = ServiceTicket.builder()
                        .vehicle(v20)
                        .description("Squeaking sound from passenger side front suspension when turning. Inspect ball joints and control arm bushings.")
                        .status(TicketStatus.PENDING)
                        .laborCost(new BigDecimal("70.00"))
                        .totalCost(new BigDecimal("70.00"))
                        .build();
                ticketRepository.save(t20);
                log.info("Seeded pending ticket t20.");
            }

            if (!t21Exists) {
                ServiceTicket t21 = ServiceTicket.builder()
                        .vehicle(v21)
                        .description("Engine warning light stays on. Code scanner reports engine coolant temp sensor circuit malfunction (P0117).")
                        .status(TicketStatus.PENDING)
                        .laborCost(new BigDecimal("110.00"))
                        .totalCost(new BigDecimal("110.00"))
                        .build();
                ticketRepository.save(t21);
                log.info("Seeded pending ticket t21.");
            }

            if (!t22Exists) {
                ServiceTicket t22 = ServiceTicket.builder()
                        .vehicle(v22)
                        .description("Windshield washer fluid not spraying. Pumps running but no pressure. Inspect nozzles and hose line.")
                        .status(TicketStatus.PENDING)
                        .laborCost(new BigDecimal("45.00"))
                        .totalCost(new BigDecimal("45.00"))
                        .build();
                ticketRepository.save(t22);
                log.info("Seeded pending ticket t22.");
            }

            if (!t23Exists) {
                ServiceTicket t23 = ServiceTicket.builder()
                        .vehicle(v23)
                        .description("Heater not working. Air blows lukewarm even when engine is hot. Check heater core and blend door actuator.")
                        .status(TicketStatus.PENDING)
                        .laborCost(new BigDecimal("95.05"))
                        .totalCost(new BigDecimal("95.05"))
                        .build();
                ticketRepository.save(t23);
                log.info("Seeded pending ticket t23.");
            }
        } catch (Exception e) {
            log.error("Failed to seed additional PENDING tickets: ", e);
        }

        log.info("Database seeding completed successfully!");
    }

    private User getOrCreateUser(String username, UserRole role, String fullName) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .username(username)
                                .passwordHash("password")
                                .role(role)
                                .fullName(fullName)
                                .build()
                ));
    }

    private SparePart getOrCreateSparePart(String partNumber, String name, BigDecimal unitPrice, int stockQuantity) {
        return sparePartRepository.findByPartNumber(partNumber)
                .orElseGet(() -> sparePartRepository.save(
                        SparePart.builder()
                                .partNumber(partNumber)
                                .name(name)
                                .unitPrice(unitPrice)
                                .stockQuantity(stockQuantity)
                                .build()
                ));
    }

    private Customer getOrCreateCustomer(String fullName, String phoneNumber, String email, String address) {
        return customerRepository.findByPhoneNumber(phoneNumber)
                .orElseGet(() -> customerRepository.save(
                        Customer.builder()
                                .fullName(fullName)
                                .phoneNumber(phoneNumber)
                                .email(email)
                                .address(address)
                                .build()
                ));
    }

    private Vehicle getOrCreateVehicle(Customer customer, String licensePlate, String vinNumber, String brand, String model, int year) {
        Vehicle vehicle = vehicleRepository.findByLicensePlate(licensePlate).orElse(null);
        if (vehicle != null) {
            boolean modified = false;
            if (!vehicle.getBrand().equalsIgnoreCase(brand)) {
                vehicle.setBrand(brand);
                modified = true;
            }
            if (!vehicle.getModel().equalsIgnoreCase(model)) {
                vehicle.setModel(model);
                modified = true;
            }
            if (modified) {
                vehicleRepository.save(vehicle);
            }
            return vehicle;
        }
        return vehicleRepository.save(
                Vehicle.builder()
                        .customer(customer)
                        .licensePlate(licensePlate)
                        .vinNumber(vinNumber)
                        .brand(brand)
                        .model(model)
                        .year(year)
                        .build()
        );
    }

    private String mapToIsuzuModel(String currentModel) {
        if (currentModel == null) return "D-Max";
        return switch (currentModel.trim().toLowerCase()) {
            case "camry" -> "D-Max";
            case "civic" -> "MU-X";
            case "explorer" -> "MU-7";
            case "330i" -> "D-Max Spark";
            case "cx-5" -> "MU-X Onyx";
            case "corolla" -> "D-Max Cab4";
            case "corvette" -> "Trooper";
            case "wrangler" -> "MU-X Ultimate";
            case "r8" -> "D-Max V-Cross";
            case "model s" -> "Elf";
            case "911" -> "Rodeo";
            case "xc90" -> "Trooper SE";
            case "charger" -> "D-Max Hi-Lander";
            default -> currentModel;
        };
    }
}
