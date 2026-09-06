from app.schemas.user import (
    User,
    UserCreate,
    UserUpdate,
    Token,
    TokenData,
)

from app.schemas.article import (
    ArticleCreate,
    ArticleUpdate,
    Article,
)

from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    Category,
)

from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    Supplier,
)

from app.schemas.roles import (
    RoleCreate,
    RoleUpdate,
    RoleOut,
)

from app.schemas.requests import (
    StockRequestCreate,
    StockRequestUpdate,
    StockRequest,
)

from app.schemas.inventories import (
    InventoryCreate,
    InventoryUpdate,
    Inventory,
)

from app.schemas.notifications import (
    NotificationCreate,
    NotificationUpdate,
    Notification,
)

from app.schemas.audit import AuditLog

from app.schemas.user_permissions import (
    UserPermissionItem,
    UserPermissionsResponse,
    UserPermissionsUpdate,
)

from app.schemas.site import (
    SiteCreate,
    SiteUpdate,
    Site,
)

from app.schemas.warehouse import (
    WarehouseCreate,
    WarehouseUpdate,
    Warehouse,
)

from app.schemas.zone import (
    ZoneCreate,
    ZoneUpdate,
    Zone,
)

from app.schemas.location import (
    LocationCreate,
    LocationUpdate,
    Location,
)


__all__ = [
    # User
    "User",
    "UserCreate",
    "UserUpdate",
    "Token",
    "TokenData",

    # Articles
    "ArticleCreate",
    "ArticleUpdate",
    "Article",

    # Categories
    "CategoryCreate",
    "CategoryUpdate",
    "Category",

    # Suppliers
    "SupplierCreate",
    "SupplierUpdate",
    "Supplier",

    # Roles
    "RoleCreate",
    "RoleUpdate",
    "RoleOut",

    # Requests
    "StockRequestCreate",
    "StockRequestUpdate",
    "StockRequest",

    # Inventories
    "InventoryCreate",
    "InventoryUpdate",
    "Inventory",

    # Notifications
    "NotificationCreate",
    "NotificationUpdate",
    "Notification",

    # Audit
    "AuditLog",

    # User permissions
    "UserPermissionItem",
    "UserPermissionsResponse",
    "UserPermissionsUpdate",

    # Site
    "SiteCreate",
    "SiteUpdate",
    "Site",

    # Warehouse
    "WarehouseCreate",
    "WarehouseUpdate",
    "Warehouse",

    # Zone
    "ZoneCreate",
    "ZoneUpdate",
    "Zone",

    # Location
    "LocationCreate",
    "LocationUpdate",
    "Location",
]