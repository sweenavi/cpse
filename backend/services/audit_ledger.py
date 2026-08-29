import hashlib
from datetime import datetime
from typing import List, Dict, Any

class CryptographicLedger:
    def __init__(self):
        self.blocks: List[Dict[str, Any]] = [
            {
                "blockIndex": 100,
                "timestamp": "2026-08-27 18:00:00 IST",
                "previousHash": "0" * 64,
                "currentHash": "a8b92c10398aa38019ab91283726bcda91827461938bdf8217f83c6b2d184cf9",
                "actor": "GENESIS_NODE",
                "actionType": "GENESIS_INITIALIZE",
                "payloadSummary": "Genesis block for National Material Master Registry.",
            }
        ]

    def add_block(self, actor: str, action_type: str, payload_summary: str, details: Dict[str, Any]) -> Dict[str, Any]:
        prev_block = self.blocks[-1]
        prev_hash = prev_block["currentHash"]
        block_index = prev_block["blockIndex"] + 1
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")

        # SHA-256 cryptographic hashing
        raw_string = f"{block_index}|{timestamp}|{prev_hash}|{actor}|{action_type}|{payload_summary}"
        curr_hash = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()

        new_block = {
            "blockIndex": block_index,
            "timestamp": timestamp,
            "previousHash": prev_hash,
            "currentHash": curr_hash,
            "actor": actor,
            "actionType": action_type,
            "payloadSummary": payload_summary,
            "details": details
        }
        self.blocks.append(new_block)
        return new_block

    def get_ledger(self) -> List[Dict[str, Any]]:
        return list(reversed(self.blocks))

    def verify_integrity(self) -> bool:
        for i in range(1, len(self.blocks)):
            prev = self.blocks[i - 1]
            curr = self.blocks[i]
            if curr["previousHash"] != prev["currentHash"]:
                return False
        return True

ledger_instance = CryptographicLedger()
