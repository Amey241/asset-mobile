from fastapi import APIRouter, Depends, HTTPException, status
from db.mongodb import get_database
from core.security import verify_password, get_password_hash, create_access_token
from schemas.schemas import UserCreate, UserResponse, Token, LoginSchema, UserProfileUpdate
from core.deps import get_current_user
from typing import List
from bson import ObjectId

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(login_data: LoginSchema):
    db = get_database()
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"id": str(user["_id"]), "role": user.get("role", "staff")})
    user["_id"] = str(user["_id"])
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    try:
        db = get_database()
        user_exists = await db.users.find_one({"email": user_in.email})
        if user_exists:
            raise HTTPException(status_code=400, detail="User already exists")
        
        user_dict = user_in.model_dump()
        user_dict["password"] = get_password_hash(user_dict["password"])
        
        result = await db.users.insert_one(user_dict)
        inserted_id = str(result.inserted_id)
        
        return {
            "name": user_dict["name"],
            "email": user_dict["email"],
            "role": user_dict.get("role", "staff"),
            "_id": inserted_id
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

from core.deps import get_current_user, check_admin

@router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(check_admin)):
    db = get_database()
    users = await db.users.find().to_list(100)
    for u in users:
        u["_id"] = str(u["_id"])
    return users

@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user_role(user_id: str, role: str, current_user: dict = Depends(check_admin)):
    db = get_database()
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid User ID")
    
    result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(check_admin)):
    db = get_database()
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid User ID")
    
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

@router.patch("/profile", response_model=UserResponse)
async def update_profile(user_in: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = user_in.model_dump(exclude_unset=True)
    if not update_data:
        current_user["_id"] = str(current_user["_id"])
        return current_user
    
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_data})
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user
