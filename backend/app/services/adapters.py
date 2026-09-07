"""Verification Provider Adapters for External Authoritative Sources."""
import abc
import json
from pathlib import Path
from typing import Dict, Any, List
from ..config import DATA_DIR
from ..models import ProviderType, AdapterStatus


class VerificationProvider(abc.ABC):
    """Abstract base for all source verification adapters."""

    def __init__(self, adapter_id: str, name: str, authority: str, provider_type: ProviderType):
        self.adapter_id = adapter_id
        self.name = name
        self.authority = authority
        self.provider_type = provider_type

    @abc.abstractmethod
    def verify(self, identifier: str) -> Dict[str, Any]:
        """Perform authoritative check against target system."""
        raise NotImplementedError

    @abc.abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """Verify connectivity and latency."""
        raise NotImplementedError


class MockGSTProvider(VerificationProvider):
    def __init__(self):
        super().__init__(
            adapter_id="ADAPT-GSTN-01",
            name="GSTN Registration & Return Filing Gateway",
            authority="Goods and Services Tax Network",
            provider_type=ProviderType.MOCK,
        )

    def verify(self, identifier: str) -> Dict[str, Any]:
        # Simulated database of GST records
        registry = {
            "27AAACB1234A1Z5": {
                "gstin": "27AAACB1234A1Z5",
                "legal_name": "ABC Industries Limited",
                "trade_name": "ABC Flow Controls",
                "status": "Active",
                "registration_date": "2017-07-01",
                "taxpayer_type": "Regular",
                "state_code": "27 (Maharashtra)",
                "gstr3b_status": "Filed up to July 2026",
                "name_match_score": 0.82,
                "notes": "Legal name includes 'Limited' while PAN registry specifies 'Private Limited'.",
            },
            "07AAACX9876K1ZP": {
                "gstin": "07AAACX9876K1ZP",
                "legal_name": "XYZ Corporation India Private Limited",
                "trade_name": "XYZ Subsea Valves",
                "status": "Active",
                "registration_date": "2018-04-12",
                "taxpayer_type": "Regular",
                "state_code": "07 (Delhi)",
                "gstr3b_status": "Filed up to August 2026",
                "name_match_score": 1.0,
                "notes": "Full exact match with all corporate records.",
            },
            "24AAACP4567M1ZX": {
                "gstin": "24AAACP4567M1ZX",
                "legal_name": "PQR Engineering Technologies Private Limited",
                "trade_name": "PQR Valves & Skids",
                "status": "Active",
                "registration_date": "2017-07-01",
                "taxpayer_type": "Regular",
                "state_code": "24 (Gujarat)",
                "gstr3b_status": "Filed up to August 2026",
                "name_match_score": 1.0,
                "notes": "Flawless tax compliance record; zero penalties.",
            },
        }
        res = registry.get(
            identifier.upper().strip(),
            {
                "gstin": identifier,
                "legal_name": "Record Not Found in Mock Gateway",
                "status": "Inactive / Unverified",
                "name_match_score": 0.0,
                "notes": "Query returned no matching tax entity.",
            },
        )
        return {
            "provider_type": self.provider_type.value,
            "authority": self.authority,
            "queried_identifier": identifier,
            "result": res,
            "timestamp": "2026-09-03T04:10:00+05:30",
        }

    def health_check(self) -> Dict[str, Any]:
        return {"adapter_id": self.adapter_id, "status": "ACTIVE", "latency_ms": 142, "provider_type": self.provider_type.value}


class MockMCAProvider(VerificationProvider):
    def __init__(self):
        super().__init__(
            adapter_id="ADAPT-MCA21-02",
            name="MCA21 Corporate Master Data Interface",
            authority="Ministry of Corporate Affairs",
            provider_type=ProviderType.MOCK,
        )

    def verify(self, identifier: str) -> Dict[str, Any]:
        mca_db = {
            "U29100MH2014PLC258901": {
                "cin": "U29100MH2014PLC258901",
                "company_name": "ABC INDUSTRIES LIMITED",
                "class_of_company": "Public",
                "authorized_capital_inr": 200000000.0,
                "paid_up_capital_inr": 125000000.0,
                "company_status": "Active",
                "last_agm_date": "2025-09-30",
                "balance_sheet_date": "2025-03-31",
                "turnover_fy25_mca": 124000000.0,
                "directors_count": 4,
            },
            "U31909DL2016PTC301824": {
                "cin": "U31909DL2016PTC301824",
                "company_name": "XYZ CORPORATION INDIA PRIVATE LIMITED",
                "class_of_company": "Private",
                "authorized_capital_inr": 100000000.0,
                "paid_up_capital_inr": 85000000.0,
                "company_status": "Active",
                "last_agm_date": "2025-09-28",
                "balance_sheet_date": "2025-03-31",
                "turnover_fy25_mca": 182000000.0,
                "directors_count": 3,
            },
        }
        res = mca_db.get(
            identifier.upper().strip(),
            {
                "cin": identifier,
                "company_name": "Entity Not Located in MCA21 Mock Snapshot",
                "company_status": "Unverified",
            },
        )
        return {
            "provider_type": self.provider_type.value,
            "authority": self.authority,
            "queried_identifier": identifier,
            "result": res,
        }

    def health_check(self) -> Dict[str, Any]:
        return {"adapter_id": self.adapter_id, "status": "ACTIVE", "latency_ms": 188, "provider_type": self.provider_type.value}


