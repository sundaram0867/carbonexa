"""Engine and session factory."""
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

_url = get_settings().sqlalchemy_url
_kwargs: dict = {"pool_pre_ping": True}
if str(_url).startswith("sqlite") and ":memory:" in str(_url):
    # Tests: share one in-memory DB across connections.
    from sqlalchemy.pool import StaticPool
    _kwargs = {"poolclass": StaticPool, "connect_args": {"check_same_thread": False}}

engine = create_engine(_url, **_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
