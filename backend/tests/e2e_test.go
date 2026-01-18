package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
)

const (
	baseURL = "http://localhost:8080/api/v1"
)

// TestData хранит данные, созданные в процессе теста
type TestData struct {
	AccessToken          string
	RefreshToken         string
	UserID               string
	EstablishmentID      string
	IngredientCategoryID string
	ProductCategoryID    string
	TechCardCategoryID   string
	WarehouseID          string
	SupplierID           string
	IngredientIDs         []string
	ProductIDs            []string
	TechCardIDs           []string
	StockIDs              []string
	SupplyIDs              []string
}

// APIResponse представляет стандартный ответ API
type APIResponse struct {
	Data    interface{} `json:"data"`
	Message string      `json:"message,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// TestEstablishmentCreationE2E - полный e2e тест создания заведения со всем функционалом
func TestEstablishmentCreationE2E(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping e2e test in short mode")
	}

	// Проверяем, что сервер запущен
	if !isServerRunning() {
		t.Fatal("❌ Server is not running. Start the server before running e2e tests.\n" +
			"   Run: docker-compose up -d\n" +
			"   Or: cd backend && go run cmd/api/main.go")
	}

	t.Log("ℹ️  Make sure you have seeded the database before running this test:")
	t.Log("   1. go run backend/internal/scripts/seed_roles_and_subscriptions.go")
	t.Log("   2. go run backend/internal/scripts/seed_onboarding_questions.go")

	testData := &TestData{}

	// Критические шаги - должны выполняться последовательно и останавливать тест при ошибке
	t.Run("1. Register User", func(t *testing.T) {
		registerUser(t, testData)
		if testData.AccessToken == "" {
			t.Fatal("Registration failed - cannot continue without access token")
		}
	})

	t.Run("2. Get Onboarding Questions", func(t *testing.T) {
		getOnboardingQuestions(t)
	})

	t.Run("3. Submit Onboarding Answers", func(t *testing.T) {
		if testData.AccessToken == "" {
			t.Fatal("Cannot submit onboarding - no access token")
		}
		submitOnboardingAnswers(t, testData)
		if testData.EstablishmentID == "" {
			t.Fatal("Establishment creation failed - cannot continue")
		}
	})

	// Проверяем, что у нас есть токен и заведение перед продолжением
	// Если этих данных нет, значит критические шаги не прошли - останавливаем тест
	if testData.AccessToken == "" {
		t.Fatal("\n❌ CRITICAL: Registration failed - cannot continue.\n" +
			"   SOLUTION: Run seed script first:\n" +
			"   go run backend/internal/scripts/seed_roles_and_subscriptions.go")
	}
	if testData.EstablishmentID == "" {
		t.Fatal("\n❌ CRITICAL: Establishment not created - cannot continue.\n" +
			"   SOLUTION: Run seed script first:\n" +
			"   go run backend/internal/scripts/seed_onboarding_questions.go")
	}
	
	t.Log("✅ Critical steps completed successfully. Continuing with test...")

	t.Run("4. Get Establishment", func(t *testing.T) {
		getEstablishment(t, testData)
	})

	t.Run("5. Create Ingredient Category", func(t *testing.T) {
		createIngredientCategory(t, testData)
	})

	t.Run("6. Create Product Category", func(t *testing.T) {
		createProductCategory(t, testData)
	})

	t.Run("7. Create Tech Card Category", func(t *testing.T) {
		createTechCardCategory(t, testData)
	})

	t.Run("8. Create Warehouse", func(t *testing.T) {
		createWarehouse(t, testData)
	})

	t.Run("9. Create Supplier", func(t *testing.T) {
		createSupplier(t, testData)
	})

	t.Run("10. Create Ingredients", func(t *testing.T) {
		createIngredients(t, testData)
	})

	t.Run("11. Create Products", func(t *testing.T) {
		createProducts(t, testData)
	})

	t.Run("12. Create Tech Cards", func(t *testing.T) {
		createTechCards(t, testData)
	})

	t.Run("13. Check Stock", func(t *testing.T) {
		checkStock(t, testData)
	})

	t.Run("14. Create Supply", func(t *testing.T) {
		createSupply(t, testData)
	})

	t.Run("15. Check Stock After Supply", func(t *testing.T) {
		checkStockAfterSupply(t, testData)
	})

	t.Run("16. Create Write-Off", func(t *testing.T) {
		createWriteOff(t, testData)
	})

	t.Run("17. Check Stock After WriteOff", func(t *testing.T) {
		checkStockAfterWriteOff(t, testData)
	})

	t.Run("18. Get Movements", func(t *testing.T) {
		getMovements(t, testData)
	})

	t.Run("19. Verify All Created Entities", func(t *testing.T) {
		verifyAllEntities(t, testData)
	})

	// Выводим статистику
	t.Logf("\n=== E2E Test Statistics ===")
	t.Logf("Created Establishment: %s", testData.EstablishmentID)
	t.Logf("Created Categories: Ingredient=%s, Product=%s, TechCard=%s",
		testData.IngredientCategoryID, testData.ProductCategoryID, testData.TechCardCategoryID)
	t.Logf("Created Warehouse: %s", testData.WarehouseID)
	t.Logf("Created Supplier: %s", testData.SupplierID)
	t.Logf("Created Ingredients: %d", len(testData.IngredientIDs))
	t.Logf("Created Products: %d", len(testData.ProductIDs))
	t.Logf("Created Tech Cards: %d", len(testData.TechCardIDs))
	t.Logf("Created Supplies: %d", len(testData.SupplyIDs))
	t.Logf("Stock Items: %d", len(testData.StockIDs))
}

// Helper functions

func isServerRunning() bool {
	resp, err := http.Get("http://localhost:8080/health")
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// doRequest выполняет HTTP запрос и возвращает ответ с автоматическим закрытием body
func doRequest(t *testing.T, req *http.Request, expectedStatus int) *http.Response {
	// Проверяем, что токен не пустой для авторизованных запросов
	authHeader := req.Header.Get("Authorization")
	if authHeader != "" {
		if authHeader == "Bearer " || len(authHeader) <= 7 {
			t.Fatalf("Invalid or empty access token. Make sure registration succeeded. Header: %q", authHeader)
		}
	}
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	
	if resp.StatusCode != expectedStatus {
		bodyBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		t.Fatalf("Expected status %d, got %d. URL: %s %s. Response: %s", 
			expectedStatus, resp.StatusCode, req.Method, req.URL.Path, string(bodyBytes))
	}
	
	return resp
}

func registerUser(t *testing.T, testData *TestData) {
	reqBody := map[string]string{
		"email":    fmt.Sprintf("test_%s@example.com", uuid.New().String()[:8]),
		"password": "testpassword123",
		"name":     "Test User",
	}

	body, _ := json.Marshal(reqBody)
	resp, err := http.Post(baseURL+"/auth/register", "application/json", bytes.NewBuffer(body))
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(resp.Body)
		errorMsg := string(bodyBytes)
		
		// Проверяем специфичные ошибки и даем полезные советы
		if strings.Contains(errorMsg, "owner role not found") {
			t.Fatalf("Registration failed: %s\n\n"+
				"SOLUTION: You need to seed roles and subscriptions first.\n"+
				"Run: go run backend/internal/scripts/seed_roles_and_subscriptions.go\n"+
				"Or ensure your database has the required roles.", errorMsg)
		}
		
		t.Fatalf("Expected status %d, got %d. Response: %s", http.StatusCreated, resp.StatusCode, errorMsg)
	}

	var result struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		User         struct {
			ID string `json:"id"`
		} `json:"user"`
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if result.AccessToken == "" {
		t.Fatal("Access token is empty")
	}

	testData.AccessToken = result.AccessToken
	testData.RefreshToken = result.RefreshToken
	testData.UserID = result.User.ID

	t.Logf("User registered: %s", testData.UserID)
}

func getOnboardingQuestions(t *testing.T) {
	resp, err := http.Get(baseURL + "/auth/onboarding/questions")
	if err != nil {
		t.Fatalf("Failed to get onboarding questions: %v", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		errorMsg := string(bodyBytes)
		
		// Проверяем специфичные ошибки
		if strings.Contains(errorMsg, "failed to get questions") {
			t.Fatalf("Failed to get onboarding questions: %s\n\n"+
				"SOLUTION: You need to seed onboarding questions first.\n"+
				"Run: go run backend/internal/scripts/seed_onboarding_questions.go", errorMsg)
		}
		
		t.Fatalf("Expected status %d, got %d. Response: %s", http.StatusOK, resp.StatusCode, errorMsg)
	}

	var result struct {
		Data map[string]interface{} `json:"data"`
		Steps int                   `json:"steps"`
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if result.Steps <= 0 {
		t.Fatalf("Expected steps > 0, got %d", result.Steps)
	}

	t.Logf("Retrieved %d onboarding steps", result.Steps)
}

func submitOnboardingAnswers(t *testing.T, testData *TestData) {
	answers := map[string]interface{}{
		"establishment_name": "Test Restaurant E2E",
		"address":            "Test Address 123",
		"phone":              "+7 999 123-45-67",
		"email":              "restaurant@test.com",
		"type":               "restaurant",
		"has_seating_places": true,
		"table_count":        15,
		"has_takeaway":        true,
		"has_delivery":       true,
		"has_reservations":    true,
	}

	reqBody := map[string]interface{}{
		"answers": answers,
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", baseURL+"/auth/onboarding/submit", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusCreated)
	defer resp.Body.Close()

	var result struct {
		Message      string `json:"message"`
		Establishment struct {
			ID string `json:"id"`
		} `json:"establishment"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if result.Establishment.ID == "" {
		t.Fatal("Establishment ID is empty")
	}

	testData.EstablishmentID = result.Establishment.ID
	t.Logf("Establishment created: %s", testData.EstablishmentID)
}

