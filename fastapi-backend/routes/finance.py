from fastapi import APIRouter, Depends, HTTPException, status
from db.mongodb import get_database
from schemas.schemas import ExpenseCreate, ExpenseResponse, PortfolioResponse, InvestmentCreate, AIRecommendation
from core.deps import get_current_user
from typing import List
from datetime import datetime
from bson import ObjectId
import traceback
from fastapi.responses import StreamingResponse
from utils.pdf_generator import generate_financial_report
from routes.assets import get_stats # Reuse existing stats logic

router = APIRouter()

@router.post("/expenses", response_model=ExpenseResponse)
async def log_expense(expense_in: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        expense_dict = expense_in.dict()
        expense_dict["user_id"] = str(current_user["_id"])
        
        result = await db.expenses.insert_one(expense_dict)
        expense_dict["_id"] = str(result.inserted_id)
        
        return expense_dict
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to log expense")

@router.get("/portfolio", response_model=PortfolioResponse)
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        now = datetime.utcnow()
        month = now.month
        year = now.year
        
        # Aggregate expenses for current month
        start_date = datetime(year, month, 1)
        # Simple aggregation
        pipeline = [
            {"$match": {
                "user_id": str(current_user["_id"]),
                "date": {"$gte": start_date}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        expense_result = await db.expenses.aggregate(pipeline).to_list(1)
        total_expenses = float(expense_result[0]["total"]) if expense_result else 0.0
        
        # Get user income (defaulting to 5000 for demo if not set)
        income = float(current_user.get("monthly_income", 5000.0))
        
        # Get investments
        investments = await db.investments.find({
            "user_id": str(current_user["_id"]),
            "date": {"$gte": start_date}
        }).to_list(100)
        
        cleaned_investments = []
        for inv in investments:
            inv["_id"] = str(inv["_id"])
            cleaned_investments.append(inv)
        
        return {
            "month": month,
            "year": year,
            "total_income": income,
            "total_expenses": total_expenses,
            "remaining_money": income - total_expenses,
            "investments": cleaned_investments
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch portfolio")

@router.post("/invest", response_model=dict)
async def make_investment(invest_in: InvestmentCreate, current_user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        invest_dict = invest_in.dict()
        invest_dict["user_id"] = str(current_user["_id"])
        
        result = await db.investments.insert_one(invest_dict)
        return {"message": "Investment logged", "id": str(result.inserted_id)}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to record investment")

@router.get("/recommendations", response_model=List[AIRecommendation])
async def get_ai_recommendations(current_user: dict = Depends(get_current_user)):
    risk = current_user.get("risk_profile", "medium").lower()
    
    # Mock AI Engine logic based on risk
    recommendations = []
    
    if risk == "high":
        recommendations.append({
            "title": "Crypto Surge Alpha",
            "description": "Bitcoin and Ethereum are showing strong momentum. Allocate 30% of remaining funds.",
            "suggested_investments": ["Bitcoin", "Ethereum", "Solana"],
            "confidence_score": 0.85
        })
        recommendations.append({
            "title": "Tech Growth Play",
            "description": "High-risk AI startups and tech stocks are undervalued.",
            "suggested_investments": ["NVIDIA", "Tesla", "OpenAI Index"],
            "confidence_score": 0.78
        })
    elif risk == "medium":
        recommendations.append({
            "title": "Balanced Diversifier",
            "description": "Mix of index funds and precious metals.",
            "suggested_investments": ["S&P 500 ETF", "Gold", "Corporate Bonds"],
            "confidence_score": 0.92
        })
        recommendations.append({
            "title": "Dividend Strategy",
            "description": "Stable returns from high-yield dividend stocks.",
            "suggested_investments": ["Real Estate Trusts", "Utilities"],
            "confidence_score": 0.88
        })
    else: # Low Risk
        recommendations.append({
            "title": "Safety First",
            "description": "Preserve capital with government-backed securities.",
            "suggested_investments": ["Treasury Bills", "Fixed Deposits", "Physical Gold"],
            "confidence_score": 0.98
        })
    
    return recommendations

@router.get("/report")
async def get_financial_report(current_user: dict = Depends(get_current_user)):
    try:
        from routes.assets import get_stats
        # 1. Get Portfolio Data
        portfolio_data = await get_portfolio(current_user)
        # 2. Get AI Recommendations
        recommendations = await get_ai_recommendations(current_user)
        # 3. Get Asset Stats (Overdue, Total Value, etc.)
        assets_summary = await get_stats(current_user)
        # 4. Generate PDF
        pdf_buffer = generate_financial_report(current_user, portfolio_data, recommendations, assets_summary)
        
        filename = f"Report_{datetime.now().strftime('%Y_%m')}.pdf"
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to generate report")
