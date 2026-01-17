package models

// EstablishmentSettings представляет настройки заведения из опросника при регистрации
// Эти настройки влияют на функциональность PWA приложения
type EstablishmentSettings struct {
	// Настройки столов и мест
	HasSeatingPlaces bool `json:"has_seating_places"` // Есть ли сидячие места
	TableCount       *int `json:"table_count"`        // Количество столов (если есть)
	
	// Тип заведения
	Type string `json:"type"` // restaurant, cafe, fast_food, bar, takeaway, etc.
	
	// Дополнительные настройки (можно расширить)
	HasDelivery      bool `json:"has_delivery"`      // Есть ли доставка
	HasTakeaway      bool `json:"has_takeaway"`      // Есть ли на вынос
	HasReservations  bool `json:"has_reservations"`  // Принимаются ли бронирования
}

// GetDefaultSettings возвращает настройки по умолчанию
func GetDefaultSettings() EstablishmentSettings {
	return EstablishmentSettings{
		HasSeatingPlaces: false,
		HasDelivery:      false,
		HasTakeaway:      true,
		HasReservations:  false,
		Type:            "cafe",
	}
}