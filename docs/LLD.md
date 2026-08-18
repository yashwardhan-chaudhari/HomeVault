# Low-Level Design (LLD)
## HomeVault - Smart Home Inventory Management System

---

## Document Control

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-08-18 | Engineering Team | Initial LLD |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Database Schema](#2-database-schema)
3. [API Specifications](#3-api-specifications)
4. [Component Specifications](#4-component-specifications)
5. [Algorithm Details](#5-algorithm-details)
6. [Error Handling](#6-error-handling)
7. [Code Standards](#7-code-standards)

---

## 1. Introduction

### 1.1 Purpose
This Low-Level Design document provides detailed technical specifications for implementing HomeVault. It includes database schemas, API contracts, component interfaces, algorithms, and code examples.

### 1.2 Scope
- Detailed database schema with field specifications
- Complete API endpoint specifications with request/response formats
- Component props, state, and method signatures
- Algorithm pseudocode and implementation details
- Error handling strategies
- Code standards and conventions

---

## 2. Database Schema

### 2.1 Database Structure

```typescript
interface Database {
  users: User[];
  items: Item[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
}
```

### 2.2 User Schema

```typescript
interface User {
  id: string;                    // Format: "user_<timestamp>"
  email: string;                 // Unique, lowercase, validated format
  passwordHash: string;          // bcrypt hash with 10 salt rounds
  fullName: string;              // Min 2 characters
  avatarUrl?: string;            // Optional profile image URL
  role: 'user' | 'admin';       // Default: 'user'
  themePreference: 'light' | 'dark' | 'system';  // Default: 'light'
  notificationPrefs: {
    email: boolean;              // Default: true
    warranty: boolean;           // Default: true
    expiry: boolean;             // Default: true
    weeklyDigest: boolean;       // Default: true
  };
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

**Constraints**:
- `email`: Must be unique across all users
- `passwordHash`: Never exposed in API responses
- `id`: Auto-generated, format `user_<timestamp>`

**Indexes** (for production database):
- Primary: `id`
- Unique: `email`

---

### 2.3 Item Schema

```typescript
interface Item {
  // Identification
  id: string;                    // Format: "item_<timestamp>_<random>"
  userId: string;                // Foreign key to User.id
  
  // Basic Information
  name: string;                  // Required, max 200 chars
  description?: string;          // Optional, max 1000 chars
  category: string;              // Default: 'General'
  subcategory?: string;          // Optional
  brand?: string;                // Optional, max 100 chars
  tags: string[];                // Array of user-defined tags
  
  // Financial Information
  price: number;                 // Decimal, default 0
  purchaseDate?: string;         // ISO date string (YYYY-MM-DD)
  warrantyDate?: string;         // ISO date string (YYYY-MM-DD)
  
  // Inventory Details
  quantity: number;              // Integer, default 1, min 1
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';  // Default: 'New'
  priority: 'Low' | 'Medium' | 'High' | 'Critical';  // Default: 'Medium'
  serialNumber?: string;         // Optional, max 100 chars
  notes?: string;                // Optional, max 2000 chars
  
  // Organization
  isFavorite: boolean;           // Default: false
  isDeleted: boolean;            // Default: false (soft delete)
  
  // Location Hierarchy
  location: {
    house: string;               // Default: 'Main Residence'
    floor: string;               // Default: '1st Floor'
    room: string;                // Default: 'General Storage'
    cupboard?: string;           // Optional
    shelf?: string;              // Optional
    drawer?: string;             // Optional
    container?: string;          // Optional
    exactPosition?: string;      // Optional, free-form description
  };
  
  // Media
  images: string[];              // Array of image URLs, default: placeholder
  videos: string[];              // Array of video URLs
  documents: string[];           // Array of document URLs (receipts, manuals)
  
  // Metadata
  viewedCount: number;           // Integer, default 0
  lastViewedAt?: string;         // ISO 8601 timestamp
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

**Constraints**:
- `name`: Required field
- `price`: Non-negative decimal
- `quantity`: Positive integer >= 1
- `userId`: Must reference existing User.id
- `images`: At least one default placeholder if empty

**Indexes** (for production):
- Primary: `id`
- Foreign Key: `userId`
- Composite: `(userId, isDeleted, category)`
- Composite: `(userId, isDeleted, location.room)`
- Text Search: `(name, description, brand, tags)`

---

### 2.4 Activity Log Schema

```typescript
interface ActivityLog {
  id: string;                    // Format: "log_<timestamp>_<random>"
  userId: string;                // Foreign key to User.id
  itemId: string;                // Related item ID
  itemName: string;              // Item name at time of action
  action: 'Created' | 'Updated' | 'Deleted' | 'Moved' | 'Favorited';
  details: string;               // Description of action
  timestamp: string;             // ISO 8601 timestamp
}
```

**Constraints**:
- Maximum 500 logs per user (oldest removed when limit exceeded)
- Immutable (append-only, no updates or deletes)
- `itemId` may reference deleted items (historical record)

**Indexes**:
- Primary: `id`
- Foreign Key: `userId`
- Composite: `(userId, timestamp)` for chronological retrieval

---

### 2.5 Notification Schema

```typescript
interface Notification {
  id: string;                    // Format: "notif_<timestamp>_<random>"
  userId: string;                // Foreign key to User.id
  type: 'warranty' | 'expiry' | 'system' | 'achievement';
  title: string;                 // Notification headline
  message: string;               // Notification body
  itemId?: string;               // Optional related item
  isRead: boolean;               // Default: false
  createdAt: string;             // ISO 8601 timestamp
}
```

**Constraints**:
- Retained for 90 days, then auto-deleted
- `isRead` toggleable by user

**Indexes**:
- Primary: `id`
- Foreign Key: `userId`
- Composite: `(userId, isRead)` for unread count

---

## 3. API Specifications

### 3.1 Authentication API

#### POST /api/auth/register

**Description**: Register a new user account

**Request Body**:
```typescript
{
  email: string;        // Required, valid email format
  password: string;     // Required, min 6 characters
  fullName: string;     // Required, min 2 characters
}
```

**Response (201 Created)**:
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
    themePreference: string;
    notificationPrefs: object;
    createdAt: string;
    updatedAt: string;
  },
  token: string;        // JWT token, expires in 7 days
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields or invalid email
- `400 Bad Request`: User with email already exists
- `500 Internal Server Error`: Server error

---

#### POST /api/auth/login

**Description**: Authenticate user and receive JWT token

**Request Body**:
```typescript
{
  email: string;        // Required
  password: string;     // Required
}
```

**Response (200 OK)**:
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string;
    // ... other user fields (no passwordHash)
  },
  token: string;        // JWT token
}
```

**Error Responses**:
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

---

#### GET /api/auth/me

**Description**: Get current authenticated user profile

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string;
    // ... full user object
  }
}
```

**Error Responses**:
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

### 3.2 Items API

#### GET /api/items

**Description**: Get paginated, filtered, and sorted items

**Query Parameters**:
```typescript
{
  search?: string;           // Search in name, description, brand, tags
  category?: string;         // Filter by category
  subcategory?: string;      // Filter by subcategory
  brand?: string;            // Filter by brand
  room?: string;             // Filter by location.room
  house?: string;            // Filter by location.house
  condition?: string;        // Filter by condition
  priority?: string;         // Filter by priority
  isFavorite?: 'true' | 'false';  // Filter favorites
  tag?: string;              // Filter by tag
  sortBy?: string;           // Field to sort by (default: 'createdAt')
  sortOrder?: 'asc' | 'desc';     // Sort direction (default: 'desc')
  page?: number;             // Page number (default: 1)
  limit?: number;            // Items per page (default: 24)
}
```

**Response (200 OK)**:
```typescript
{
  items: Item[];             // Array of item objects
  pagination: {
    total: number;           // Total matching items
    page: number;            // Current page
    limit: number;           // Items per page
    totalPages: number;      // Total pages
  }
}
```

**Error Responses**:
- `500 Internal Server Error`: Server error

---

#### GET /api/items/:id

**Description**: Get single item by ID and increment view count

**Path Parameters**:
- `id`: Item ID (string)

**Response (200 OK)**:
```typescript
{
  item: Item;               // Full item object
}
```

**Error Responses**:
- `404 Not Found`: Item not found or unauthorized
- `500 Internal Server Error`: Server error

---

#### POST /api/items

**Description**: Create a new item

**Request Body**:
```typescript
{
  name: string;              // Required
  description?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  price?: number;
  purchaseDate?: string;     // ISO date string
  warrantyDate?: string;     // ISO date string
  quantity?: number;
  condition?: string;
  priority?: string;
  serialNumber?: string;
  notes?: string;
  isFavorite?: boolean;
  location?: {
    house?: string;
    floor?: string;
    room?: string;
    cupboard?: string;
    shelf?: string;
    drawer?: string;
    container?: string;
    exactPosition?: string;
  };
  images?: string[];
  videos?: string[];
  documents?: string[];
}
```

**Response (201 Created)**:
```typescript
{
  item: Item;               // Newly created item with generated ID
}
```

**Error Responses**:
- `400 Bad Request`: Missing required field `name`
- `500 Internal Server Error`: Server error

---

#### PUT /api/items/:id

**Description**: Update existing item

**Path Parameters**:
- `id`: Item ID (string)

**Request Body**: Same as POST /api/items (partial updates allowed)

**Response (200 OK)**:
```typescript
{
  item: Item;               // Updated item object
}
```

**Error Responses**:
- `404 Not Found`: Item not found or unauthorized
- `500 Internal Server Error`: Server error

---

#### DELETE /api/items/:id

**Description**: Soft delete item (mark as deleted)

**Path Parameters**:
- `id`: Item ID (string)

**Response (200 OK)**:
```typescript
{
  message: string;          // "Item deleted successfully"
}
```

**Error Responses**:
- `404 Not Found`: Item not found
- `500 Internal Server Error`: Server error

---

#### PATCH /api/items/:id/favorite

**Description**: Toggle item favorite status

**Path Parameters**:
- `id`: Item ID (string)

**Response (200 OK)**:
```typescript
{
  item: Item;               // Item with updated isFavorite field
}
```

**Error Responses**:
- `404 Not Found`: Item not found
- `500 Internal Server Error`: Server error

---

### 3.3 AI & Suggestions API

#### POST /api/autodetect

**Description**: Analyze image with Google Gemini Vision API

**Request Body**:
```typescript
{
  imageBase64: string;      // Required, base64-encoded image data
  mimeType?: string;        // Optional, default: 'image/jpeg'
}
```

**Response (200 OK)**:
```typescript
{
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  condition?: string;
  tags?: string[];
  estimatedPrice?: number;
}
```

**Error Responses**:
- `400 Bad Request`: Missing imageBase64
- `500 Internal Server Error`: AI API error or server error

---

#### GET /api/suggestions

**Description**: Get autocomplete suggestions from user's existing items

**Response (200 OK)**:
```typescript
{
  categories: string[];
  subcategories: string[];
  brands: string[];
  tags: string[];
  houses: string[];
  floors: string[];
  rooms: string[];
  cupboards: string[];
  shelves: string[];
  drawers: string[];
  containers: string[];
}
```

**Error Responses**:
- `500 Internal Server Error`: Server error

---

### 3.4 Analytics & Dashboard API

#### GET /api/dashboard/stats

**Description**: Get dashboard statistics and recent items

**Response (200 OK)**:
```typescript
{
  totalItems: number;
  totalFavorites: number;
  recentlyAdded: Item[];          // Last 5 items
  recentlyViewed: Item[];         // Last 5 viewed items
  totalValue: number;             // Sum of all item prices
  storageUsageCount: number;
  unreadNotificationsCount: number;
  warrantyAlertsCount: number;   // Warranties expiring within 60 days
}
```

---

#### GET /api/analytics

**Description**: Get analytics data for charts

**Response (200 OK)**:
```typescript
{
  itemsByCategory: Array<{
    name: string;
    count: number;
    value: number;
  }>;
  itemsByRoom: Array<{
    name: string;
    count: number;
  }>;
  monthlyActivity: Array<{
    month: string;              // "Jan", "Feb", etc.
    created: number;
    moved: number;
    deleted: number;
  }>;
  conditionBreakdown: Array<{
    name: string;               // "New", "Good", etc.
    count: number;
  }>;
}
```

---

#### POST /api/analytics/aggregate

**Description**: Execute MongoDB-style aggregation pipeline

**Request Body**:
```typescript
{
  pipeline: Array<{
    $match?: object;
    $group?: object;
    $sort?: object;
    $project?: object;
  }>;
}
```

**Example Pipeline**:
```json
{
  "pipeline": [
    { "$match": { "category": "Electronics" } },
    { "$group": { "_id": "$brand", "count": { "$sum": 1 } } },
    { "$sort": { "count": -1 } }
  ]
}
```

**Response (200 OK)**:
```typescript
{
  result: any[];              // Aggregated data
}
```

---

## 4. Component Specifications

### 4.1 AuthContext (React Context)

**File**: `src/context/AuthContext.jsx`

**Purpose**: Global authentication state management

**Interface**:
```typescript
interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}
```

**Implementation Details**:

```javascript
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token by fetching user
      api.getCurrentUser()
        .then(({ user }) => setUser(user))
        .catch(() => localStorage.removeItem('authToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { user, token } = await api.login(email, password);
    localStorage.setItem('authToken', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { user } = await api.updateProfile(updates);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      loading,
      login,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

### 4.2 ItemFormModal Component

**File**: `src/components/items/ItemFormModal.jsx`

**Props**:
```typescript
interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<Item>) => Promise<void>;
  initialData?: Item | null;      // For edit mode
  suggestions: Suggestions;        // Autocomplete data
}
```

**State**:
```typescript
interface ItemFormState {
  formData: {
    name: string;
    description: string;
    category: string;
    subcategory: string;
    brand: string;
    tags: string[];
    price: number;
    purchaseDate: string;
    warrantyDate: string;
    quantity: number;
    condition: string;
    priority: string;
    serialNumber: string;
    notes: string;
    isFavorite: boolean;
    location: Location;
    images: string[];
    videos: string[];
    documents: string[];
  };
  errors: Record<string, string>;
  isSubmitting: boolean;
  uploadProgress: number;
}
```

**Key Methods**:

```javascript
// Validate form before submission
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.name.trim()) {
    newErrors.name = 'Item name is required';
  }
  
  if (formData.price < 0) {
    newErrors.price = 'Price cannot be negative';
  }
  
  if (formData.quantity < 1) {
    newErrors.quantity = 'Quantity must be at least 1';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  
  try {
    await onSave(formData);
    onClose();
    resetForm();
  } catch (error) {
    setErrors({ submit: error.message });
  } finally {
    setIsSubmitting(false);
  }
};

// Handle image upload
const handleImageUpload = async (files) => {
  const uploadedUrls = [];
  
  for (const file of files) {
    // Convert to base64 or upload to CDN
    const url = await uploadImage(file);
    uploadedUrls.push(url);
  }
  
  setFormData(prev => ({
    ...prev,
    images: [...prev.images, ...uploadedUrls]
  }));
};

// Autocomplete filter
const getFilteredSuggestions = (field, inputValue) => {
  if (!inputValue) return suggestions[field] || [];
  
  return suggestions[field].filter(item =>
    item.toLowerCase().includes(inputValue.toLowerCase())
  );
};
```

---

### 4.3 LocationMapPage Component

**File**: `src/pages/LocationMapPage.jsx`

**Props**:
```typescript
interface LocationMapPageProps {
  onViewItem: (item: Item) => void;
  refreshTrigger: number;         // Triggers data refresh
}
```

**State**:
```typescript
interface MapState {
  items: Item[];
  loading: boolean;
  selectedItem: Item | null;
  mapCenter: [number, number];  // [lat, lng]
  mapZoom: number;
  filters: {
    category?: string;
    room?: string;
  };
}
```

**Key Methods**:

```javascript
// Fetch items with location data
useEffect(() => {
  const fetchItems = async () => {
    setLoading(true);
    try {
      const { items } = await api.getItems({ ...filters });
      setItems(items.filter(item => item.location));
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchItems();
}, [filters, refreshTrigger]);

// Convert location to coordinates (simplified)
const getCoordinates = (location) => {
  // In real implementation, use geocoding API or predefined coordinates
  const roomCoordinates = {
    'Living Room': [40.7128, -74.0060],
    'Bedroom': [40.7130, -74.0062],
    'Kitchen': [40.7126, -74.0058],
    // ... etc
  };
  
  return roomCoordinates[location.room] || [40.7128, -74.0060];
};

// Handle marker click
const handleMarkerClick = (item) => {
  setSelectedItem(item);
  setMapCenter(getCoordinates(item.location));
  setMapZoom(16);
};

// Cluster markers for performance
const getClusteredMarkers = (items) => {
  // Group items by similar coordinates
  const clusters = {};
  
  items.forEach(item => {
    const coords = getCoordinates(item.location);
    const key = `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`;
    
    if (!clusters[key]) {
      clusters[key] = { coords, items: [] };
    }
    
    clusters[key].items.push(item);
  });
  
  return Object.values(clusters);
};
```

---

## 5. Algorithm Details

### 5.1 Search Algorithm

**Function**: `getItems(userId, options)`

**Purpose**: Filter, search, sort, and paginate items

**Pseudocode**:
```
FUNCTION getItems(userId, options):
  // Step 1: Filter by user and exclude deleted items
  result = items WHERE userId = userId AND isDeleted = false
  
  // Step 2: Apply search query (if provided)
  IF options.search EXISTS:
    searchTerm = options.search.toLowerCase()
    result = result WHERE (
      name.contains(searchTerm) OR
      description.contains(searchTerm) OR
      category.contains(searchTerm) OR
      brand.contains(searchTerm) OR
      serialNumber.contains(searchTerm) OR
      tags.any(tag => tag.contains(searchTerm)) OR
      location.room.contains(searchTerm) OR
      location.house.contains(searchTerm)
    )
  
  // Step 3: Apply filters
  IF options.category EXISTS:
    result = result WHERE category = options.category
  
  IF options.subcategory EXISTS:
    result = result WHERE subcategory = options.subcategory
  
  IF options.brand EXISTS:
    result = result WHERE brand = options.brand
  
  IF options.room EXISTS:
    result = result WHERE location.room = options.room
  
  IF options.condition EXISTS:
    result = result WHERE condition = options.condition
  
  IF options.priority EXISTS:
    result = result WHERE priority = options.priority
  
  IF options.isFavorite = true:
    result = result WHERE isFavorite = true
  
  IF options.tag EXISTS:
    result = result WHERE tags.includes(options.tag)
  
  // Step 4: Sort results
  sortBy = options.sortBy OR 'createdAt'
  sortOrder = options.sortOrder OR 'desc'
  
  result = sort(result, (a, b) => {
    valueA = a[sortBy]
    valueB = b[sortBy]
    
    // Convert dates to timestamps for comparison
    IF sortBy IN ['createdAt', 'updatedAt', 'warrantyDate']:
      valueA = new Date(valueA).getTime()
      valueB = new Date(valueB).getTime()
    
    // String comparison (case-insensitive)
    IF typeof(valueA) = string:
      valueA = valueA.toLowerCase()
      valueB = valueB.toLowerCase()
    
    // Compare and apply sort order
    IF sortOrder = 'asc':
      RETURN valueA < valueB ? -1 : (valueA > valueB ? 1 : 0)
    ELSE:
      RETURN valueA > valueB ? -1 : (valueA < valueB ? 1 : 0)
  })
  
  // Step 5: Paginate results
  page = options.page OR 1
  limit = options.limit OR 24
  total = result.length
  totalPages = ceil(total / limit)
  
  startIndex = (page - 1) * limit
  endIndex = startIndex + limit
  paginatedItems = result.slice(startIndex, endIndex)
  
  // Step 6: Return results with pagination metadata
  RETURN {
    items: paginatedItems,
    pagination: {
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages
    }
  }
END FUNCTION
```

**Time Complexity**: O(n log n) where n = number of items (dominated by sorting)  
**Space Complexity**: O(n) for result arrays

---

### 5.2 Aggregation Pipeline Algorithm

**Function**: `aggregateItems(userId, pipeline)`

**Purpose**: Execute MongoDB-style multi-stage aggregation

**Pseudocode**:
```
FUNCTION aggregateItems(userId, pipeline):
  // Start with user's items
  result = getItems(userId)
  
  // Execute each stage in order
  FOR EACH stage IN pipeline:
    stageName = Object.keys(stage)[0]
    stageConfig = stage[stageName]
    
    SWITCH stageName:
      CASE '$match':
        result = applyMatch(result, stageConfig)
      
      CASE '$group':
        result = applyGroup(result, stageConfig)
      
      CASE '$sort':
        result = applySort(result, stageConfig)
      
      CASE '$project':
        result = applyProject(result, stageConfig)
  
  RETURN result
END FUNCTION

FUNCTION applyMatch(documents, matchConfig):
  RETURN documents WHERE ALL conditions in matchConfig are true
  
  // Support operators: $gt, $gte, $lt, $lte, $ne, $in
  FOR EACH field, value IN matchConfig:
    IF value is object AND value has operators:
      IF value.$gt EXISTS: filter WHERE doc[field] > value.$gt
      IF value.$gte EXISTS: filter WHERE doc[field] >= value.$gte
      IF value.$lt EXISTS: filter WHERE doc[field] < value.$lt
      IF value.$lte EXISTS: filter WHERE doc[field] <= value.$lte
      IF value.$ne EXISTS: filter WHERE doc[field] != value.$ne
      IF value.$in EXISTS: filter WHERE doc[field] IN value.$in
    ELSE:
      filter WHERE doc[field] = value
END FUNCTION

FUNCTION applyGroup(documents, groupConfig):
  groupField = groupConfig._id
  groups = new Map()
  
  // Group documents by specified field
  FOR EACH doc IN documents:
    groupKey = doc[groupField] IF groupField starts with '$'
              ELSE groupField
    
    IF NOT groups.has(groupKey):
      groups.set(groupKey, [])
    
    groups.get(groupKey).push(doc)
  
  // Apply aggregation operations
  result = []
  FOR EACH groupKey, groupDocs IN groups:
    groupedDoc = { _id: groupKey }
    
    FOR EACH field, expression IN groupConfig (excluding _id):
      IF expression.$sum EXISTS:
        IF expression.$sum is number:
          groupedDoc[field] = groupDocs.length * expression.$sum
        ELSE IF expression.$sum starts with '$':
          targetField = expression.$sum.substring(1)
          groupedDoc[field] = SUM(groupDocs, doc => doc[targetField])
      
      ELSE IF expression.$avg EXISTS:
        targetField = expression.$avg.substring(1)
        sum = SUM(groupDocs, doc => doc[targetField])
        groupedDoc[field] = sum / groupDocs.length
      
      ELSE IF expression.$count EXISTS:
        groupedDoc[field] = groupDocs.length
    
    result.push(groupedDoc)
  
  RETURN result
END FUNCTION

FUNCTION applySort(documents, sortConfig):
  RETURN documents sorted by fields in sortConfig
  
  // Sort by multiple fields in order specified
  SORT documents BY (a, b) => {
    FOR EACH field, direction IN sortConfig:
      dir = (direction = -1 OR direction = 'desc') ? -1 : 1
      
      IF a[field] < b[field]: RETURN -1 * dir
      IF a[field] > b[field]: RETURN 1 * dir
    
    RETURN 0
  }
END FUNCTION

FUNCTION applyProject(documents, projectConfig):
  RETURN documents mapped to new shape
  
  // Select or transform fields
  FOR EACH doc IN documents:
    projected = {}
    
    FOR EACH field, include IN projectConfig:
      IF include = 1 OR include = true:
        projected[field] = doc[field]
      
      ELSE IF include starts with '$':
        sourceField = include.substring(1)
        projected[field] = doc[sourceField]
    
    result.push(projected)
END FUNCTION
```

**Example Usage**:
```javascript
// Get total value by category
const pipeline = [
  { $match: { price: { $gt: 0 } } },
  { $group: {
      _id: '$category',
      totalValue: { $sum: '$price' },
      count: { $sum: 1 },
      avgPrice: { $avg: '$price' }
    }
  },
  { $sort: { totalValue: -1 } },
  { $project: { category: '$_id', totalValue: 1, count: 1 } }
];

const result = db.aggregateItems(userId, pipeline);
// Output: [
//   { _id: 'Electronics', category: 'Electronics', totalValue: 5000, count: 10 },
//   { _id: 'Furniture', category: 'Furniture', totalValue: 3000, count: 5 },
//   ...
// ]
```

---

### 5.3 Autocomplete Suggestions Generator

**Function**: `getSuggestions(userId)`

**Purpose**: Extract unique values from user's items for autocomplete

**Pseudocode**:
```
FUNCTION getSuggestions(userId):
  userItems = items WHERE userId = userId AND isDeleted = false
  
  // Initialize Sets for unique values
  categories = new Set()
  subcategories = new Set()
  brands = new Set()
  tags = new Set()
  houses = new Set()
  floors = new Set()
  rooms = new Set()
  cupboards = new Set()
  shelves = new Set()
  drawers = new Set()
  containers = new Set()
  
  // Iterate through all items and collect values
  FOR EACH item IN userItems:
    IF item.category: categories.add(item.category)
    IF item.subcategory: subcategories.add(item.subcategory)
    IF item.brand: brands.add(item.brand)
    
    IF item.tags:
      FOR EACH tag IN item.tags:
        tags.add(tag)
    
    IF item.location:
      IF item.location.house: houses.add(item.location.house)
      IF item.location.floor: floors.add(item.location.floor)
      IF item.location.room: rooms.add(item.location.room)
      IF item.location.cupboard: cupboards.add(item.location.cupboard)
      IF item.location.shelf: shelves.add(item.location.shelf)
      IF item.location.drawer: drawers.add(item.location.drawer)
      IF item.location.container: containers.add(item.location.container)
  
  // Convert Sets to sorted Arrays
  RETURN {
    categories: Array.from(categories).sort(),
    subcategories: Array.from(subcategories).sort(),
    brands: Array.from(brands).sort(),
    tags: Array.from(tags).sort(),
    houses: Array.from(houses).sort(),
    floors: Array.from(floors).sort(),
    rooms: Array.from(rooms).sort(),
    cupboards: Array.from(cupboards).sort(),
    shelves: Array.from(shelves).sort(),
    drawers: Array.from(drawers).sort(),
    containers: Array.from(containers).sort()
  }
END FUNCTION
```

**Time Complexity**: O(n * m) where n = items, m = average tags per item  
**Space Complexity**: O(k) where k = total unique values

---

## 6. Error Handling

### 6.1 Frontend Error Handling

**Strategy**: Try-Catch with User-Friendly Messages

```javascript
// API Service Layer
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.error || 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.error || 'An unexpected error occurred.';
    }
  } else if (error.request) {
    // Request made but no response received
    return 'Network error. Please check your internet connection.';
  } else {
    // Error setting up request
    return error.message || 'An unexpected error occurred.';
  }
};

