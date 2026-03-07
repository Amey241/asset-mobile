from fastapi import APIRouter, Depends, HTTPException, status
import traceback
from db.mongodb import get_database
from schemas.schemas import AssetCreate, AssetUpdate, AssetLogBase, DashboardStats
from core.deps import get_current_user, check_admin
from typing import List
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def clean_doc(doc):
    if not doc:
        return doc
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/activity", response_model=List[dict])
async def get_activity_log():
    try:
        db = get_database()
        cursor = db.asset_logs.find().sort("createdAt", -1).limit(20)
        logs = await cursor.to_list(20)
        for log in logs:
            log["_id"] = str(log["_id"])
            if log.get("asset_id"):
                aid = str(log["asset_id"])
                if ObjectId.is_valid(aid):
                    asset = await db.assets.find_one({"_id": ObjectId(aid)}, {"name": 1, "assetCode": 1})
                    log["asset"] = clean_doc(asset)
            if log.get("user_id"):
                uid = str(log["user_id"])
                if ObjectId.is_valid(uid):
                    user = await db.users.find_one({"_id": ObjectId(uid)}, {"name": 1})
                    log["user"] = clean_doc(user)
        return logs
    except Exception as e:
        traceback.print_exc()
        return []

@router.get("/stats", response_model=DashboardStats)
async def get_stats(current_user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        total = await db.assets.count_documents({})
        available = await db.assets.count_documents({"status": "available"})
        assigned = await db.assets.count_documents({"status": "assigned"})
        maintenance = await db.assets.count_documents({"status": "maintenance"})
        
        # Calculate overdue assets
        overdue = await db.assets.count_documents({
            "status": "assigned",
            "dueDate": {"$lt": datetime.utcnow()}
        })
        
        # Calculate Total Value using aggregation
        pipeline = [
            {"$group": {"_id": None, "total": {"$sum": "$currentValue"}}}
        ]
        result = await db.assets.aggregate(pipeline).to_list(1)
        total_value = 0.0
        if result and result[0].get("total") is not None:
            total_value = float(result[0]["total"])
        
        # Group by category for chart
        category_pipeline = [
            {"$group": {"_id": "$category", "total": {"$sum": "$currentValue"}}}
        ]
        category_results = await db.assets.aggregate(category_pipeline).to_list(20)
        category_data = {res["_id"] or "Other": float(res["total"]) for res in category_results}

        return {
            "total": total,
            "available": available,
            "assigned": assigned,
            "maintenance": maintenance,
            "overdue": overdue,
            "totalValue": total_value,
            "categoryData": category_data
        }
    except Exception as e:
        print("--- STATS ERROR ---")
        traceback.print_exc()
        return {
            "total": 0,
            "available": 0,
            "assigned": 0,
            "maintenance": 0,
            "overdue": 0,
            "totalValue": 0.0,
            "categoryData": {}
        }

@router.get("/", response_model=List[dict])
async def get_assets():
    try:
        db = get_database()
        cursor = db.assets.find()
        assets = await cursor.to_list(100)
        for asset in assets:
            asset["_id"] = str(asset["_id"])
            
            # Calculate Depreciation (Value over time)
            if asset.get("purchasePrice") and asset.get("purchaseDate"):
                try:
                    purchase_date = asset["purchaseDate"]
                    if isinstance(purchase_date, str):
                        purchase_date = datetime.fromisoformat(purchase_date.replace("Z", ""))
                    
                    years_old = (datetime.utcnow() - purchase_date).days / 365.25
                    rate = 0.20 if asset.get("category", "").upper() == "IT" else 0.10
                    current_val = asset["purchasePrice"] * (1 - (rate * max(0, years_old)))
                    asset["currentValue"] = max(0, round(current_val, 2))
                except Exception as e:
                    print(f"Depreciation error: {e}")

            if asset.get("assignedTo"):
                try:
                    assigned_to_id = str(asset["assignedTo"])
                    if ObjectId.is_valid(assigned_to_id):
                        user = await db.users.find_one({"_id": ObjectId(assigned_to_id)}, {"password": 0})
                        if user:
                            asset["assignedTo"] = clean_doc(user)
                        else:
                            asset["assignedTo"] = None
                    else:
                        asset["assignedTo"] = None
                except Exception as assigned_err:
                    print(f"Assignment fetch error: {assigned_err}")
                    asset["assignedTo"] = None
            
            if asset.get("dueDate"):
                asset["dueDate"] = str(asset["dueDate"])
        return assets
    except Exception as e:
        print("--- ASSETS ERROR ---")
        traceback.print_exc()
        return []

@router.post("/", response_model=dict)
async def create_asset(asset_in: AssetCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    asset_exists = await db.assets.find_one({"assetCode": asset_in.assetCode})
    if asset_exists:
        raise HTTPException(status_code=400, detail="Asset Code already exists")
    
    asset_dict = asset_in.dict()
    # Initialize currentValue to purchasePrice
    asset_dict["currentValue"] = asset_dict.get("purchasePrice", 0.0)
    
    result = await db.assets.insert_one(asset_dict)
    asset_dict["_id"] = str(result.inserted_id)
    
    # Log creation
    await db.asset_logs.insert_one({
        "asset_id": asset_dict["_id"],
        "action": "create",
        "message": f"Asset created: {asset_in.name}",
        "user_id": str(current_user["_id"]),
        "createdAt": datetime.utcnow()
    })
    
    return asset_dict

@router.patch("/{asset_id}", response_model=dict)
async def update_asset(asset_id: str, asset_in: AssetUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid Asset ID")
        
    asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    update_data = asset_in.dict(exclude_unset=True)
    if not update_data:
        asset["_id"] = str(asset["_id"])
        return asset
    
    # Log if status changed
    if "status" in update_data and update_data["status"] != asset.get("status"):
        await db.asset_logs.insert_one({
            "asset_id": asset_id,
            "action": "update",
            "message": f"Status changed from {asset.get('status')} to {update_data['status']}",
            "user_id": str(current_user["_id"]),
            "createdAt": datetime.utcnow()
        })
    elif "assignedTo" in update_data and update_data["assignedTo"] != str(asset.get("assignedTo")):
         await db.asset_logs.insert_one({
            "asset_id": asset_id,
            "action": "assign",
            "message": f"Asset assigned/reassigned",
            "user_id": str(current_user["_id"]),
            "createdAt": datetime.utcnow()
        })
    else:
        await db.asset_logs.insert_one({
            "asset_id": asset_id,
            "action": "update",
            "message": "Asset details updated",
            "user_id": str(current_user["_id"]),
            "createdAt": datetime.utcnow()
        })

    if "assignedTo" in update_data:
        at_id = str(update_data["assignedTo"])
        if ObjectId.is_valid(at_id):
            update_data["assignedTo"] = ObjectId(at_id)
        else:
            del update_data["assignedTo"]

    await db.assets.update_one({"_id": ObjectId(asset_id)}, {"$set": update_data})
    updated_asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    updated_asset["_id"] = str(updated_asset["_id"])
    return updated_asset

@router.get("/code/{code}", response_model=dict)
async def get_asset_by_code(code: str):
    try:
        db = get_database()
        asset = await db.assets.find_one({"assetCode": code})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        asset["_id"] = str(asset["_id"])
        return asset
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch asset by code")

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, current_user: dict = Depends(check_admin)):
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid Asset ID")
    db = get_database()
    result = await db.assets.delete_one({"_id": ObjectId(asset_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"message": "Asset removed"}

@router.get("/{asset_id}", response_model=dict)
async def get_asset(asset_id: str):
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid Asset ID")
    try:
        db = get_database()
        asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
            
        asset["_id"] = str(asset["_id"])
        
        # Hydrate user
        if asset.get("assignedTo"):
            uid = str(asset["assignedTo"])
            if ObjectId.is_valid(uid):
                user = await db.users.find_one({"_id": ObjectId(uid)}, {"password": 0})
                asset["assignedTo"] = clean_doc(user)
        
        # Convert date to string
        if asset.get("dueDate"):
            asset["dueDate"] = str(asset["dueDate"])
            
        return asset
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch asset")


@router.get("/{asset_id}/history", response_model=List[dict])
async def get_asset_activity(asset_id: str):
    try:
        db = get_database()
        if not ObjectId.is_valid(asset_id):
            raise HTTPException(status_code=400, detail="Invalid Asset ID")
            
        cursor = db.asset_logs.find({"asset_id": asset_id}).sort("createdAt", -1)
        logs = await cursor.to_list(50)
        for log in logs:
            log["_id"] = str(log["_id"])
            if log.get("user_id"):
                uid = str(log["user_id"])
                if ObjectId.is_valid(uid):
                    user = await db.users.find_one({"_id": ObjectId(uid)}, {"name": 1})
                    log["user"] = clean_doc(user)
        return logs
    except Exception as e:
        traceback.print_exc()
        return []
