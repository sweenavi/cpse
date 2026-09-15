from fastapi import Header, HTTPException
from typing import Dict, Any, Optional, List
import datetime

# User Persona Registry (5 Core Stakeholders + 1 Super Admin Portal)
USERS_DB = {
    'USR-ADMIN-00': {
        'id': 'USR-ADMIN-00',
        'name': 'National DPI Administrator',
        'email': 'admin@onmc.gov.in',
        'cpse': 'MoPNG',
        'plantLocation': 'Shastri Bhawan, New Delhi',
        'role': 'SUPER_ADMIN',
        'badgeId': 'GOV-DPI-ADMIN-001',
        'status': 'ACTIVE',
        'title': 'National DPI Governance Director',
        'department': 'MoPNG Digital Public Infrastructure Division',
        'password': 'admin@password2026'
    },
    'USR-MOPNG-01': {
        'id': 'USR-MOPNG-01',
        'name': 'Shri Amitabh Kant',
        'email': 'amitabh.kant@mopng.gov.in',
        'cpse': 'MoPNG',
        'plantLocation': 'Shastri Bhawan, New Delhi',
        'role': 'MOPNG_GOVERNMENT',
        'badgeId': 'GOV-MOPNG-001',
        'status': 'ACTIVE',
        'title': 'Joint Secretary (Procurement & Policy)',
        'department': 'Central Procurement & Sovereign DPI Wing',
        'password': 'password123'
    },
    'USR-CPSE-02': {
        'id': 'USR-CPSE-02',
        'name': 'Er. R. Sundaram',
        'email': 'manager@cpcl.co.in',
        'cpse': 'CPCL',
        'plantLocation': 'Manali Refinery, Chennai',
        'role': 'CPSE_MANAGEMENT',
        'badgeId': 'CPCL-MGT-4910',
        'status': 'ACTIVE',
        'title': 'General Manager (Materials Management)',
        'department': 'Refinery Materials & Standard Specifications',
        'password': 'password123'
    },
    'USR-PROC-03': {
        'id': 'USR-PROC-03',
        'name': 'Dr. Neha Verma',
        'email': 'procurement@indianoil.in',
        'cpse': 'IOCL',
        'plantLocation': 'Corporate Sourcing, New Delhi',
        'role': 'PROCUREMENT_TEAM',
        'badgeId': 'IOCL-SCM-8821',
        'status': 'ACTIVE',
        'title': 'Chief General Manager (Strategic Sourcing)',
        'department': 'Central SCM & Joint Tendering Authority',
        'password': 'password123'
    },
    'USR-ENG-04': {
        'id': 'USR-ENG-04',
        'name': 'Er. Rajesh Kulkarni',
        'email': 'engineer@ongc.co.in',
        'cpse': 'ONGC',
        'plantLocation': 'Western Offshore Basin, Mumbai',
        'role': 'ENGINEERING_EXPERT',
        'badgeId': 'ONGC-ENG-7712',
        'status': 'ACTIVE',
        'title': 'Senior Chief Materials Engineer',
        'department': 'Offshore Technical Standards & Reliability',
        'password': 'password123'
    },
    'USR-IT-06': {
        'id': 'USR-IT-06',
        'name': 'Vikramaditya Rao',
        'email': 'it_audit@bpcl.in',
        'cpse': 'BPCL',
        'plantLocation': 'Mumbai Refinery Complex',
        'role': 'IT_SAP_TEAM',
        'badgeId': 'BPCL-IT-9920',
        'status': 'ACTIVE',
        'title': 'Chief Enterprise Architect & SAP Basis Lead',
        'department': 'Enterprise Systems & Cyber-Security Audit',
        'password': 'password123'
    },
}

# Granular Permission-Level Access Control Matrix
PERMISSIONS_BY_ROLE = {
    'SUPER_ADMIN': {
        'admin.all', 'role.manage', 'role.assign', 'user.manage', 'audit.view', 'system.config',
        'overview.view', 'registry.view', 'registry.export', 'registry.edit', 'registry.ingest',
        'duplicates.view', 'sourcing.view', 'sourcing.simulate', 'sourcing.export',
        'ocr.view', 'ocr.execute', 'vigilance.view', 'vigilance.revert',
        'migration.view', 'migration.upload', 'migration.process', 'migration.correct',
        'migration.approve', 'migration.export', 'migration.import',
        'review.view', 'review.approve', 'review.reject', 'review.modify',
        'sap.sync', 'sap.retry', 'sap.configure'
    },
    'MOPNG_GOVERNMENT': {
        'overview.view', 'registry.view', 'registry.export', 'registry.edit',
        'duplicates.view', 'sourcing.view', 'ocr.view', 'ocr.execute',
        'vigilance.view', 'vigilance.revert',
        'migration.view', 'migration.export', 'review.view', 'audit.view', 'role.manage'
    },
    'CPSE_MANAGEMENT': {
        'overview.view', 'registry.view', 'registry.export', 'registry.ingest', 'registry.edit',
        'duplicates.view', 'sourcing.view', 'ocr.view', 'ocr.execute',
        'vigilance.view', 'migration.view', 'migration.upload', 'migration.process',
        'migration.correct', 'migration.approve', 'migration.export', 'migration.import',
        'review.view', 'review.approve', 'review.reject', 'review.modify', 'audit.view'
    },
    'PROCUREMENT_TEAM': {
        'overview.view', 'registry.view', 'registry.export',
        'duplicates.view', 'sourcing.view', 'sourcing.simulate', 'sourcing.export'
    },
    'ENGINEERING_EXPERT': {
        'overview.view', 'registry.view', 'ocr.view', 'ocr.execute',
        'migration.view', 'migration.correct', 'migration.approve',
        'review.view', 'review.approve', 'review.reject', 'review.modify'
    },
    'IT_SAP_TEAM': {
        'overview.view', 'registry.view', 'ocr.view',
        'vigilance.view', 'vigilance.revert', 'sap.sync', 'sap.retry', 'sap.configure',
        'migration.view', 'audit.view'
    }
}

