import shutil
import uuid
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File, Header
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import decode_token
from app.core.config import settings
from app.models.community import CommunityPost, CommunityComment

router = APIRouter(prefix="/community", tags=["Community"])

UPLOAD_DIR = "app/static/upload"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _get_username(authorization: Optional[str]) -> str:
    """Extract username from Bearer token, raise 401 if invalid."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return str(payload["sub"])


# ─── Posts ──────────────────────────────────────────────────────────────────

@router.get("/posts")
def list_posts(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    posts = (
        db.query(CommunityPost)
        .options(joinedload(CommunityPost.comments))
        .order_by(desc(CommunityPost.created_at))
        .offset(offset)
        .limit(min(limit, 50))
        .all()
    )
    return [_serialize_post(p) for p in posts]


@router.post("/posts")
async def create_post(
    content: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    username = _get_username(authorization)

    image_url: Optional[str] = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        file_path = f"{UPLOAD_DIR}/{filename}"
        with open(file_path, "wb") as buf:
            shutil.copyfileobj(image.file, buf)
        image_url = f"{settings.BASE_URL}/static/upload/{filename}"

    post = CommunityPost(
        username=username,
        content=content,
        image_url=image_url,
        latitude=latitude,
        longitude=longitude,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _serialize_post(post)


@router.post("/posts/{post_id}/like")
def like_post(
    post_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    _get_username(authorization)
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.query(CommunityPost).filter(CommunityPost.id == post_id).update(
        {"likes": CommunityPost.likes + 1}
    )
    db.commit()
    db.refresh(post)
    return {"likes": post.likes}


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    username = _get_username(authorization)
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if str(post.username) != username:
        raise HTTPException(status_code=403, detail="Not your post")
    db.delete(post)
    db.commit()
    return {"ok": True}


# ─── Comments ────────────────────────────────────────────────────────────────

@router.post("/posts/{post_id}/comments")
def add_comment(
    post_id: int,
    content: str = Form(...),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    username = _get_username(authorization)
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment = CommunityComment(post_id=post_id, username=username, content=content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return _serialize_comment(comment)


@router.delete("/posts/{post_id}/comments/{comment_id}")
def delete_comment(
    post_id: int,
    comment_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    username = _get_username(authorization)
    comment = (
        db.query(CommunityComment)
        .filter(CommunityComment.id == comment_id, CommunityComment.post_id == post_id)
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if str(comment.username) != username:
        raise HTTPException(status_code=403, detail="Not your comment")
    db.delete(comment)
    db.commit()
    return {"ok": True}


# ─── Serializers ─────────────────────────────────────────────────────────────

def _serialize_comment(c: CommunityComment) -> dict:
    return {
        "id": c.id,
        "post_id": c.post_id,
        "username": c.username,
        "content": c.content,
        "created_at": c.created_at.isoformat() if c.created_at is not None else None,
    }


def _serialize_post(p: CommunityPost) -> dict:
    return {
        "id": p.id,
        "username": p.username,
        "content": p.content,
        "image_url": p.image_url,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "likes": p.likes or 0,
        "created_at": p.created_at.isoformat() if p.created_at is not None else None,
        "comments": [_serialize_comment(c) for c in (p.comments or [])],
    }
