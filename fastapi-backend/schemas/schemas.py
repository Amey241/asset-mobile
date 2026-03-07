from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

from typing import Annotated
from pydantic import BeforeValidator

PyObjectId = Annotated[str, BeforeValidator(str)]

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "staff"
    risk_profile: str = "medium" # high, medium, low
    monthly_income: float = 0.0

class UserCreate(UserBase):
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    risk_profile: Optional[str] = None
    monthly_income: Optional[float] = None

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Financial Schemas ---

class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: datetime = Field(default_factory=datetime.utcnow)

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

class InvestmentBase(BaseModel):
    type: str # crypto, gold, stocks, bonds
    amount: float
    risk_level: str
    date: datetime = Field(default_factory=datetime.utcnow)

class InvestmentCreate(InvestmentBase):
    pass

class PortfolioResponse(BaseModel):
    month: int
    year: int
    total_income: float
    total_expenses: float
    remaining_money: float
    investments: List[InvestmentBase] = []
    
class AIRecommendation(BaseModel):
    title: str
    description: str
    suggested_investments: List[str]
    confidence_score: float

# --- Asset Schemas (Original) ---

class AssetBase(BaseModel):
    assetCode: str
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    purchaseDate: Optional[datetime] = None
    purchasePrice: float = 0.0
    currentValue: float = 0.0
    conditionStatus: str = "good" 
    status: str = "available"
    dueDate: Optional[datetime] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    assetCode: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    conditionStatus: Optional[str] = None
    purchasePrice: Optional[float] = None
    currentValue: Optional[float] = None
    assignedTo: Optional[str] = None
    dueDate: Optional[datetime] = None

class AssetLogBase(BaseModel):
    asset_id: str
    action: str
    message: str
    user_id: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class DashboardStats(BaseModel):
    total: int
    available: int
    assigned: int
    maintenance: int
    overdue: int = 0
    totalValue: float = 0.0
    categoryData: dict = {}
