package repositories

import "errors"

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrShiftNotFound      = errors.New("shift not found")
	ErrTableNotFound      = errors.New("table not found")
	ErrRoomNotFound       = errors.New("room not found")
)