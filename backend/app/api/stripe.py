"""
Stripe API - Pagamentos e Assinaturas
"""
from typing import Any, Dict, Optional
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, HttpUrl
from stripe.error import SignatureVerificationError, InvalidRequestError
from supabase import create_client
import stripe
import os
from app.config import settings

router = APIRouter(prefix="/api/stripe", tags=["stripe"])

# Configurar Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY
webhook_secret = settings.STRIPE_WEBHOOK_SECRET
supabase_service_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
supabase_admin = create_client(settings.SUPABASE_URL, supabase_service_key) if settings.SUPABASE_URL and supabase_service_key else None


class CheckoutSessionRequest(BaseModel):
    price_id: str
    success_url: Optional[HttpUrl] = None
    cancel_url: Optional[HttpUrl] = None
    metadata: Optional[Dict[str, Any]] = None

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Webhook para eventos do Stripe
    - checkout.session.completed
    - invoice.payment_succeeded
    - customer.subscription.updated
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Webhook signature verification failed")

    # Processar evento
    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        # Pagamento aprovado - ativar assinatura/acesso
        await handle_checkout_completed(session)

    elif event_type == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        # Pagamento recorrente bem-sucedido

    elif event_type == "customer.subscription.updated":
        subscription = event["data"]["object"]
        # Atualizar status da assinatura

    return {"status": "success"}

@router.post("/create-checkout-session")
async def create_checkout_session(payload: CheckoutSessionRequest):
    """
    Criar sessão de checkout do Stripe
    """
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="STRIPE_SECRET_KEY não configurada")

    metadata = payload.metadata or {}
    success_url = str(payload.success_url or f"{settings.FRONTEND_URL}?checkout=success&session_id={{CHECKOUT_SESSION_ID}}")
    cancel_url = str(payload.cancel_url or f"{settings.FRONTEND_URL}?checkout=cancel")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": payload.price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata,
            subscription_data={"metadata": metadata},
        )
        return {"session_id": session.id, "url": session.url}
    except InvalidRequestError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-payment-intent")
async def create_payment_intent(
    amount: int,  # em centavos (ex: 15000 = R$ 150,00)
    currency: str = "brl",
    clinic_id: str = None
):
    """
    Criar PaymentIntent para pagamento único
    Com split de pagamento (Stripe Connect)
    """
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            application_fee_amount=int(amount * 0.10),  # 10% para Axos
            transfer_data={"destination": clinic_id} if clinic_id else None,
        )
        return {"client_secret": payment_intent.client_secret}
    except InvalidRequestError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/prices")
async def get_prices():
    """
    Retorna os preços configurados
    """
    return {
        "starter": os.getenv("STRIPE_PRICE_STARTER"),
        "professional": os.getenv("STRIPE_PRICE_PROFESSIONAL"),
        "enterprise": os.getenv("STRIPE_PRICE_ENTERPRISE"),
    }

# Handlers
async def handle_checkout_completed(session: dict):
    """
    Processar checkout completado
    - customer_id: ID do cliente no Stripe
    - subscription_id: ID da assinatura
    - metadata: dados personalizados
    """
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")
    metadata = session.get("metadata", {})

    clinic_id = metadata.get("clinic_id")
    user_email = metadata.get("user_email")
    plan_name = metadata.get("plan_name")
    plan_price = metadata.get("plan_price")

    if not supabase_admin or not clinic_id:
        return

    # Ativar assinatura pendente para clínica
    supabase_admin.table("subscriptions").update({
        "status": "active",
        "stripe_subscription_id": subscription_id,
        "stripe_customer_id": customer_id
    }).eq("clinic_id", clinic_id).execute()

    # Marcar onboarding concluído
    supabase_admin.table("clinics").update({
        "onboarding_completed": True
    }).eq("id", clinic_id).execute()

    # Registrar log de envio de e-mail (se a tabela existir)
    if user_email:
        try:
            supabase_admin.table("email_logs").insert({
                "clinic_id": clinic_id,
                "to_email": user_email,
                "from_email": "axoshub.solara@gmail.com",
                "subject": f"Assinatura ativada - Plano {plan_name or 'Solara Connect'}",
                "template": "welcome",
                "status": "sent",
                "metadata": {
                    "plan": plan_name,
                    "price": plan_price,
                    "stripe_subscription_id": subscription_id
                }
            }).execute()
        except Exception:
            pass