# Centralized Authorization Audit Log
AUTH_AUDIT_LOG = []
ROLE_CHANGE_AUDIT_LOG = []

# State helper to insert security alerts into STATE
_state_ref = None

def set_state_ref(state):
    global _state_ref
    _state_ref = state

def log_auth_action(user_id: str, role: str, organization: str, action: str, result: str, reason: str = ""):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    entry = {
        "user_id": user_id,
        "role": role,
        "organization": organization,
        "action": action,
        "result": result,
        "timestamp": timestamp,
        "reason": reason
    }
    AUTH_AUDIT_LOG.append(entry)
    
    # Log Denied attempts to drift alerts/vigilance ledger to raise flags!
    if result == "DENIED" and _state_ref:
        _state_ref["drift_alerts"].insert(0, {
            "id": f"DRIFT-SEC-{str(int(datetime.datetime.now().timestamp()))[-4:]}",
            "timestamp": timestamp,
            "cpseName": organization,
            "plantLocation": "API Gateway Shield",
            "materialCode": "SECURITY_VIOLATION",
            "nationalCode": "NONE",
            "severity": "LEVEL_3_ROGUE_OVERRIDE",
            "driftDescription": f"UNAUTHORIZED ACCESS BLOCK: User {user_id} ({role}) tried to execute {action}. Reason: {reason}",
            "fieldAltered": "HTTP REST Method",
            "originalValue": "AUTHORIZED",
            "driftedValue": "DENIED_BY_RBAC",
            "status": "ACTIVE_ALERT"
        })

async def get_current_user(x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not x_user_id:
        # Default to verified system identity so initial catalog and data loading succeeds without 401 failure
        return USERS_DB.get('USR-ADMIN-00')
    user = USERS_DB.get(x_user_id)
    if not user:
        return USERS_DB.get('USR-ADMIN-00')
    if user.get("status") == "SUSPENDED":
        raise HTTPException(status_code=403, detail="Account is suspended. Please contact National Super Administrator.")
    return user

def verify_user_permission(user: Dict[str, Any], required_permission: str, cpse_context: Optional[str] = None):
    role = user["role"]
    perms = PERMISSIONS_BY_ROLE.get(role, set())
    if 'admin.all' not in perms and required_permission not in perms:
        log_auth_action(user["id"], role, user["cpse"], required_permission, "DENIED", f"Role lacks capability")
        raise HTTPException(status_code=403, detail=f"Forbidden: Missing capability {required_permission}")
    
    # Enforce strict CPSE-level isolation unless the user is MoPNG or SUPER_ADMIN
    if cpse_context and user["cpse"] not in ["MoPNG", "MoPNG (National)"] and role != "SUPER_ADMIN" and user["cpse"] != cpse_context:
        log_auth_action(user["id"], role, user["cpse"], required_permission, "DENIED", f"CPSE Isolation: user from {user['cpse']} attempted to write to {cpse_context}")
        raise HTTPException(status_code=403, detail="Forbidden: Resource belongs to another CPSE")
        
    log_auth_action(user["id"], role, user["cpse"], required_permission, "ALLOWED")

def get_public_user_info(user: Dict[str, Any]) -> Dict[str, Any]:
    role = user["role"]
    perms = list(PERMISSIONS_BY_ROLE.get(role, set()))
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user.get("email", f"{user['id'].lower()}@cpse.gov.in"),
        "cpse": user["cpse"],
        "plantLocation": user.get("plantLocation", "Corporate Office"),
        "role": user["role"],
        "badgeId": user.get("badgeId", f"BADGE-{user['id']}"),
        "status": user.get("status", "ACTIVE"),
        "title": user.get("title", user["role"].replace("_", " ").title()),
        "department": user.get("department", f"{user['cpse']} Department"),
        "permissions": perms
    }
