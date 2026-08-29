from fastapi import Header, HTTPException
from typing import Dict, Any, Optional

# User Persona Registry (Demo & Live Auth database)
USERS_DB = {
    'USR-MOPNG-01': {'id': 'USR-MOPNG-01', 'name': 'Shri Amitabh Kant', 'cpse': 'MoPNG', 'role': 'MOPNG_GOVERNMENT'},
    'USR-CPSE-02': {'id': 'USR-CPSE-02', 'name': 'Er. R. Sundaram', 'cpse': 'CPCL', 'role': 'CPSE_MANAGEMENT'},
    'USR-PROC-03': {'id': 'USR-PROC-03', 'name': 'Dr. Neha Verma', 'cpse': 'IOCL', 'role': 'PROCUREMENT_TEAM'},
    'USR-ENG-04': {'id': 'USR-ENG-04', 'name': 'Er. Rajesh Kulkarni', 'cpse': 'ONGC', 'role': 'ENGINEERING_EXPERT'},
    'USR-INV-05': {'id': 'USR-INV-05', 'name': 'Smt. Ananya Sen', 'cpse': 'SAIL', 'role': 'INVENTORY_TEAM'},
    'USR-IT-06': {'id': 'USR-IT-06', 'name': 'Vikramaditya Rao', 'cpse': 'BPCL', 'role': 'IT_SAP_TEAM'},
}

# Granular Permission-Level Access Control Matrix
PERMISSIONS_BY_ROLE = {
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
    'INVENTORY_TEAM': {
        'overview.view', 'registry.view', 'duplicates.view', 'inventory.pool', 'sourcing.view'
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
    import datetime
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
        raise HTTPException(status_code=401, detail="Missing Authentication Session Token (X-User-Id header)")
    user = USERS_DB.get(x_user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid user identity")
    return user

def verify_user_permission(user: Dict[str, Any], required_permission: str, cpse_context: Optional[str] = None):
    role = user["role"]
    perms = PERMISSIONS_BY_ROLE.get(role, set())
    if required_permission not in perms:
        log_auth_action(user["id"], role, user["cpse"], required_permission, "DENIED", f"Role lacks capability")
        raise HTTPException(status_code=403, detail=f"Forbidden: Missing capability {required_permission}")
    
    # Enforce strict CPSE-level isolation unless the user is MoPNG
    if cpse_context and user["cpse"] != "MoPNG" and user["cpse"] != cpse_context:
        log_auth_action(user["id"], role, user["cpse"], required_permission, "DENIED", f"CPSE Isolation: user from {user['cpse']} attempted to write to {cpse_context}")
        raise HTTPException(status_code=403, detail="Forbidden: Resource belongs to another CPSE")
        
    log_auth_action(user["id"], role, user["cpse"], required_permission, "ALLOWED")
