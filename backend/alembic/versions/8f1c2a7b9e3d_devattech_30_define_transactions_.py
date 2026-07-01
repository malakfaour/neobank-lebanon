"""DEVATTECH-30 define transactions schema

Revision ID: 8f1c2a7b9e3d
Revises: 32d66a99546f
Create Date: 2026-07-01 00:00:00.000000

down_revision is set to 32d66a99546f (users/kyc_records/exchange_rates),
the direct dependency for the sender_id/receiver_id FKs. This branch is
NOT chained onto ea72ef17415c (wallets), since transactions has no real
dependency on wallets. This will produce multiple Alembic heads alongside
the wallet chain until reconciled with a single `alembic merge heads`
when feature branches converge on develop — that's expected here.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f1c2a7b9e3d'
down_revision: Union[str, Sequence[str], None] = '32d66a99546f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('transactions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('sender_id', sa.Integer(), nullable=False),
    sa.Column('receiver_id', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Numeric(precision=18, scale=4), nullable=False),
    sa.Column('currency', sa.Enum('USD', 'LBP', 'USDT', name='transactioncurrency'), nullable=False),
    sa.Column('category', sa.String(length=50), nullable=True),
    sa.Column('fraud_score', sa.Float(), nullable=True),
    sa.Column('status', sa.Enum('pending', 'completed', 'failed', 'flagged', 'reversed', name='transactionstatus'), nullable=False),
    sa.Column('idempotency_key', sa.String(length=100), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['receiver_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'], unique=False)
    op.create_index(op.f('ix_transactions_sender_id'), 'transactions', ['sender_id'], unique=False)
    op.create_index(op.f('ix_transactions_receiver_id'), 'transactions', ['receiver_id'], unique=False)
    op.create_index(op.f('ix_transactions_idempotency_key'), 'transactions', ['idempotency_key'], unique=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_transactions_idempotency_key'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_receiver_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_sender_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
    op.drop_table('transactions')
    sa.Enum(name='transactionstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='transactioncurrency').drop(op.get_bind(), checkfirst=True)
    # ### end Alembic commands ###