// Usage in Component
const handleSaveItem = async (itemData) => {
  try {
    await api.createItem(itemData);
    addToast('success', 'Item Saved', 'Item added to vault successfully.');
  } catch (error) {
    const errorMessage = handleApiError(error);
    addToast('error', 'Save Failed', errorMessage);
  }
};
```

### 6.2 Backend Error Handling

**Strategy**: Centralized Error Middleware

```javascript
// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }
  
  // Database errors
  if (err.code === 'ENOENT') {
    return res.status(500).json({
      error: 'Database file not found'
    });
  }
  
  // Default server error
  res.status(500).json({
    error: err.message || 'Internal server error'
  });
};

// Register middleware
app.use(errorHandler);

// Usage in Route Handlers
app.post('/api/items', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const itemData = req.body;
    
    if (!itemData.name) {
      throw new Error('Item name is required');
    }
    
    const newItem = db.createItem(userId, itemData);
    res.status(201).json({ item: newItem });
  } catch (error) {
    next(error);  // Pass to error handler
  }
});
```

### 6.3 Validation Rules

**Server-Side Validation**:

```javascript
const validateItemData = (itemData) => {
  const errors = [];
  
  // Required fields
  if (!itemData.name || itemData.name.trim() === '') {
    errors.push('Item name is required');
  }
  
  if (itemData.name && itemData.name.length > 200) {
    errors.push('Item name cannot exceed 200 characters');
  }
  
  // Numeric validations
  if (itemData.price !== undefined) {
    if (isNaN(itemData.price) || itemData.price < 0) {
      errors.push('Price must be a non-negative number');
    }
  }
  
  if (itemData.quantity !== undefined) {
    if (!Number.isInteger(itemData.quantity) || itemData.quantity < 1) {
      errors.push('Quantity must be a positive integer');
    }
  }
  
  // Enum validations
  const validConditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  if (itemData.condition && !validConditions.includes(itemData.condition)) {
    errors.push('Invalid condition value');
  }
  
  const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
  if (itemData.priority && !validPriorities.includes(itemData.priority)) {
    errors.push('Invalid priority value');
  }
  
  // Date validations
  if (itemData.purchaseDate && !isValidDate(itemData.purchaseDate)) {
    errors.push('Invalid purchase date format (use YYYY-MM-DD)');
  }
  
  if (itemData.warrantyDate && !isValidDate(itemData.warrantyDate)) {
    errors.push('Invalid warranty date format (use YYYY-MM-DD)');
  }
  
  // Array validations
  if (itemData.tags && !Array.isArray(itemData.tags)) {
    errors.push('Tags must be an array');
  }
  
  if (itemData.images && !Array.isArray(itemData.images)) {
    errors.push('Images must be an array');
  }
  
  return errors;
};

