"""Error handlers that produce the frontend's contract: {"error": "message"}."""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("carbonexa")


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse({"error": str(exc.detail)}, status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        details = {
            ".".join(str(p) for p in e["loc"] if p != "body"): e["msg"]
            for e in exc.errors()
        }
        return JSONResponse(
            {"error": "Validation failed", "details": details}, status_code=422
        )

    @app.exception_handler(Exception)
    async def unhandled_error(_: Request, exc: Exception) -> JSONResponse:
        # Log internally; never leak internals to the client.
        logger.exception("Unhandled error", exc_info=exc)
        return JSONResponse({"error": "Internal server error"}, status_code=500)
