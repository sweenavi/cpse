import unittest
import requests

API_BASE = "http://localhost:8008/api"

class TestBackendRBAC(unittest.TestCase):
    def test_missing_header(self):
        # Requests without X-User-Id should return 401 Unauthorized
        res = requests.get(f"{API_BASE}/data/records")
        self.assertEqual(res.status_code, 401)
        self.assertIn("Missing Authentication Session Token", res.json()["detail"])

    def test_invalid_user(self):
        # Requests with invalid X-User-Id should return 401 Unauthorized
        res = requests.get(f"{API_BASE}/data/records", headers={"X-User-Id": "USR-INVALID-99"})
        self.assertEqual(res.status_code, 401)
        self.assertIn("Session expired or invalid user identity", res.json()["detail"])

    def test_procurement_forbidden_bypass(self):
        # Dr. Neha Verma (PROCUREMENT_TEAM) cannot adjudicate records (requires review.approve)
        headers = {"X-User-Id": "USR-PROC-03"}
        res = requests.post(f"{API_BASE}/agent1/adjudicate", headers=headers, json={
            "adjudicationId": "ADJ-2026-001",
            "action": "APPROVE"
        })
        self.assertEqual(res.status_code, 403)
        self.assertIn("Forbidden: Missing capability review.approve", res.json()["detail"])

    def test_engineer_allowed_approve(self):
        # Er. Rajesh Kulkarni (ENGINEERING_EXPERT) can review / adjudicate records (requires review.approve)
        headers = {"X-User-Id": "USR-ENG-04"}
        
        # Ensure we have a valid item in adjudication queue first
        queue_res = requests.get(f"{API_BASE}/agent1/queue", headers=headers)
        self.assertEqual(queue_res.status_code, 200)
        queue = queue_res.json()
        
        if queue:
            adj_id = queue[0]["id"]
            res = requests.post(f"{API_BASE}/agent1/adjudicate", headers=headers, json={
                "adjudicationId": adj_id,
                "action": "APPROVE",
                "modifiedDescription": "Approved nomenclature"
            })
            # Should queue successfully and return 200 OK
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json()["status"], "APPROVED_QUEUED")
            print(f"Verified Separation of Duties: Record queued in sap_sync_queue for {adj_id}")
        else:
            print("Notice: Adjudication queue is empty, skipping adjudicate test.")

    def test_engineer_cannot_execute_sap_sync(self):
        # Er. Rajesh Kulkarni (ENGINEERING_EXPERT) cannot execute SAP sync (requires sap.sync)
        headers = {"X-User-Id": "USR-ENG-04"}
        res = requests.post(f"{API_BASE}/agent4/sap-sync-execute", headers=headers, json={
            "queueId": "SYNC-ADJ-2026-001"
        })
        self.assertEqual(res.status_code, 403)
        self.assertIn("Forbidden: Missing capability sap.sync", res.json()["detail"])

    def test_it_admin_can_execute_sap_sync(self):
        # Vikramaditya Rao (IT_SAP_TEAM) can execute SAP sync (requires sap.sync)
        headers = {"X-User-Id": "USR-IT-06"}
        
        # Check if we have items in sync queue
        queue_res = requests.get(f"{API_BASE}/agent4/sap-sync-queue", headers=headers)
        self.assertEqual(queue_res.status_code, 200)
        sync_queue = queue_res.json()
        
        if sync_queue:
            q_id = sync_queue[0]["queueId"]
            local_code = sync_queue[0]["localCPSECode"]
            res = requests.post(f"{API_BASE}/agent4/sap-sync-execute", headers=headers, json={
                "queueId": q_id
            })
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json()["status"], "SYNCED")
            print(f"Verified BAPI Commit document: {res.json()['sapReceipt']['rfcDocumentNumber']} for {local_code}")
        else:
            print("Notice: SAP sync queue is empty, skipping execute sync test.")

    def test_audit_log_access(self):
        # Only IT Admins, CPSE Managers, and MoPNG Government can view audit logs (requires audit.view)
        # Smt. Ananya Sen (INVENTORY_TEAM) cannot view audit logs
        inv_headers = {"X-User-Id": "USR-INV-05"}
        res = requests.get(f"{API_BASE}/audit-logs", headers=inv_headers)
        self.assertEqual(res.status_code, 403)
        
        # Shri Amitabh Kant (MOPNG_GOVERNMENT) can view audit logs
        gov_headers = {"X-User-Id": "USR-MOPNG-01"}
        res = requests.get(f"{API_BASE}/audit-logs", headers=gov_headers)
        self.assertEqual(res.status_code, 200)
        self.assertIn("authLogs", res.json())

if __name__ == "__main__":
    unittest.main()
