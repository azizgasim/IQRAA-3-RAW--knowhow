from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class JobManager:
    def submit(self, job: Dict[str, Any]) -> Dict[str, Any]:
        return {"job_id": str(uuid.uuid4()), "status": "queued", "job": job}
