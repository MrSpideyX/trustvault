from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import razorpay
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay client
razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'gaming-hub-secret-key-2024')
JWT_ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    created_at: datetime

class ProductCreate(BaseModel):
    name: str
    description: str
    platform: str  # Steam, Epic, etc.
    game_title: str
    price_inr: float
    price_usd: float
    stock: int = 0
    image_url: Optional[str] = None
    category: str = "Game Account"
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    platform: Optional[str] = None
    game_title: Optional[str] = None
    price_inr: Optional[float] = None
    price_usd: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    featured: Optional[bool] = None

class Product(BaseModel):
    product_id: str
    name: str
    description: str
    platform: str
    game_title: str
    price_inr: float
    price_usd: float
    stock: int
    image_url: Optional[str]
    category: str
    featured: bool
    avg_rating: float = 0.0
    review_count: int = 0
    created_at: datetime

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class ReviewCreate(BaseModel):
    product_id: str
    rating: int  # 1-5
    comment: str

class DiscountCodeCreate(BaseModel):
    code: str
    discount_percent: float
    max_uses: int = 100
    expires_at: Optional[datetime] = None

class OrderCreate(BaseModel):
    currency: str = "INR"  # INR or USD
    discount_code: Optional[str] = None

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, is_admin: bool = False) -> str:
    payload = {
        "user_id": user_id,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user:
                    return user
    
    # Check JWT token
    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
            return user
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    return None

async def require_auth(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await get_current_user(request, credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await require_auth(request, credentials)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "is_admin": False,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    
    return {"token": token, "user": {"user_id": user_id, "email": data.email, "name": data.name, "is_admin": False}}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"], user.get("is_admin", False))
    return {"token": token, "user": {"user_id": user["user_id"], "email": user["email"], "name": user["name"], "is_admin": user.get("is_admin", False)}}

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id with Emergent Auth
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        auth_data = resp.json()
    
    # Find or create user
    user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
    else:
        user_id = user["user_id"]
        # Update picture if changed
        await db.users.update_one({"user_id": user_id}, {"$set": {"picture": auth_data.get("picture")}})
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"user_id": user_id, "email": auth_data["email"], "name": auth_data["name"], "is_admin": user.get("is_admin", False)}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(require_auth)):
    return {"user_id": user["user_id"], "email": user["email"], "name": user["name"], "picture": user.get("picture"), "is_admin": user.get("is_admin", False)}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== PRODUCTS ROUTES ====================

@api_router.get("/products")
async def get_products(featured: Optional[bool] = None, category: Optional[str] = None, platform: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if featured is not None:
        query["featured"] = featured
    if category:
        query["category"] = category
    if platform:
        query["platform"] = platform
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"game_title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", dependencies=[Depends(require_admin)])
async def create_product(data: ProductCreate):
    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    product_doc = {
        "product_id": product_id,
        **data.model_dump(),
        "avg_rating": 0.0,
        "review_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    return {"product_id": product_id, **data.model_dump()}

@api_router.put("/products/{product_id}", dependencies=[Depends(require_admin)])
async def update_product(product_id: str, data: ProductUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.products.update_one({"product_id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    return product

@api_router.delete("/products/{product_id}", dependencies=[Depends(require_admin)])
async def delete_product(product_id: str):
    result = await db.products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ==================== CART ROUTES ====================

@api_router.get("/cart")
async def get_cart(user: dict = Depends(require_auth)):
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not cart:
        return {"items": [], "total_inr": 0, "total_usd": 0}
    
    # Populate product details
    items_with_details = []
    total_inr = 0
    total_usd = 0
    
    for item in cart.get("items", []):
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            items_with_details.append({
                **item,
                "product": product
            })
            total_inr += product["price_inr"] * item["quantity"]
            total_usd += product["price_usd"] * item["quantity"]
    
    return {"items": items_with_details, "total_inr": total_inr, "total_usd": total_usd}

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, user: dict = Depends(require_auth)):
    product = await db.products.find_one({"product_id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["stock"] < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    cart = await db.carts.find_one({"user_id": user["user_id"]})
    if not cart:
        await db.carts.insert_one({
            "user_id": user["user_id"],
            "items": [{"product_id": item.product_id, "quantity": item.quantity}]
        })
    else:
        # Check if product already in cart
        existing = next((i for i in cart["items"] if i["product_id"] == item.product_id), None)
        if existing:
            existing["quantity"] += item.quantity
            await db.carts.update_one({"user_id": user["user_id"]}, {"$set": {"items": cart["items"]}})
        else:
            await db.carts.update_one(
                {"user_id": user["user_id"]},
                {"$push": {"items": {"product_id": item.product_id, "quantity": item.quantity}}}
            )
    
    return {"message": "Added to cart"}

@api_router.post("/cart/remove")
async def remove_from_cart(item: CartItem, user: dict = Depends(require_auth)):
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$pull": {"items": {"product_id": item.product_id}}}
    )
    return {"message": "Removed from cart"}

@api_router.post("/cart/update")
async def update_cart_item(item: CartItem, user: dict = Depends(require_auth)):
    if item.quantity <= 0:
        return await remove_from_cart(item, user)
    
    product = await db.products.find_one({"product_id": item.product_id}, {"_id": 0})
    if product and product["stock"] < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    await db.carts.update_one(
        {"user_id": user["user_id"], "items.product_id": item.product_id},
        {"$set": {"items.$.quantity": item.quantity}}
    )
    return {"message": "Cart updated"}

@api_router.delete("/cart/clear")
async def clear_cart(user: dict = Depends(require_auth)):
    await db.carts.delete_one({"user_id": user["user_id"]})
    return {"message": "Cart cleared"}

# ==================== WISHLIST ROUTES ====================

@api_router.get("/wishlist")
async def get_wishlist(user: dict = Depends(require_auth)):
    wishlist = await db.wishlists.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not wishlist:
        return {"items": []}
    
    items_with_details = []
    for product_id in wishlist.get("items", []):
        product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
        if product:
            items_with_details.append(product)
    
    return {"items": items_with_details}

@api_router.post("/wishlist/add/{product_id}")
async def add_to_wishlist(product_id: str, user: dict = Depends(require_auth)):
    product = await db.products.find_one({"product_id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.wishlists.update_one(
        {"user_id": user["user_id"]},
        {"$addToSet": {"items": product_id}},
        upsert=True
    )
    return {"message": "Added to wishlist"}

@api_router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(product_id: str, user: dict = Depends(require_auth)):
    await db.wishlists.update_one(
        {"user_id": user["user_id"]},
        {"$pull": {"items": product_id}}
    )
    return {"message": "Removed from wishlist"}

# ==================== REVIEWS ROUTES ====================

@api_router.get("/reviews/{product_id}")
async def get_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(100)
    return reviews

@api_router.post("/reviews")
async def create_review(data: ReviewCreate, user: dict = Depends(require_auth)):
    # Check if user purchased this product
    order = await db.orders.find_one({
        "user_id": user["user_id"],
        "items.product_id": data.product_id,
        "status": "completed"
    })
    if not order:
        raise HTTPException(status_code=400, detail="You must purchase this product to review it")
    
    # Check if already reviewed
    existing = await db.reviews.find_one({"user_id": user["user_id"], "product_id": data.product_id})
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this product")
    
    review_id = f"rev_{uuid.uuid4().hex[:12]}"
    review_doc = {
        "review_id": review_id,
        "user_id": user["user_id"],
        "user_name": user["name"],
        "product_id": data.product_id,
        "rating": max(1, min(5, data.rating)),
        "comment": data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review_doc)
    
    # Update product avg rating
    reviews = await db.reviews.find({"product_id": data.product_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.products.update_one(
        {"product_id": data.product_id},
        {"$set": {"avg_rating": round(avg_rating, 1), "review_count": len(reviews)}}
    )
    
    return review_doc

# ==================== DISCOUNT CODES ROUTES ====================

@api_router.get("/discounts", dependencies=[Depends(require_admin)])
async def get_discounts():
    discounts = await db.discounts.find({}, {"_id": 0}).to_list(100)
    return discounts

@api_router.post("/discounts", dependencies=[Depends(require_admin)])
async def create_discount(data: DiscountCodeCreate):
    existing = await db.discounts.find_one({"code": data.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")
    
    discount_doc = {
        "code": data.code.upper(),
        "discount_percent": min(100, max(0, data.discount_percent)),
        "max_uses": data.max_uses,
        "current_uses": 0,
        "expires_at": data.expires_at.isoformat() if data.expires_at else None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.discounts.insert_one(discount_doc)
    return discount_doc

@api_router.delete("/discounts/{code}", dependencies=[Depends(require_admin)])
async def delete_discount(code: str):
    result = await db.discounts.delete_one({"code": code.upper()})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Discount code not found")
    return {"message": "Discount deleted"}

@api_router.post("/discounts/validate")
async def validate_discount(request: Request, user: dict = Depends(require_auth)):
    body = await request.json()
    code = body.get("code", "").upper()
    
    discount = await db.discounts.find_one({"code": code}, {"_id": 0})
    if not discount:
        raise HTTPException(status_code=404, detail="Invalid discount code")
    
    if discount["current_uses"] >= discount["max_uses"]:
        raise HTTPException(status_code=400, detail="Discount code usage limit reached")
    
    if discount.get("expires_at"):
        expires = datetime.fromisoformat(discount["expires_at"])
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Discount code expired")
    
    return {"valid": True, "discount_percent": discount["discount_percent"]}

# ==================== ORDERS & PAYMENT ROUTES ====================

@api_router.post("/orders/create")
async def create_order(data: OrderCreate, user: dict = Depends(require_auth)):
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total
    items = []
    total = 0
    
    for cart_item in cart["items"]:
        product = await db.products.find_one({"product_id": cart_item["product_id"]}, {"_id": 0})
        if not product:
            continue
        if product["stock"] < cart_item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        price = product["price_inr"] if data.currency == "INR" else product["price_usd"]
        items.append({
            "product_id": product["product_id"],
            "name": product["name"],
            "quantity": cart_item["quantity"],
            "price": price
        })
        total += price * cart_item["quantity"]
    
    # Apply discount
    discount_amount = 0
    if data.discount_code:
        discount = await db.discounts.find_one({"code": data.discount_code.upper()}, {"_id": 0})
        if discount and discount["current_uses"] < discount["max_uses"]:
            discount_amount = total * (discount["discount_percent"] / 100)
            total -= discount_amount
    
    # Create Razorpay order
    amount_in_paise = int(total * 100)  # Convert to smallest currency unit
    
    try:
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": data.currency,
            "payment_capture": 1,
            "receipt": f"order_{uuid.uuid4().hex[:8]}"
        })
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise HTTPException(status_code=500, detail="Payment gateway error")
    
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "user_id": user["user_id"],
        "user_email": user["email"],
        "items": items,
        "currency": data.currency,
        "subtotal": total + discount_amount,
        "discount_code": data.discount_code,
        "discount_amount": discount_amount,
        "total": total,
        "razorpay_order_id": razorpay_order["id"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    
    return {
        "order_id": order_id,
        "razorpay_order_id": razorpay_order["id"],
        "amount": amount_in_paise,
        "currency": data.currency,
        "key_id": os.environ.get('RAZORPAY_KEY_ID')
    }

@api_router.post("/orders/verify")
async def verify_payment(request: Request, user: dict = Depends(require_auth)):
    body = await request.json()
    razorpay_order_id = body.get("razorpay_order_id")
    razorpay_payment_id = body.get("razorpay_payment_id")
    razorpay_signature = body.get("razorpay_signature")
    
    # Verify signature
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })
    except Exception as e:
        logger.error(f"Payment verification failed: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    # Update order status
    order = await db.orders.find_one({"razorpay_order_id": razorpay_order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one(
        {"razorpay_order_id": razorpay_order_id},
        {"$set": {
            "status": "completed",
            "razorpay_payment_id": razorpay_payment_id,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Reduce stock
    for item in order["items"]:
        await db.products.update_one(
            {"product_id": item["product_id"]},
            {"$inc": {"stock": -item["quantity"]}}
        )
    
    # Update discount usage
    if order.get("discount_code"):
        await db.discounts.update_one(
            {"code": order["discount_code"]},
            {"$inc": {"current_uses": 1}}
        )
    
    # Clear cart
    await db.carts.delete_one({"user_id": user["user_id"]})
    
    return {"message": "Payment verified", "order_id": order["order_id"]}

@api_router.get("/orders")
async def get_orders(user: dict = Depends(require_auth)):
    orders = await db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(require_auth)):
    order = await db.orders.find_one({"order_id": order_id, "user_id": user["user_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/orders", dependencies=[Depends(require_admin)])
async def admin_get_orders(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api_router.put("/admin/orders/{order_id}/status", dependencies=[Depends(require_admin)])
async def admin_update_order_status(order_id: str, request: Request):
    body = await request.json()
    new_status = body.get("status")
    
    result = await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": new_status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Status updated"}

@api_router.get("/admin/users", dependencies=[Depends(require_admin)])
async def admin_get_users():
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users

@api_router.put("/admin/users/{user_id}/admin", dependencies=[Depends(require_admin)])
async def admin_toggle_admin(user_id: str, request: Request):
    body = await request.json()
    is_admin = body.get("is_admin", False)
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"is_admin": is_admin}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Admin status updated"}

@api_router.get("/admin/stats", dependencies=[Depends(require_admin)])
async def admin_get_stats():
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    completed_orders = await db.orders.count_documents({"status": "completed"})
    total_users = await db.users.count_documents({})
    
    # Calculate revenue
    completed = await db.orders.find({"status": "completed"}, {"_id": 0}).to_list(1000)
    total_revenue_inr = sum(o["total"] for o in completed if o["currency"] == "INR")
    total_revenue_usd = sum(o["total"] for o in completed if o["currency"] == "USD")
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "total_users": total_users,
        "total_revenue_inr": total_revenue_inr,
        "total_revenue_usd": total_revenue_usd
    }

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Gaming Hub API"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
