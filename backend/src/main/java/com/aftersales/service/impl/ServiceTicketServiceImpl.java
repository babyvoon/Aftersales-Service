package com.aftersales.service.impl;

import com.aftersales.dto.*;
import com.aftersales.entity.*;
import com.aftersales.enums.TicketStatus;
import com.aftersales.enums.UserRole;
import com.aftersales.exception.BadRequestException;
import com.aftersales.exception.InsufficientStockException;
import com.aftersales.exception.ResourceNotFoundException;
import com.aftersales.repository.*;
import com.aftersales.service.ServiceTicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of {@link ServiceTicketService}.
 * Contains all business logic for ticket management, billing calculations,
 * and inventory adjustments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceTicketServiceImpl implements ServiceTicketService {

    /** 7% VAT rate applied to the subtotal (labor + parts). */
    private static final BigDecimal VAT_RATE = new BigDecimal("0.07");

    private final ServiceTicketRepository ticketRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final SparePartRepository sparePartRepository;
    private final TicketItemRepository ticketItemRepository;
    private final CustomerRepository customerRepository;

    // ===================================================================
    //  CRUD Operations
    // ===================================================================

    @Override
    public ServiceTicketResponse createTicket(CreateTicketRequest request) {
        log.info("Creating service ticket. Request vehicleId={}, licensePlate={}", request.getVehicleId(), request.getLicensePlate());

        // 1. Get or dynamically create vehicle
        Vehicle vehicle;
        if (request.getVehicleId() != null && request.getVehicleId() > 0) {
            vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));
        } else {
            String plate = request.getLicensePlate() != null ? request.getLicensePlate().toUpperCase() : "UNKNOWN";
            vehicle = vehicleRepository.findByLicensePlate(plate).orElse(null);
            
            if (vehicle == null) {
                // Create customer
                Customer customer = Customer.builder()
                        .fullName(request.getCustomerName() != null ? request.getCustomerName() : "Unknown Customer")
                        .phoneNumber(request.getCustomerPhone() != null ? request.getCustomerPhone() : "000-000-0000")
                        .build();
                customer = customerRepository.save(customer);

                // Create vehicle
                vehicle = Vehicle.builder()
                        .customer(customer)
                        .licensePlate(plate)
                        .vinNumber("VIN-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000))
                        .brand(request.getVehicleBrand() != null ? request.getVehicleBrand() : "Unknown")
                        .model(request.getVehicleModel() != null ? request.getVehicleModel() : "Unknown")
                        .year(request.getVehicleYear() != null ? request.getVehicleYear() : 2020)
                        .build();
                vehicle = vehicleRepository.save(vehicle);
            }
        }

        // 2. Build the ticket entity
        BigDecimal laborCost = request.getLaborCost() != null
                ? request.getLaborCost()
                : BigDecimal.ZERO;

        ServiceTicket ticket = ServiceTicket.builder()
                .vehicle(vehicle)
                .description(request.getDescription())
                .status(TicketStatus.PENDING)
                .laborCost(laborCost)
                .totalCost(laborCost)   // Initially total = labor (no parts yet)
                .build();

        // 3. Optionally assign a mechanic
        if (request.getMechanicId() != null) {
            User mechanic = validateAndGetMechanic(request.getMechanicId());
            ticket.setAssignedMechanic(mechanic);
        }

        // 4. Persist
        ServiceTicket saved = ticketRepository.save(ticket);
        log.info("Service ticket created with ID: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceTicketResponse getTicketById(Long id) {
        ServiceTicket ticket = ticketRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceTicket", id));
        return mapToResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceTicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceTicketResponse> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceTicketResponse updateTicket(Long id, UpdateTicketRequest request) {
        log.info("Updating service ticket ID: {}", id);

        ServiceTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceTicket", id));

        // Apply partial updates (null fields are skipped)
        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription());
        }

        if (request.getLaborCost() != null) {
            ticket.setLaborCost(request.getLaborCost());
            ticket.recalculateTotal();
        }

        if (request.getMechanicId() != null) {
            User mechanic = validateAndGetMechanic(request.getMechanicId());
            ticket.setAssignedMechanic(mechanic);
        }

        ServiceTicket saved = ticketRepository.save(ticket);
        log.info("Service ticket {} updated successfully", saved.getId());

        return mapToResponse(saved);
    }

    // ===================================================================
    //  Status Transitions (Kanban Workflow)
    // ===================================================================

    @Override
    public ServiceTicketResponse updateTicketStatus(Long id, UpdateTicketStatusRequest request) {
        log.info("Updating status of ticket ID: {} to {}", id, request.getStatus());

        ServiceTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceTicket", id));

        validateStatusTransition(ticket.getStatus(), request.getStatus());

        ticket.setStatus(request.getStatus());
        ServiceTicket saved = ticketRepository.save(ticket);

        log.info("Ticket {} status changed: {} -> {}", id, ticket.getStatus(), request.getStatus());
        return mapToResponse(saved);
    }

    // ===================================================================
    //  Line Item Management
    // ===================================================================

    @Override
    public ServiceTicketResponse addTicketItem(Long ticketId, AddTicketItemRequest request) {
        log.info("Adding part ID: {} (qty: {}) to ticket ID: {}",
                request.getPartId(), request.getQuantity(), ticketId);

        ServiceTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceTicket", ticketId));

        SparePart part = sparePartRepository.findById(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("SparePart", request.getPartId()));

        // Validate stock availability before attempting decrement
        if (part.getStockQuantity() < request.getQuantity()) {
            throw new InsufficientStockException(
                    part.getName(), request.getQuantity(), part.getStockQuantity());
        }

        // Atomically decrement stock (prevents race conditions)
        int updatedRows = sparePartRepository.decrementStock(part.getId(), request.getQuantity());
        if (updatedRows == 0) {
            throw new InsufficientStockException(
                    part.getName(), request.getQuantity(), part.getStockQuantity());
        }

        // Check if the part already exists on the ticket
        TicketItem existingItem = ticket.getTicketItems().stream()
                .filter(ti -> ti.getSparePart().getId().equals(part.getId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.calculateSubtotal(); // Recalculate item subtotal
        } else {
            // Create ticket item
            TicketItem item = TicketItem.builder()
                    .serviceTicket(ticket)
                    .sparePart(part)
                    .quantity(request.getQuantity())
                    .pricePerUnit(part.getUnitPrice())
                    .build();
            ticket.addTicketItem(item);
        }

        ticket.recalculateTotal();

        ServiceTicket saved = ticketRepository.save(ticket);
        log.info("Item added/updated on ticket {}. New total: {}", ticketId, saved.getTotalCost());

        return mapToResponse(saved);
    }

    @Override
    public ServiceTicketResponse removeTicketItem(Long ticketId, Long itemId) {
        log.info("Removing item ID: {} from ticket ID: {}", itemId, ticketId);

        ServiceTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceTicket", ticketId));

        TicketItem item = ticket.getTicketItems().stream()
                .filter(ti -> ti.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("TicketItem %d not found in ticket %d", itemId, ticketId)));

        // Restore stock to inventory
        SparePart part = item.getSparePart();
        part.setStockQuantity(part.getStockQuantity() + item.getQuantity());
        sparePartRepository.save(part);

        // Remove item and recalculate total
        ticket.removeTicketItem(item);
        ticket.recalculateTotal();

        ServiceTicket saved = ticketRepository.save(ticket);
        log.info("Item {} removed from ticket {}. New total: {}", itemId, ticketId, saved.getTotalCost());

        return mapToResponse(saved);
    }

    // ===================================================================
    //  Soft Delete
    // ===================================================================

    @Override
    public void deleteTicket(Long id) {
        log.info("Soft-deleting service ticket ID: {}", id);

        ServiceTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceTicket", id));

        ticketRepository.delete(ticket); // Triggers @SQLDelete soft delete
        log.info("Service ticket {} soft-deleted successfully", id);
    }

    // ===================================================================
    //  Private Helpers
    // ===================================================================

    /**
     * Validates that the given user ID belongs to a user with the MECHANIC role.
     */
    private User validateAndGetMechanic(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (user.getRole() != UserRole.MECHANIC) {
            throw new BadRequestException(
                    String.format("User '%s' (ID: %d) has role %s — only MECHANIC role can be assigned to tickets",
                            user.getFullName(), userId, user.getRole()));
        }
        return user;
    }

    /**
     * Enforces the allowed Kanban workflow transitions.
     *
     * Valid transitions:
     *   PENDING          -> IN_PROGRESS, WAITING_FOR_PARTS
     *   IN_PROGRESS      -> WAITING_FOR_PARTS, COMPLETED
     *   WAITING_FOR_PARTS -> IN_PROGRESS
     *   COMPLETED        -> DELIVERED
     *   DELIVERED         -> (terminal — no further transitions)
     */
    private void validateStatusTransition(TicketStatus current, TicketStatus target) {
        boolean valid = switch (current) {
            case PENDING           -> target == TicketStatus.IN_PROGRESS
                                      || target == TicketStatus.WAITING_FOR_PARTS;
            case IN_PROGRESS       -> target == TicketStatus.WAITING_FOR_PARTS
                                      || target == TicketStatus.COMPLETED;
            case WAITING_FOR_PARTS -> target == TicketStatus.IN_PROGRESS;
            case COMPLETED         -> target == TicketStatus.DELIVERED;
            case DELIVERED         -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    String.format("Invalid status transition: %s -> %s. "
                            + "Check the allowed workflow transitions.", current, target));
        }
    }

    /**
     * Maps a {@link ServiceTicket} entity to a {@link ServiceTicketResponse} DTO
     * with a full billing breakdown including 7% VAT.
     *
     * Billing formula:
     *   partsTotal  = SUM(item.subtotal)
     *   subtotal    = laborCost + partsTotal
     *   vatAmount   = subtotal * 0.07  (rounded HALF_UP to 2 decimal places)
     *   totalWithVat = subtotal + vatAmount
     */
    private ServiceTicketResponse mapToResponse(ServiceTicket ticket) {
        // ---- Calculate billing breakdown ----
        BigDecimal partsTotal = BigDecimal.ZERO;
        List<TicketItemResponse> itemResponses = List.of();

        if (ticket.getTicketItems() != null && !ticket.getTicketItems().isEmpty()) {
            partsTotal = ticket.getTicketItems().stream()
                    .map(TicketItem::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            itemResponses = ticket.getTicketItems().stream()
                    .map(this::mapItemToResponse)
                    .collect(Collectors.toList());
        }

        BigDecimal laborCost = ticket.getLaborCost() != null ? ticket.getLaborCost() : BigDecimal.ZERO;
        BigDecimal subtotal = laborCost.add(partsTotal);
        BigDecimal vatAmount = subtotal.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalWithVat = subtotal.add(vatAmount);

        // ---- Build response ----
        ServiceTicketResponse.ServiceTicketResponseBuilder builder = ServiceTicketResponse.builder()
                .id(ticket.getId())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .laborCost(laborCost)
                .partsTotal(partsTotal)
                .subtotal(subtotal)
                .vatAmount(vatAmount)
                .totalWithVat(totalWithVat)
                .items(itemResponses)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt());

        // ---- Vehicle & Customer info ----
        Vehicle vehicle = ticket.getVehicle();
        if (vehicle != null) {
            builder.vehicleId(vehicle.getId())
                    .licensePlate(vehicle.getLicensePlate())
                    .vehicleBrand(vehicle.getBrand())
                    .vehicleModel(vehicle.getModel())
                    .vehicleYear(vehicle.getYear());

            Customer customer = vehicle.getCustomer();
            if (customer != null) {
                builder.customerId(customer.getId())
                        .customerName(customer.getFullName())
                        .customerPhone(customer.getPhoneNumber());
            }
        }

        // ---- Mechanic info ----
        User mechanic = ticket.getAssignedMechanic();
        if (mechanic != null) {
            builder.mechanicId(mechanic.getId())
                    .mechanicName(mechanic.getFullName());
        }

        return builder.build();
    }

    /**
     * Maps a {@link TicketItem} entity to a {@link TicketItemResponse} DTO.
     */
    private TicketItemResponse mapItemToResponse(TicketItem item) {
        TicketItemResponse.TicketItemResponseBuilder builder = TicketItemResponse.builder()
                .id(item.getId())
                .quantity(item.getQuantity())
                .pricePerUnit(item.getPricePerUnit())
                .subtotal(item.getSubtotal())
                .createdAt(item.getCreatedAt());

        SparePart part = item.getSparePart();
        if (part != null) {
            builder.partId(part.getId())
                    .partNumber(part.getPartNumber())
                    .partName(part.getName());
        }

        return builder.build();
    }
}