const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};
```

---

## 7. Code Standards

### 7.1 Naming Conventions

**Variables & Functions**:
- Use camelCase: `getUserById`, `itemCount`, `isAuthenticated`
- Boolean variables prefix with `is`, `has`, `should`: `isOpen`, `hasPermission`
- Event handlers prefix with `handle`: `handleSubmit`, `handleClick`

**Components**:
- Use PascalCase: `ItemCard`, `DashboardPage`, `AutoDetectModal`
- Suffix with type if not obvious: `ItemFormModal`, `ConfirmModal`

**Constants**:
- Use UPPER_SNAKE_CASE: `JWT_SECRET`, `API_BASE_URL`, `MAX_FILE_SIZE`

**Files**:
- Components: PascalCase with `.jsx` extension
- Utilities: camelCase with `.js` extension
- Config: kebab-case with `.js` or `.json` extension

### 7.2 Code Organization

**File Structure**:
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Reusable UI components
│   ├── items/          # Item-related components
│   └── jslab/          # JavaScript lab components
├── context/            # React context providers
├── pages/              # Page-level components
├── services/           # API and external services
├── server/             # Backend logic (db, services)
├── types/              # Type definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── constants/          # App-wide constants
```

### 7.3 Comments & Documentation

**JSDoc for Functions**:
```javascript
/**
 * Fetches items from the database with optional filtering and pagination
 * @param {string} userId - The user ID to filter items by
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search query string
 * @param {string} [options.category] - Filter by category
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=24] - Items per page
 * @returns {Promise<{items: Item[], pagination: Object}>} Items and pagination metadata
 * @throws {Error} If database query fails
 */
async function getItems(userId, options = {}) {
  // Implementation
}
```

**Concept Tags**:
```javascript
/**
 * @concept Aggregation pipelines
 * @description NoSQL Mongo-style multi-stage aggregation pipeline executor
 * @see https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
 */
function aggregateItems(userId, pipeline) {
  // Implementation
}
```

### 7.4 Testing Standards

**Unit Test Example**:
```javascript
import { describe, it, expect } from 'vitest';
import { validateItemData } from './validators';

describe('validateItemData', () => {
  it('should pass validation for valid item data', () => {
    const validItem = {
      name: 'Laptop',
      price: 999.99,
      quantity: 1,
      condition: 'New'
    };
    
    const errors = validateItemData(validItem);
    expect(errors).toHaveLength(0);
  });
  
  it('should fail validation for missing name', () => {
    const invalidItem = { price: 100 };
    
    const errors = validateItemData(invalidItem);
    expect(errors).toContain('Item name is required');
  });
  
  it('should fail validation for negative price', () => {
    const invalidItem = { name: 'Item', price: -10 };
    
    const errors = validateItemData(invalidItem);
    expect(errors).toContain('Price must be a non-negative number');
  });
});
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-18  
**Next Review**: 2026-09-18  
**Author**: Engineering Team  
**Approval**: Technical Lead
