package repositories

import "errors"

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrShiftNotFound      = errors.New("shift not found")
	ErrTableNotFound      = errors.New("table not found")
	ErrRoomNotFound       = errors.New("room not found")
	ErrClientNotFound      = errors.New("client not found")
	ErrClientGroupNotFound = errors.New("client group not found")
	ErrLoyaltyProgramNotFound = errors.New("loyalty program not found")
	ErrPromotionNotFound   = errors.New("promotion not found")
	ErrExclusionNotFound  = errors.New("exclusion not found")
)