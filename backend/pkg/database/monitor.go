package database

import (
	"context"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

// SlowQueryThreshold определяет порог для медленных запросов (в миллисекундах)
const SlowQueryThreshold = 200 // 200ms

// MonitorDBQuery логирует медленные запросы и собирает метрики
func MonitorDBQuery(logger *zap.Logger) func(db *gorm.DB) {
	return func(db *gorm.DB) {
		// Проверяем, есть ли информация о времени начала запроса
		// GORM не предоставляет это напрямую, поэтому используем текущее время
		// В реальности лучше использовать Before callback для установки времени начала
		start, ok := db.InstanceGet("start_time")
		if !ok {
			start = time.Now()
		}

		// Вычисляем время выполнения запроса
		elapsed := time.Since(start.(time.Time))
		elapsedMs := elapsed.Milliseconds()

		// Логируем медленные запросы
		if elapsedMs > SlowQueryThreshold {
			sql := db.Statement.SQL.String()
			if sql == "" {
				sql = "N/A"
			}

			logger.Warn("Slow database query detected",
				zap.Int64("duration_ms", elapsedMs),
				zap.String("sql", sql),
				zap.Any("vars", db.Statement.Vars),
			)
		}

		// В production можно отправлять метрики в Prometheus
		// prometheusQueryDuration.WithLabelValues("query").Observe(elapsed.Seconds())
	}
}

// MonitorDBQueryBefore устанавливает время начала запроса
func MonitorDBQueryBefore(logger *zap.Logger) func(db *gorm.DB) {
	return func(db *gorm.DB) {
		db.InstanceSet("start_time", time.Now())
	}
}

// SetupQueryMonitoring настраивает мониторинг запросов для GORM
func SetupQueryMonitoring(db *gorm.DB, logger *zap.Logger) {
	// Пропускаем настройку, если logger не передан
	if logger == nil {
		return
	}

	// Добавляем Before callback для установки времени начала
	db.Callback().Query().Before("gorm:query").Register("monitor:before_query", MonitorDBQueryBefore(logger))
	db.Callback().Create().Before("gorm:create").Register("monitor:before_create", MonitorDBQueryBefore(logger))
	db.Callback().Update().Before("gorm:update").Register("monitor:before_update", MonitorDBQueryBefore(logger))
	db.Callback().Delete().Before("gorm:delete").Register("monitor:before_delete", MonitorDBQueryBefore(logger))

	// Добавляем After callback для логирования медленных запросов
	db.Callback().Query().After("gorm:query").Register("monitor:slow_query", MonitorDBQuery(logger))
	db.Callback().Create().After("gorm:create").Register("monitor:slow_query", MonitorDBQuery(logger))
	db.Callback().Update().After("gorm:update").Register("monitor:slow_query", MonitorDBQuery(logger))
	db.Callback().Delete().After("gorm:delete").Register("monitor:slow_query", MonitorDBQuery(logger))
}

// GetDBStats возвращает статистику пула соединений
func GetDBStats(db *gorm.DB) (map[string]interface{}, error) {
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	stats := sqlDB.Stats()
	return map[string]interface{}{
		"max_open_connections":     stats.MaxOpenConnections,
		"open_connections":       stats.OpenConnections,
		"in_use":                 stats.InUse,
		"idle":                   stats.Idle,
		"wait_count":             stats.WaitCount,
		"wait_duration":          stats.WaitDuration.String(),
		"max_idle_closed":        stats.MaxIdleClosed,
		"max_idle_time_closed":   stats.MaxIdleTimeClosed,
		"max_lifetime_closed":    stats.MaxLifetimeClosed,
	}, nil
}

// LogDBStats логирует статистику пула соединений
func LogDBStats(ctx context.Context, db *gorm.DB, logger *zap.Logger) {
	stats, err := GetDBStats(db)
	if err != nil {
		logger.Error("Failed to get DB stats", zap.Error(err))
		return
	}

	logger.Info("Database connection pool stats",
		zap.Int("max_open_connections", stats["max_open_connections"].(int)),
		zap.Int("open_connections", stats["open_connections"].(int)),
		zap.Int("in_use", stats["in_use"].(int)),
		zap.Int("idle", stats["idle"].(int)),
		zap.Int64("wait_count", stats["wait_count"].(int64)),
		zap.String("wait_duration", stats["wait_duration"].(string)),
	)
}