func getEstablishment(t *testing.T, testData *TestData) {
	req, _ := http.NewRequest("GET", baseURL+"/establishments/"+testData.EstablishmentID, nil)
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusOK)
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}
	if testData.EstablishmentID != result.Data.ID { t.Errorf("Expected %v, got %v", testData.EstablishmentID, result.Data.ID) }
}

func createIngredientCategory(t *testing.T, testData *TestData) {
	reqBody := map[string]string{
		"name": "Овощи",
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", baseURL+"/menu/ingredient-categories", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusCreated)
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	testData.IngredientCategoryID = result.Data.ID
	t.Logf("Ingredient category created: %s", testData.IngredientCategoryID)
}

func createProductCategory(t *testing.T, testData *TestData) {
	reqBody := map[string]string{
		"name": "Горячие блюда",
		"type": "product",
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", baseURL+"/menu/categories", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusCreated)
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	testData.ProductCategoryID = result.Data.ID
	t.Logf("Product category created: %s", testData.ProductCategoryID)
}

func createTechCardCategory(t *testing.T, testData *TestData) {
	reqBody := map[string]string{
		"name": "Супы",
		"type": "tech_card",
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", baseURL+"/menu/categories", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusCreated)
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	testData.TechCardCategoryID = result.Data.ID
	t.Logf("Tech card category created: %s", testData.TechCardCategoryID)
}

func createWarehouse(t *testing.T, testData *TestData) {
	reqBody := map[string]string{
		"name":    "Основной склад",
		"address": "Складская ул., д. 1",
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", baseURL+"/warehouses", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusCreated)
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	testData.WarehouseID = result.Data.ID
	t.Logf("Warehouse created: %s", testData.WarehouseID)
}

func createSupplier(t *testing.T, testData *TestData) {
	reqBody := map[string]string{
		"name":           "ООО Поставщик",
		"taxpayer_number": "1234567890",
		"phone":          "+7 999 111-22-33",
		"address":        "Адрес поставщика",
		"comment":        "Основной поставщик",
		"contact":        "Иван Иванов",
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", baseURL+"/warehouse/suppliers", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusCreated)
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	testData.SupplierID = result.Data.ID
	t.Logf("Supplier created: %s", testData.SupplierID)
}

func createIngredients(t *testing.T, testData *TestData) {
	ingredients := []map[string]interface{}{
		{
			"name":          "Морковь",
			"category_id":   testData.IngredientCategoryID,
			"unit":          "кг",
			"warehouse_id":  testData.WarehouseID,
			"quantity":      10.0,
			"price_per_unit": 50.0,
		},
		{
			"name":          "Лук",
			"category_id":   testData.IngredientCategoryID,
			"unit":          "кг",
			"warehouse_id":  testData.WarehouseID,
			"quantity":      5.0,
			"price_per_unit": 40.0,
		},
		{
			"name":          "Картофель",
			"category_id":   testData.IngredientCategoryID,
			"unit":          "кг",
			"warehouse_id":  testData.WarehouseID,
			"quantity":      20.0,
			"price_per_unit": 30.0,
		},
	}

	for _, ing := range ingredients {
		body, _ := json.Marshal(ing)
		req, _ := http.NewRequest("POST", baseURL+"/menu/ingredients", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

		resp := doRequest(t, req, http.StatusCreated)
		defer resp.Body.Close()

		var result struct {
			Data struct {
				ID string `json:"id"`
			} `json:"data"`
		}

		err := json.NewDecoder(resp.Body).Decode(&result)
		if err != nil {
			t.Fatalf("Error: %v", err)
		}

		testData.IngredientIDs = append(testData.IngredientIDs, result.Data.ID)
		t.Logf("Ingredient created: %s", result.Data.ID)
	}

	if len(testData.IngredientIDs) != 3 {
		t.Fatalf("Expected 3 ingredients, got %d", len(testData.IngredientIDs))
	}
}

func createProducts(t *testing.T, testData *TestData) {
	products := []map[string]interface{}{
		{
			"name":        "Хлеб белый",
			"category_id": testData.ProductCategoryID,
			"unit":        "шт",
			"warehouse_id": testData.WarehouseID,
			"cost_price":  25.0,
			"markup":      50.0,
		},
		{
			"name":        "Хлеб черный",
			"category_id": testData.ProductCategoryID,
			"unit":        "шт",
			"warehouse_id": testData.WarehouseID,
			"cost_price":  30.0,
			"markup":      50.0,
		},
	}

	for _, prod := range products {
		body, _ := json.Marshal(prod)
		req, _ := http.NewRequest("POST", baseURL+"/menu/products", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

		resp := doRequest(t, req, http.StatusCreated)
		defer resp.Body.Close()

		var result struct {
			Data struct {
				ID string `json:"id"`
			} `json:"data"`
		}

		err := json.NewDecoder(resp.Body).Decode(&result)
		if err != nil {
			t.Fatalf("Error: %v", err)
		}

		testData.ProductIDs = append(testData.ProductIDs, result.Data.ID)
		t.Logf("Product created: %s", result.Data.ID)
	}

	if len(testData.ProductIDs) != 2 {
		t.Fatalf("Expected 2 products, got %d", len(testData.ProductIDs))
	}
}

func createTechCards(t *testing.T, testData *TestData) {
	if len(testData.IngredientIDs) < 2 {
		t.Fatal("Need at least 2 ingredients to create tech card")
	}

	techCard := map[string]interface{}{
		"name":        "Борщ",
		"category_id": testData.TechCardCategoryID,
		"description": "Классический борщ",
		"cost_price":  150.0,
		"markup":      100.0,
		"ingredients": []map[string]interface{}{
			{
				"ingredient_id": testData.IngredientIDs[0], // Морковь
				"quantity":      0.5,
				"unit":          "кг",
			},
			{
				"ingredient_id": testData.IngredientIDs[1], // Лук
				"quantity":      0.2,
				"unit":          "кг",
			},
			{
				"ingredient_id": testData.IngredientIDs[2], // Картофель
				"quantity":      0.3,
				"unit":          "кг",
			},
		},
		"warehouse_id": testData.WarehouseID,
	}

	body, _ := json.Marshal(techCard)
	req, _ := http.NewRequest("POST", baseURL+"/menu/tech-cards", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusCreated)
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	testData.TechCardIDs = append(testData.TechCardIDs, result.Data.ID)
	t.Logf("Tech card created: %s", result.Data.ID)
}

func checkStock(t *testing.T, testData *TestData) {
	req, _ := http.NewRequest("GET", baseURL+"/warehouse/stock?warehouse_id="+testData.WarehouseID, nil)
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusOK)
	defer resp.Body.Close()

	var result struct {
		Data []struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	// Должно быть минимум 3 остатка (для ингредиентов) + 2 (для продуктов) = 5
	if len(result.Data) < 5 { t.Errorf("Expected at least 5 stock items") }

	for _, stock := range result.Data {
		testData.StockIDs = append(testData.StockIDs, stock.ID)
	}

	t.Logf("Stock items found: %d", len(result.Data))
}

func createSupply(t *testing.T, testData *TestData) {
	if len(testData.IngredientIDs) == 0 {
		t.Fatal("Need ingredients to create supply")
	}

	deliveryTime := time.Now().Format(time.RFC3339)
	supply := map[string]interface{}{
		"warehouse_id":      testData.WarehouseID,
		"supplier_id":       testData.SupplierID,
		"delivery_date_time": deliveryTime,
		"status":            "completed",
		"comment":           "Тестовая поставка",
		"items": []map[string]interface{}{
			{
				"ingredient_id": testData.IngredientIDs[0],
				"quantity":      5.0,
				"unit":          "кг",
				"price_per_unit": 50.0,
				"total_amount":   250.0,
			},
			{
				"ingredient_id": testData.IngredientIDs[1],
				"quantity":      3.0,
				"unit":          "кг",
				"price_per_unit": 40.0,
				"total_amount":   120.0,
			},
		},
	}

	body, _ := json.Marshal(supply)
	req, _ := http.NewRequest("POST", baseURL+"/warehouse/supplies", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusCreated)
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	testData.SupplyIDs = append(testData.SupplyIDs, result.Data.ID)
	t.Logf("Supply created: %s", result.Data.ID)
}

func checkStockAfterSupply(t *testing.T, testData *TestData) {
	req, _ := http.NewRequest("GET", baseURL+"/warehouse/stock?warehouse_id="+testData.WarehouseID, nil)
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusOK)
	defer resp.Body.Close()

	var result struct {
		Data []struct {
			ID       string  `json:"id"`
			Quantity float64 `json:"quantity"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	// Проверяем, что остатки увеличились
	found := false
	for _, stock := range result.Data {
		if stock.Quantity > 10.0 { // Морковь должна быть 10 + 5 = 15
			found = true
			break
		}
	}

	if !found { t.Errorf("Stock quantities should have increased after supply") }
	t.Logf("Stock after supply verified: %d items", len(result.Data))
}

func createWriteOff(t *testing.T, testData *TestData) {
	if len(testData.IngredientIDs) == 0 {
		t.Fatal("Need ingredients to create write-off")
	}

	writeOffTime := time.Now().Format(time.RFC3339)
	writeOff := map[string]interface{}{
		"warehouse_id":        testData.WarehouseID,
		"write_off_date_time": writeOffTime,
		"reason":              "Испорчен",
		"comment":             "Тестовое списание",
		"items": []map[string]interface{}{
			{
				"ingredient_id": testData.IngredientIDs[0],
				"quantity":      1.0,
				"unit":          "кг",
				"details":       "Испорченная морковь",
			},
		},
	}

	body, _ := json.Marshal(writeOff)
	req, _ := http.NewRequest("POST", baseURL+"/warehouse/write-offs", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusCreated)
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	t.Logf("Write-off created: %s", result.Data.ID)
}

func checkStockAfterWriteOff(t *testing.T, testData *TestData) {
	req, _ := http.NewRequest("GET", baseURL+"/warehouse/stock?warehouse_id="+testData.WarehouseID, nil)
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusOK)
	defer resp.Body.Close()

	var result struct {
		Data []struct {
			ID       string  `json:"id"`
			Quantity float64 `json:"quantity"`
		} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	t.Logf("Stock after write-off: %d items", len(result.Data))
}

func getMovements(t *testing.T, testData *TestData) {
	req, _ := http.NewRequest("GET", baseURL+"/warehouse/movements?warehouse_id="+testData.WarehouseID, nil)
	req.Header.Set("Authorization", "Bearer "+testData.AccessToken)

	resp := doRequest(t, req, http.StatusOK)
	defer resp.Body.Close()

	var result struct {
		Data []interface{} `json:"data"`
	}

	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	// Должны быть движения от поставки и списания
	if len(result.Data) < 2 { t.Errorf("Expected at least 2 movements (supply and write-off)") }

	t.Logf("Movements found: %d", len(result.Data))
}

func verifyAllEntities(t *testing.T, testData *TestData) {
	// Проверяем, что все сущности созданы
	if testData.EstablishmentID == "" { t.Errorf("Establishment should be created") }
	if testData.IngredientCategoryID == "" { t.Errorf("Ingredient category should be created") }
	if testData.ProductCategoryID == "" { t.Errorf("Product category should be created") }
	if testData.TechCardCategoryID == "" { t.Errorf("Tech card category should be created") }
	if testData.WarehouseID == "" { t.Errorf("Warehouse should be created") }
	if testData.SupplierID == "" { t.Errorf("Supplier should be created") }
	if len(testData.IngredientIDs) <= 0 { t.Errorf("At least one ingredient should be created") }
	if len(testData.ProductIDs) <= 0 { t.Errorf("At least one product should be created") }
	if len(testData.TechCardIDs) <= 0 { t.Errorf("At least one tech card should be created") }
	if len(testData.SupplyIDs) <= 0 { t.Errorf("At least one supply should be created") }

	t.Log("All entities verified successfully")
}

// Для запуска теста используйте:
// go test -v -short=false -run TestEstablishmentCreationE2E ./e2e_test.go
