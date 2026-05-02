"""
Stripe API - Pagamentos e Assinaturas
"""
from fastapi import APIRouter, Request, HTTPException
from stripe.error import SignatureVerificationError, InvalidRequestError
import stripe
import os

router = APIRouter(prefix="/api/stripe", tags=["stripe"])

# Configurar Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

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
async def create_checkout_session(
    price_id: str,
    success_url: str,
    cancel_url: str,
    metadata: dict = None
):
    """
    Criar sessão de checkout do Stripe
    """
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card", "bole"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",  # ou "payment"
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata or {},
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

    # TODO: Ativar acesso ao sistema
    # TODO: Enviar email de confirmação
    # TODO: Criar fatura
    pass
