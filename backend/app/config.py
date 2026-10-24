"""
Application Configuration Module.

Loads environment variables using Pydantic Settings with support
for local defaults and Cloud SQL / Cloud Run production environments.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration loaded from environment variables.
    """

    # Project metadata
    PROJECT_NAME: str = "DevSync Upskilling Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database configuration (Defaults to local SQLite if Cloud SQL PostgreSQL is not set)
    DATABASE_URL: str = "sqlite:///./devsync.db"

    # CORS settings for frontend communication
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.run.app",
    ]

    # Make.com Workflow Automation Webhook URL (for WhatsApp Nudge Triggers)
    MAKE_WEBHOOK_URL: str = (
        "https://hook.eu1.make.com/mock-devsync-daily-nudge-webhook"
    )

    # WhatsApp Business API (WATI) Integration Settings
    WATI_API_ENDPOINT: str = "https://live-server-wati.wati.io/api/v1"
    WATI_ACCESS_TOKEN: str = "mock_wati_bearer_token"

    # Razorpay Payment Gateway Credentials
    RAZORPAY_KEY_ID: str = "rzp_test_sample_key_id"
    RAZORPAY_KEY_SECRET: str = "sample_razorpay_secret_key"
    RAZORPAY_WEBHOOK_SECRET: str = "sample_webhook_secret_verification"

    # OpenAI / LLM Configuration for In-Flow AI Tutor
    AI_TUTOR_API_KEY: str = "mock_openai_api_key"
    AI_TUTOR_MODEL: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Global singleton instance of application settings
settings = Settings()
