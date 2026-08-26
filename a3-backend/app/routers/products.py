from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_developer
from app import models, schemas

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[schemas.ProductOut])
def list_products(
    status: models.ProductStatus | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Product)
    # Customers only ever see published products; developers can filter freely.
    if current_user.role == models.Role.CUSTOMER:
        query = query.filter(models.Product.status == models.ProductStatus.PUBLISHED)
    elif status is not None:
        query = query.filter(models.Product.status == status)

    return query.order_by(models.Product.created_at.desc()).all()


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=schemas.ProductOut, status_code=201)
def create_product(
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_developer),
):
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: str,
    payload: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_developer),
):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/publish", response_model=schemas.ProductOut)
def publish_product(
    product_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_developer)
):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.status = models.ProductStatus.PUBLISHED
    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/unpublish", response_model=schemas.ProductOut)
def unpublish_product(
    product_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_developer)
):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.status = models.ProductStatus.DRAFT
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_developer)
):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
