"""create notifications table

Revision ID: 20260628_0001
Revises:
Create Date: 2026-06-28
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "20260628_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


notification_type_enum = sa.Enum(
    "transaction_confirmation",
    "request",
    "alert",
    "otp",
    "high_value_event",
    "kyc_update",
    "system",
    name="notification_type",
)


def upgrade() -> None:
    notification_type_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", notification_type_enum, nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
    )

    op.create_index(
        "ix_notifications_user_id_read",
        "notifications",
        ["user_id", "read"],
    )


def downgrade() -> None:
    op.drop_index("ix_notifications_user_id_read", table_name="notifications")
    op.drop_table("notifications")
    notification_type_enum.drop(op.get_bind(), checkfirst=True)