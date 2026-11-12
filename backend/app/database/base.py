"""Declarative base. Every model inherits from this (models arrive in Phase 3+)."""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