class MockDigiLockerProvider(VerificationProvider):
    def __init__(self):
        super().__init__(
            adapter_id="ADAPT-DIGILOCKER-03",
            name="DigiLocker Partner Document Verification Service",
            authority="National e-Governance Division (NeGD)",
            provider_type=ProviderType.SIMULATED,
        )

    def verify(self, identifier: str) -> Dict[str, Any]:
        return {
            "provider_type": self.provider_type.value,
            "authority": self.authority,
            "queried_identifier": identifier,
            "cryptographic_signature_valid": True,
            "issuer_cert_authority": "CCA India / National Informatics Centre Sub-CA",
            "tampering_detected": False,
            "revocation_status": "GOOD",
        }

    def health_check(self) -> Dict[str, Any]:
        return {"adapter_id": self.adapter_id, "status": "ACTIVE", "latency_ms": 235, "provider_type": self.provider_type.value}


class MockUdyamProvider(VerificationProvider):
    def __init__(self):
        super().__init__(
            adapter_id="ADAPT-UDYAM-04",
            name="Udyam MSME Registry Adapter",
            authority="Ministry of Micro, Small and Medium Enterprises",
            provider_type=ProviderType.MOCK,
        )

    def verify(self, identifier: str) -> Dict[str, Any]:
        udyam_data = {
            "UDYAM-MH-12-0049218": {
                "udyam_id": "UDYAM-MH-12-0049218",
                "enterprise_name": "ABC INDUSTRIES LIMITED",
                "enterprise_type": "Medium",
                "nic_code": "28131 - Manufacture of valves and taps",
                "employees_count": 42,
                "status": "Active",
            },
            "UDYAM-DL-03-0091823": {
                "udyam_id": "UDYAM-DL-03-0091823",
                "enterprise_name": "XYZ CORPORATION INDIA PRIVATE LIMITED",
                "enterprise_type": "Small",
                "nic_code": "28131",
                "employees_count": 28,
                "status": "Active",
            },
        }
        return {
            "provider_type": self.provider_type.value,
            "authority": self.authority,
            "queried_identifier": identifier,
            "result": udyam_data.get(identifier.upper().strip(), {"status": "Unverified"}),
        }

    def health_check(self) -> Dict[str, Any]:
        return {"adapter_id": self.adapter_id, "status": "ACTIVE", "latency_ms": 115, "provider_type": self.provider_type.value}


class MockBlacklistProvider(VerificationProvider):
    def __init__(self):
        super().__init__(
            adapter_id="ADAPT-DEBARMENT-05",
            name="GeM Central Debarment & CVC Blacklist Repository",
            authority="Central Vigilance Commission / GeM",
            provider_type=ProviderType.CURATED,
        )

    def verify(self, identifier: str) -> Dict[str, Any]:
        debarred_pans = ["XXXXX0000X", "BADDEAL12A"]
        is_debarred = identifier.upper().strip() in debarred_pans
        return {
            "provider_type": self.provider_type.value,
            "authority": self.authority,
            "queried_identifier": identifier,
            "is_debarred": is_debarred,
            "debarment_record": None if not is_debarred else "Debarred under DoE Order No. 4921",
            "screening_status": "CLEARED" if not is_debarred else "DEBARRED",
        }

    def health_check(self) -> Dict[str, Any]:
        return {"adapter_id": self.adapter_id, "status": "ACTIVE", "latency_ms": 94, "provider_type": self.provider_type.value}


# Adapter Registry Singleton
ADAPTER_INSTANCES: Dict[str, VerificationProvider] = {
    "ADAPT-GSTN-01": MockGSTProvider(),
    "ADAPT-MCA21-02": MockMCAProvider(),
    "ADAPT-DIGILOCKER-03": MockDigiLockerProvider(),
    "ADAPT-UDYAM-04": MockUdyamProvider(),
    "ADAPT-DEBARMENT-05": MockBlacklistProvider(),
}


def get_all_adapters() -> List[AdapterStatus]:
    adapters_file = DATA_DIR / "sample_adapters.json"
    if adapters_file.exists():
        with open(adapters_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [AdapterStatus(**item) for item in data]
    return []


def test_adapter_query(adapter_id: str, identifier: str) -> Dict[str, Any]:
    provider = ADAPTER_INSTANCES.get(adapter_id)
    if not provider:
        return {"error": f"Adapter '{adapter_id}' not recognized."}
    return provider.verify(identifier)
