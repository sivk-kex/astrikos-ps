# AstriVerse Platform API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [2D Vector Assets](#2d-vector-assets)
3. [3D Model Assets](#3d-model-assets)
4. [Map Assets](#map-assets)
5. [Scene Builder](#scene-builder)
6. [Export & Share](#export--share)
7. [Installation](#installation)
8. [Configuration](#configuration)
9. [File Structure](#file-structure)

---

## Clone frontEndImplementation

## Authentication

### Get Session Info
```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://avatars.githubusercontent.com/u/1234567"
  },
  "expires": "2023-12-31T23:59:59.999Z"
}
```

## 2D Vector Assets

### Upload Vector File
```http
POST /api/vector2d/upload
Content-Type: multipart/form-data
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | file | Yes | SVG/AI/EPS file |
| tags | string | No | Comma-separated tags |
| ownerID | string | Yes | User ID |

### Get Vector Asset
```http
GET /api/vector2d/:id
```

### Delete Vector Asset
```http
DELETE /api/vector2d/:id
```

### List All Vectors
```http
GET /api/assets/vector2d
```

**Example Response:**
```json
[
  {
    "id": "vec_123",
    "filename": "rocket.svg",
    "tags": ["space", "ship"],
    "ownerID": "user_123",
    "url": "/uploads/2d/rocket.svg"
  }
]
```

## 3D Model Assets

### Upload 3D Model
```http
POST /api/model3d/upload
Content-Type: multipart/form-data
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | file | Yes | .glb 3D model |
| tags | string | No | Model tags |
| ownerID | string | Yes | Owner user ID |

## Map Assets

### Upload GeoJSON Map
```http
POST /api/maps/upload
Content-Type: multipart/form-data
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | file | Yes | GeoJSON file |
| tags | string | No | Map tags |
| ownerID | string | Yes | Owner user ID |

## Scene Builder(Not implemented yet)

### Create Scene
```http
POST /api/scenes/create
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Space Scene",
  "description": "My first space scene",
  "ownerId": "user_123",
  "assets": [
    {
      "assetId": "mod_456",
      "type": "3d",
      "position": { "x": 10, "y": 5, "z": 0 },
      "rotation": { "x": 0, "y": 90, "z": 0 },
      "scale": { "x": 1, "y": 1, "z": 1 }
    }
  ]
}
```

## Export & Share(Not implemented yet)

### Export Scene
```http
GET /api/export/scene/:id
Accept: application/json
```

### Share Scene
```http
POST /api/share/scene
Content-Type: application/json
```

**Request Body:**
```json
{
  "sceneId": "scene_789"
}
```

**Response:**
```json
{
  "publicUrl": "https://astriverse.app/api/share/scene/abc123xyz"
}
```

## Installation

```bash
# Clone repository
git clone https://github.com/sivk-kex/astrikos-ps.git
cd astrikos-ps

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

## Configuration

**.env.local:**
```ini
MONGODB_URI=mongodb://localhost:27017/astriverse
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
```

## File Structure

```
public/
└── uploads/
    ├── 2d/
    │   └── [vector_files].svg
    ├── 3d/
    │   └── [model_files].gltf
    └── maps/
        └── [geojson_files].geojson
```