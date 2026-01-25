package repositories

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

func TestUserRepository_GetByPIN(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	gormDB, err := gorm.Open(postgres.New(postgres.Config{Conn: db}), &gorm.Config{})
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening gorm database", err)
	}

	repo := NewUserRepository(gormDB)
	ctx := context.Background()

	// Test case 1: User found by PIN
	t.Run("User found by PIN", func(t *testing.T) {
		userID := uuid.New()
		estID := uuid.New()
		pin := "1234"
		
		rows := sqlmock.NewRows([]string{"id", "email", "password", "name", "role_id", "establishment_id", "onboarding_completed", "created_at", "updated_at", "pin"}).
			AddRow(userID, "test@example.com", "hashedpassword", "Test User", uuid.New(), estID, true, time.Now(), time.Now(), pin)

		mock.ExpectQuery("SELECT \* FROM \"users\" WHERE pin = \$1 ORDER BY \"users\".\"id\" LIMIT 1").
			WithArgs(pin).WillReturnRows(rows)

		user, err := repo.GetByPIN(ctx, pin)

		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, userID, user.ID)
		assert.Equal(t, "test@example.com", user.Email)
		assert.Equal(t, pin, *user.PIN)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	// Test case 2: User not found by PIN
	t.Run("User not found by PIN", func(t *testing.T) {
		pin := "9999"

		mock.ExpectQuery("SELECT \* FROM \"users\" WHERE pin = \$1 ORDER BY \"users\".\"id\" LIMIT 1").
			WithArgs(pin).WillReturnError(gorm.ErrRecordNotFound)

		user, err := repo.GetByPIN(ctx, pin)

		assert.Error(t, err)
		assert.Nil(t, user)
		assert.True(t, errors.Is(err, ErrUserNotFound))
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	// Test case 3: Database error
	t.Run("Database error", func(t *testing.T) {
		pin := "1111"
		expectedErr := errors.New("database connection error")

		mock.ExpectQuery("SELECT \* FROM \"users\" WHERE pin = \$1 ORDER BY \"users\".\"id\" LIMIT 1").
			WithArgs(pin).WillReturnError(expectedErr)

		user, err := repo.GetByPIN(ctx, pin)

		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Equal(t, expectedErr, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}