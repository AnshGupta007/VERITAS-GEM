"""
VERITAS-GEM Internal Event Bus.

Decouples service communication via a publish/subscribe pattern.
Services publish domain events; subscribers react asynchronously.

Architecture:
    CompliancePipeline → publishes FINDING_EVALUATED
    AuditLedger → subscribes to DECISION_RECORDED → auto-records audit block
    ScoringEngine → subscribes to FINDING_EVALUATED → recalculates bidder scores
"""
import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Dict, List, Optional
from collections import defaultdict

logger = logging.getLogger("veritas.events")


class DomainEvent(str, Enum):
    """Canonical domain events emitted by VERITAS-GEM services."""
    TENDER_INGESTED = "TENDER_INGESTED"
    FINDING_EVALUATED = "FINDING_EVALUATED"
    DECISION_RECORDED = "DECISION_RECORDED"
    CONTRADICTION_DETECTED = "CONTRADICTION_DETECTED"
    TEMPORAL_VIOLATION = "TEMPORAL_VIOLATION"
    ADAPTER_QUERIED = "ADAPTER_QUERIED"
    PIPELINE_STAGE_COMPLETED = "PIPELINE_STAGE_COMPLETED"
    PIPELINE_COMPLETED = "PIPELINE_COMPLETED"
    COMMITTEE_SIGNED = "COMMITTEE_SIGNED"
    AUDIT_INTEGRITY_VERIFIED = "AUDIT_INTEGRITY_VERIFIED"


@dataclass(frozen=True)
class EventPayload:
    """Immutable event payload carrying domain context."""
    event: DomainEvent
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    source: str = "veritas-core"
    data: Dict[str, Any] = field(default_factory=dict)
    correlation_id: Optional[str] = None


# Type alias for event handler functions
EventHandler = Callable[[EventPayload], Any]


class EventBus:
    """
    In-process asynchronous event bus for domain event propagation.

    Supports both sync and async handlers. Handlers are invoked
    in registration order and failures are isolated (one handler
    failing does not block others).

    Usage:
        bus = EventBus()
        bus.subscribe(DomainEvent.DECISION_RECORDED, audit_handler)
        await bus.publish(EventPayload(event=DomainEvent.DECISION_RECORDED, data={...}))
    """

    def __init__(self) -> None:
        self._subscribers: Dict[DomainEvent, List[EventHandler]] = defaultdict(list)
        self._global_subscribers: List[EventHandler] = []
        self._event_log: List[EventPayload] = []
        self._max_log_size: int = 1000

    def subscribe(self, event: DomainEvent, handler: EventHandler) -> None:
        """Register a handler for a specific domain event."""
        self._subscribers[event].append(handler)
        logger.debug("Subscribed handler '%s' to event '%s'", handler.__name__, event.value)

    def subscribe_all(self, handler: EventHandler) -> None:
        """Register a handler that receives ALL domain events (for logging/monitoring)."""
        self._global_subscribers.append(handler)

    def unsubscribe(self, event: DomainEvent, handler: EventHandler) -> None:
        """Remove a handler from a specific event."""
        handlers = self._subscribers.get(event, [])
        if handler in handlers:
            handlers.remove(handler)

    async def publish(self, payload: EventPayload) -> int:
        """
        Publish an event to all registered handlers.
        Returns the number of handlers that successfully processed the event.
        """
        # Record to internal event log
        self._event_log.append(payload)
        if len(self._event_log) > self._max_log_size:
            self._event_log = self._event_log[-self._max_log_size:]

        handlers = self._subscribers.get(payload.event, []) + self._global_subscribers
        success_count = 0

        for handler in handlers:
            try:
                result = handler(payload)
                # Support async handlers transparently
                if asyncio.iscoroutine(result):
                    await result
                success_count += 1
            except Exception as exc:
                logger.error(
                    "Event handler '%s' failed for event '%s': %s",
                    handler.__name__,
                    payload.event.value,
                    str(exc),
                    exc_info=True,
                )

        logger.info(
            "Published event '%s' → %d/%d handlers succeeded",
            payload.event.value,
            success_count,
            len(handlers),
        )
        return success_count

    def publish_sync(self, payload: EventPayload) -> int:
        """Synchronous publish for use in non-async contexts."""
        self._event_log.append(payload)
        if len(self._event_log) > self._max_log_size:
            self._event_log = self._event_log[-self._max_log_size:]

        handlers = self._subscribers.get(payload.event, []) + self._global_subscribers
        success_count = 0

        for handler in handlers:
            try:
                result = handler(payload)
                if asyncio.iscoroutine(result):
                    # In sync context, we can't await — schedule on loop if available
                    try:
                        loop = asyncio.get_running_loop()
                        loop.create_task(result)
                    except RuntimeError:
                        pass  # No loop running; skip async handler
                success_count += 1
            except Exception as exc:
                logger.error(
                    "Sync event handler '%s' failed: %s",
                    handler.__name__,
                    str(exc),
                )

        return success_count

    def get_event_log(self, event: Optional[DomainEvent] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent events from the internal log (for debugging/monitoring)."""
        events = self._event_log
        if event:
            events = [e for e in events if e.event == event]
        return [
            {
                "event": e.event.value,
                "timestamp": e.timestamp,
                "source": e.source,
                "correlation_id": e.correlation_id,
                "data_keys": list(e.data.keys()),
            }
            for e in events[-limit:]
        ]

    @property
    def subscriber_count(self) -> Dict[str, int]:
        """Returns count of subscribers per event type."""
        return {
            event.value: len(handlers)
            for event, handlers in self._subscribers.items()
            if handlers
        }
