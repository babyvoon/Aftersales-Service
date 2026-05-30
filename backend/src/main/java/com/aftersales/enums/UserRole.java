package com.aftersales.enums;

/**
 * Defines the roles available in the Aftersales Dashboard system.
 * Used for Role-Based Access Control (RBAC).
 */
public enum UserRole {

    /** Full system access — manage users, configuration, and all data. */
    ADMIN,

    /** Can create tickets, manage customers, and generate invoices. */
    SERVICE_ADVISOR,

    /** Can view assigned tickets and update ticket status only. */
    MECHANIC
}
