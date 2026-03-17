#!/usr/bin/env python3

import requests
import json

# API endpoint
API_URL = "https://gaming-hub-471.preview.emergentagent.com/api"

def create_admin_and_products():
    """Create admin user and test products"""
    
    # 1. Register admin user
    print("🔧 Creating admin user...")
    admin_data = {
        "email": "admin@gamehub.com", 
        "password": "AdminPass123!",
        "name": "Admin User"
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/register", json=admin_data)
        if response.status_code == 200:
            admin_token = response.json()['token']
            admin_id = response.json()['user']['user_id']
            print(f"✅ Admin user created: {admin_id}")
        else:
            print(f"❌ Failed to create admin: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        return False

    # 2. Make user admin via MongoDB
    print("🔧 Making user admin...")
    import pymongo
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017")
        db = client["test_database"]
        result = db.users.update_one(
            {"user_id": admin_id}, 
            {"$set": {"is_admin": True}}
        )
        if result.modified_count > 0:
            print("✅ User promoted to admin")
        else:
            print("❌ Failed to promote user to admin")
            return False
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

    # 3. Create test products using admin token
    print("🔧 Creating test products...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    test_products = [
        {
            "name": "God of War Ragnarok Premium Account",
            "description": "Full game access with all DLCs and exclusive content. Includes Norse mythology storyline completion.",
            "platform": "Steam",
            "game_title": "God of War Ragnarok",
            "price_inr": 2999.00,
            "price_usd": 39.99,
            "stock": 5,
            "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
            "category": "Game Account", 
            "featured": True
        },
        {
            "name": "Resident Evil 4 Complete Edition",
            "description": "Fully upgraded RE4 account with all weapons and collectibles unlocked.",
            "platform": "Steam",
            "game_title": "Resident Evil 4",
            "price_inr": 1999.00,
            "price_usd": 24.99,
            "stock": 10,
            "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
            "category": "Game Account",
            "featured": True
        },
        {
            "name": "Crimson Desert Early Access",
            "description": "Beta access account with exclusive early gameplay and premium rewards.",
            "platform": "Steam", 
            "game_title": "Crimson Desert",
            "price_inr": 4999.00,
            "price_usd": 59.99,
            "stock": 3,
            "image_url": "https://images.unsplash.com/photo-1554213352-5ffe6534af08?w=400",
            "category": "Game Account",
            "featured": True
        },
        {
            "name": "Epic Games Fortnite Account",
            "description": "Account with rare skins and exclusive battle pass items.",
            "platform": "Epic",
            "game_title": "Fortnite",
            "price_inr": 1499.00,
            "price_usd": 19.99,
            "stock": 8,
            "image_url": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400",
            "category": "Game Account",
            "featured": False
        }
    ]
    
    products_created = 0
    for product in test_products:
        try:
            response = requests.post(f"{API_URL}/products", json=product, headers=headers)
            if response.status_code == 200:
                products_created += 1
                product_id = response.json()['product_id']
                print(f"✅ Created product: {product['name']} (ID: {product_id})")
            else:
                print(f"❌ Failed to create {product['name']}: {response.text}")
        except Exception as e:
            print(f"❌ Error creating product {product['name']}: {e}")
    
    print(f"🎯 Summary: Created {products_created}/{len(test_products)} products")
    return products_created > 0

if __name__ == "__main__":
    success = create_admin_and_products()
    print("✅ Setup complete!" if success else "❌ Setup failed!")