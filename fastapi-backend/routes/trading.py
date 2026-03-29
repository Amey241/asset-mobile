from fastapi import APIRouter, Depends, HTTPException, status
import httpx
from datetime import datetime
from bson import ObjectId
from db.mongodb import get_database
from core.deps import get_current_user
from schemas.schemas import UserResponse, TransactionCreate, MarketOrder, InvestmentCreate

router = APIRouter()

# 1. Wallet Deposit Endpoint
@router.post("/wallet/deposit", summary="Deposit fiat into wallet")
async def deposit_funds(amount: float, current_user: UserResponse = Depends(get_current_user)):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Deposit amount must be positive")
    
    db = await get_database()
    
    # Update wallet balance
    new_balance = current_user.wallet_balance + amount
    await db["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$inc": {"wallet_balance": amount}}
    )
    
    # Write to Transaction Ledger
    transaction_doc = {
        "user_id": current_user.id,
        "type": "deposit",
        "asset_class": "fiat",
        "symbol": "USD", # Or INR depending on base currency
        "amount": amount,
        "price_at_execution": 1.0,
        "timestamp": datetime.utcnow()
    }
    await db["transactions"].insert_one(transaction_doc)
    
    return {"message": "Deposit successful", "new_balance": new_balance}

# 2. Market Order Endpoint (Simulated Live Trading)
@router.post("/order", summary="Execute a Market Order")
async def execute_market_order(order: MarketOrder, current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    
    # Refresh user to get latest wallet balance securely
    user_doc = await db["users"].find_one({"_id": ObjectId(current_user.id)})
    current_balance = user_doc.get("wallet_balance", 0.0)
    
    if order.side.lower() == "buy":
        if current_balance < order.amount_usd:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
            
        # Simulate fetching live price (Using CoinGecko API for Crypto)
        live_price = 0.0
        try:
            # We assume order.symbol is a CoinGecko ID e.g., 'bitcoin' for crypto
            if order.asset_class.lower() == 'crypto':
                async with httpx.AsyncClient() as client:
                    resp = await client.get(f"https://api.coingecko.com/api/v3/simple/price?ids={order.symbol.lower()}&vs_currencies=usd")
                    data = resp.json()
                    live_price = data.get(order.symbol.lower(), {}).get('usd', 0)
            elif order.asset_class.lower() == 'stocks':
                # Simulated Stock Price for Demo purposes
                live_price = 150.0 
                
            if live_price <= 0:
                raise ValueError("Pricing API returned invalid price")
                
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Failed to fetch market price for {order.symbol}: {str(e)}")
            
        # Execute Fractional Buy
        fractional_amount_purchased = order.amount_usd / live_price
        
        # ACID-like transaction (Two-step update for MVP)
        # 1. Deduct Balance
        new_balance = current_balance - order.amount_usd
        await db["users"].update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"wallet_balance": new_balance}}
        )
        
        # 2. Log Transaction Ledger
        transaction_doc = {
            "user_id": current_user.id,
            "type": "buy",
            "asset_class": order.asset_class,
            "symbol": order.symbol,
            "amount": fractional_amount_purchased,
            "price_at_execution": live_price,
            "timestamp": datetime.utcnow()
        }
        await db["transactions"].insert_one(transaction_doc)
        
        # 3. Add to User Investments Portfolio
        investment_doc = {
            "user_id": current_user.id,
            "type": order.asset_class.capitalize(),
            "symbol": order.symbol,
            "fractional_amount": fractional_amount_purchased,
            "amount_invested_usd": order.amount_usd,
            "risk_level": "High" if order.asset_class == 'crypto' else "Medium",
            "date": datetime.utcnow()
        }
        await db["investments"].insert_one(investment_doc)
        
        return {
            "message": f"Successfully purchased {fractional_amount_purchased:.6f} {order.symbol.upper()}",
            "execution_price": live_price,
            "remaining_balance": new_balance
        }
        
    else:
        # Sell logic would involve checking if they own the asset, then crediting wallet_balance
        raise HTTPException(status_code=501, detail="Sell orders are mathematically complex and not yet implemented in MVP")
