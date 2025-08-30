from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from decouple import config

# Security configuration
SECRET_KEY = config("SECRET_KEY", default="construction-ai-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Demo users with fixed bcrypt hashes of 'admin123' and 'manager123'
fake_users_db = {
    "admin": {
        "username": "admin",
        "full_name": "Site Administrator",
        "email": "admin@construction.com",
        # bcrypt hash of 'admin123'
        "hashed_password": "$2b$12$kTRO8sixnP/Oy79wi.a4KOzuB5uo5SlwEkQ0uc7F7BrGkCZr3LARB",
        "disabled": False,
    },
    "manager": {
        "username": "manager",
        "full_name": "Project Manager",
        "email": "manager@construction.com",
        # bcrypt hash of 'manager123'
        "hashed_password": "$2b$12$MWv5ycdNBFVhOImtcxwCPu0jUWPYX0wM7yFo6jvkl/0xgHJ/Ch0r6",
        "disabled": False,
    }
}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(username: str):
    user = fake_users_db.get(username)
    if user:
        return user
    return None

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(username=username)
    if user is None:
        raise credentials_exception
    return user
