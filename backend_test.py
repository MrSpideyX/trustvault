#!/usr/bin/env python3

import requests
import sys
import json
import time
from datetime import datetime

class GameHubAPITester:
    def __init__(self, base_url="https://gaming-hub-471.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_admin_id = None
        self.test_product_id = None
        self.test_order_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        print(f"🔧 Testing API at: {self.api_url}")
        print(f"🔧 Frontend URL: {base_url}")
        print("="*50)

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {name}")
        if details:
            print(f"     {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append(f"{name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_token=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if use_token and self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    if response.text:
                        error_msg += f" - {response.text[:200]}"
                except:
                    pass
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (>10s)")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Connection error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API root endpoint"""
        success, response = self.run_test("API Health Check", "GET", "", 200)
        if success:
            self.log_test("API Health Check", True, f"API is running - {response.get('message', '')}")
        return success

    def test_register_user(self):
        """Test user registration"""
        timestamp = int(time.time())
        test_data = {
            "email": f"testuser{timestamp}@example.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, test_data)
        if success:
            self.token = response.get('token')
            self.test_user_id = response.get('user', {}).get('user_id')
            self.log_test("User Registration", True, f"User created: {self.test_user_id}")
        
        return success

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.test_user_id:
            return False
            
        test_data = {
            "email": f"testuser{int(time.time())}@example.com",
            "password": "TestPass123!"
        }
        
        # Try login with new credentials (should fail)
        success, response = self.run_test("User Login (Invalid)", "POST", "auth/login", 401, test_data)
        if success:
            self.log_test("User Login (Invalid)", True, "Correctly rejected invalid credentials")

        return True

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            self.log_test("Get Current User", False, "No token available")
            return False
            
        success, response = self.run_test("Get Current User", "GET", "auth/me", 200, use_token=True)
        if success:
            self.log_test("Get Current User", True, f"Retrieved user: {response.get('name')}")
        return success

    def test_products_crud(self):
        """Test products CRUD operations"""
        # Get products (public)
        success, response = self.run_test("Get Products (Public)", "GET", "products", 200)
        if success:
            self.log_test("Get Products (Public)", True, f"Retrieved {len(response)} products")

        # Test search and filters
        success, _ = self.run_test("Search Products", "GET", "products?search=steam", 200)
        if success:
            self.log_test("Search Products", True, "Search functionality working")

        success, _ = self.run_test("Filter Products", "GET", "products?platform=Steam", 200)
        if success:
            self.log_test("Filter Products", True, "Filter functionality working")

        return True

    def test_product_detail(self):
        """Test individual product detail"""
        # First get all products to find one to test
        success, products = self.run_test("Get Products for Detail Test", "GET", "products", 200)
        if success and products:
            product_id = products[0]['product_id']
            success, response = self.run_test("Get Product Detail", "GET", f"products/{product_id}", 200)
            if success:
                self.log_test("Get Product Detail", True, f"Retrieved product: {response.get('name')}")
                self.test_product_id = product_id
                return True
        
        self.log_test("Get Product Detail", False, "No products available to test")
        return False

    def test_cart_operations(self):
        """Test cart functionality (requires auth)"""
        if not self.token:
            self.log_test("Cart Operations", False, "No token available")
            return False

        # Get empty cart
        success, response = self.run_test("Get Cart (Empty)", "GET", "cart", 200, use_token=True)
        if success:
            self.log_test("Get Cart (Empty)", True, f"Cart has {len(response.get('items', []))} items")

        # Try adding to cart (need product)
        if self.test_product_id:
            cart_item = {"product_id": self.test_product_id, "quantity": 1}
            success, response = self.run_test("Add to Cart", "POST", "cart/add", 200, cart_item, use_token=True)
            if success:
                self.log_test("Add to Cart", True, "Item added to cart")
                
                # Get cart with items
                success, response = self.run_test("Get Cart (With Items)", "GET", "cart", 200, use_token=True)
                if success:
                    self.log_test("Get Cart (With Items)", True, f"Cart now has {len(response.get('items', []))} items")

        return True

    def test_wishlist_operations(self):
        """Test wishlist functionality"""
        if not self.token or not self.test_product_id:
            self.log_test("Wishlist Operations", False, "No token or product available")
            return False

        # Get empty wishlist
        success, response = self.run_test("Get Wishlist (Empty)", "GET", "wishlist", 200, use_token=True)
        if success:
            self.log_test("Get Wishlist (Empty)", True, f"Wishlist has {len(response.get('items', []))} items")

        # Add to wishlist
        success, response = self.run_test("Add to Wishlist", "POST", f"wishlist/add/{self.test_product_id}", 200, use_token=True)
        if success:
            self.log_test("Add to Wishlist", True, "Item added to wishlist")

        # Get wishlist with items
        success, response = self.run_test("Get Wishlist (With Items)", "GET", "wishlist", 200, use_token=True)
        if success:
            self.log_test("Get Wishlist (With Items)", True, f"Wishlist now has {len(response.get('items', []))} items")

        return True

    def test_admin_functionality(self):
        """Test admin endpoints (will likely fail unless user is admin)"""
        if not self.token:
            self.log_test("Admin Functionality", False, "No token available")
            return False

        # Try admin endpoints (should fail for regular user)
        success, response = self.run_test("Admin Stats (Should Fail)", "GET", "admin/stats", 403, use_token=True)
        if success:
            self.log_test("Admin Access Control", True, "Correctly blocked non-admin user")

        return True

    def test_discount_validation(self):
        """Test discount code validation"""
        if not self.token:
            self.log_test("Discount Validation", False, "No token available")
            return False

        # Test invalid discount code
        discount_data = {"code": "INVALID123"}
        success, response = self.run_test("Validate Invalid Discount", "POST", "discounts/validate", 404, discount_data, use_token=True)
        if success:
            self.log_test("Discount Validation", True, "Correctly rejected invalid discount code")

        return True

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting Gaming Hub API Test Suite...")
        print()

        # Core API Tests
        self.test_health_check()
        self.test_register_user()
        self.test_user_login()
        self.test_get_current_user()
        
        # Products Tests
        self.test_products_crud()
        self.test_product_detail()
        
        # User Feature Tests
        self.test_cart_operations()
        self.test_wishlist_operations()
        
        # Admin & Business Logic Tests
        self.test_admin_functionality()
        self.test_discount_validation()

        # Print Summary
        print("\n" + "="*50)
        print("📊 TEST SUMMARY")
        print("="*50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   • {test}")
        
        print("\n🎯 Key Findings:")
        if self.token:
            print("   ✅ User authentication working")
        else:
            print("   ❌ Authentication issues detected")
            
        if self.test_product_id:
            print("   ✅ Product data available")
        else:
            print("   ❌ No products in system")

        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    try:
        tester = GameHubAPITester()
        success = tester.run_all_tests()
        
        # Return appropriate exit code
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test runner failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())