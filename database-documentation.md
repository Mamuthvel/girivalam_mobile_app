# Supabase Database Documentation

## Project Overview
**Project ID:** czcbusmgirrbezojrxss  
**Database Type:** PostgreSQL (Supabase-managed)

---

## Table of Contents
1. [Database Tables](#database-tables)
2. [Database Functions](#database-functions)
3. [Storage Buckets](#storage-buckets)
4. [Security Overview](#security-overview)
5. [Database Schema Diagram](#database-schema-diagram)

---

## Database Tables

### 1. bookings
**Purpose:** Stores service booking information for users

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Reference to user |
| service_id | uuid | No | - | Reference to service |
| customer_name | text | No | - | Name of customer |
| customer_email | text | Yes | - | Email of customer |
| customer_phone | text | No | - | Phone number |
| booking_date | date | No | - | Date of booking |
| start_time | time | Yes | - | Start time |
| end_time | time | Yes | - | End time |
| guests_count | integer | No | 1 | Number of guests |
| status | text | No | 'pending' | Booking status |
| payment_status | text | No | 'pending' | Payment status |
| payment_id | text | Yes | - | Payment reference |
| total_amount | numeric | No | - | Total amount |
| currency | text | No | 'INR' | Currency code |
| special_requests | text | Yes | - | Special requests |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Update timestamp |

**RLS Policies:**
- `Users can view their own bookings` (SELECT): Users can only view bookings where auth.uid() matches user_id
- `Users can create their own bookings` (INSERT): Users can only create bookings with their own user_id
- `Users can update their own bookings` (UPDATE): Users can only update their own bookings
- **DELETE**: Not allowed for any user

**Security Notes:**
- Users are restricted to their own booking data
- No public access to bookings
- Deletion is disabled to maintain booking history

---

### 2. community_posts
**Purpose:** Social features for community engagement and sharing

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Post author |
| content | text | Yes | - | Post content |
| post_type | text | No | - | Type of post |
| image_url | text | Yes | - | Image URL |
| likes_count | integer | No | 0 | Number of likes |
| comments_count | integer | No | 0 | Number of comments |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Update timestamp |

**RLS Policies:**
- `Posts are viewable by everyone` (SELECT): Public read access
- `Authenticated users can create posts` (INSERT): Must be authenticated and own the post
- `Users can update their own posts` (UPDATE): Only the author can update
- `Users can delete their own posts` (DELETE): Only the author can delete

**Relationships:**
- Has many `post_likes`
- Has many `post_comments`

---

### 3. post_likes
**Purpose:** Track user likes on community posts

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| post_id | uuid | No | - | Reference to post |
| user_id | uuid | No | - | User who liked |
| created_at | timestamp with time zone | No | now() | Creation timestamp |

**RLS Policies:**
- `Likes are viewable by everyone` (SELECT): Public read access
- `Authenticated users can like posts` (INSERT): Users can like posts
- `Users can remove their own likes` (DELETE): Users can unlike posts
- **UPDATE**: Not allowed

---

### 4. post_comments
**Purpose:** Store comments on community posts

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| post_id | uuid | No | - | Reference to post |
| user_id | uuid | No | - | Comment author |
| content | text | No | - | Comment text |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Update timestamp |

**RLS Policies:**
- `Comments are viewable by everyone` (SELECT): Public read access
- `Authenticated users can comment` (INSERT): Authenticated users can comment
- `Users can update their own comments` (UPDATE): Only the author can update
- `Users can delete their own comments` (DELETE): Only the author can delete

---

### 5. groups
**Purpose:** Group management for pilgrimage groups

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| name | text | No | - | Group name |
| description | text | Yes | - | Group description |
| code | text | No | - | Unique join code |
| group_type | text | No | 'public' | 'public' or 'private' |
| password_hash | text | Yes | - | Password for private groups |
| creator_id | uuid | No | - | Group creator |
| is_active | boolean | No | true | Active status |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Update timestamp |

**RLS Policies:**
- `Groups are viewable by everyone` (SELECT): Public read access
- `Authenticated users can create groups` (INSERT): Must match creator_id
- `Group creators can update their groups` (UPDATE): Only creator can update
- **DELETE**: Not allowed

**Relationships:**
- Has many `group_members`
- Has many `group_messages`
- Has many `group_events`
- Has many `group_challenges`
- Has many `live_locations`

---

### 6. group_members
**Purpose:** Track group membership and member statistics

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| group_id | uuid | No | - | Reference to group |
| user_id | uuid | No | - | Reference to user |
| role | text | Yes | 'member' | Member role |
| is_active | boolean | No | true | Active status |
| joined_at | timestamp with time zone | No | now() | Join timestamp |
| location_sharing_enabled | boolean | No | false | Location sharing status |
| location_sharing_consented_at | timestamp with time zone | Yes | - | Consent timestamp |
| tracking_started_at | timestamp with time zone | Yes | - | Tracking start time |
| steps_count | integer | No | 0 | Step count |
| distance_km | numeric | No | 0 | Distance in kilometers |

**RLS Policies:**
- `Group members can view other members in same group` (SELECT): Uses is_group_member() function
- `Users can join groups` (INSERT): Must match user_id
- `Users can update their own membership` (UPDATE): Only own membership
- **DELETE**: Not allowed

---

### 7. group_messages
**Purpose:** Real-time chat messaging within groups

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| group_id | uuid | No | - | Reference to group |
| user_id | uuid | No | - | Message sender |
| content | text | No | - | Message content |
| message_type | text | No | 'text' | Type: 'text' or 'location' |
| metadata | jsonb | Yes | '{}' | Additional data |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Update timestamp |

**RLS Policies:**
- `Group members can view messages in their groups` (SELECT): Only group members
- `Group members can send messages to their groups` (INSERT): Must be active member
- `Users can update their own messages` (UPDATE): Only message author
- `Users can delete their own messages` (DELETE): Only message author

---

### 8. group_events
**Purpose:** Group-specific events and activities

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| group_id | uuid | Yes | - | Reference to group |
| title | text | No | - | Event title |
| description | text | Yes | - | Event description |
| event_type | text | Yes | 'general' | Type of event |
| start_date | timestamp with time zone | Yes | - | Start datetime |
| end_date | timestamp with time zone | Yes | - | End datetime |
| location_lat | numeric | Yes | - | Latitude |
| location_lng | numeric | Yes | - | Longitude |
| max_participants | integer | Yes | - | Max participants |
| created_by | uuid | Yes | - | Event creator |
| created_at | timestamp with time zone | Yes | now() | Creation timestamp |

**RLS Policies:**
- `Group members can view group events` (SELECT): Members of the group
- `Group admins can manage group events` (ALL): Admin and moderator roles only

---

### 9. group_challenges
**Purpose:** Track group challenges and competitions

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| group_id | uuid | Yes | - | Reference to group |
| title | text | No | - | Challenge title |
| description | text | Yes | - | Challenge description |
| challenge_type | text | Yes | 'steps' | Type of challenge |
| target_value | integer | Yes | - | Target to achieve |
| start_date | timestamp with time zone | Yes | - | Start datetime |
| end_date | timestamp with time zone | Yes | - | End datetime |
| is_active | boolean | Yes | true | Active status |
| reward_description | text | Yes | - | Reward details |
| created_by | uuid | Yes | - | Challenge creator |
| created_at | timestamp with time zone | Yes | now() | Creation timestamp |

**RLS Policies:**
- No RLS policies currently defined

---

### 10. live_locations
**Purpose:** Real-time location tracking for group members

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | User being tracked |
| group_id | uuid | No | - | Group context |
| latitude | numeric | No | - | Current latitude |
| longitude | numeric | No | - | Current longitude |
| accuracy | numeric | Yes | - | Location accuracy |
| heading | numeric | Yes | - | Direction heading |
| speed | numeric | Yes | - | Current speed |
| is_live | boolean | No | true | Live status |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Update timestamp |

**RLS Policies:**
- `Group members can view locations in their groups` (SELECT): Group members only
- `Users can update their own location` (INSERT): Must be group member
- `Users can update their own location data` (UPDATE): Own location only
- **DELETE**: Not allowed

---

### 11. profiles
**Purpose:** Extended user profile information

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Reference to auth.users |
| email | text | Yes | - | User email |
| display_name | text | Yes | - | Display name |
| role | text | Yes | 'user' | User role |
| language_preference | text | Yes | 'en' | Language code |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Update timestamp |

**RLS Policies (Multiple overlapping policies):**
- `Users can view profiles in their groups` (SELECT): Own profile or group members
- `Enable select own profile` (SELECT): Own profile
- `Allow read role for authenticated` (SELECT): All authenticated users
- `Users can insert their own profile` (INSERT): Must match user_id
- `Users can update their own profile` (UPDATE): Own profile only
- **DELETE**: Not allowed

**Important:** Automatically populated via `handle_new_user()` trigger on user signup

---

### 12. services
**Purpose:** Service catalog for bookings

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| name | text | No | - | Service name |
| description | text | Yes | - | Description |
| category | text | No | - | Service category |
| price | numeric | No | - | Price amount |
| currency | text | No | 'INR' | Currency code |
| duration_hours | integer | Yes | - | Duration in hours |
| max_capacity | integer | No | 1 | Max capacity |
| available_slots | integer | No | 1 | Available slots |
| location | text | Yes | - | Location |
| contact_phone | text | Yes | - | Contact phone |
| contact_email | text | Yes | - | Contact email |
| amenities | ARRAY | Yes | - | List of amenities |
| images | ARRAY | Yes | - | Image URLs |
| is_active | boolean | No | true | Active status |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Update timestamp |

**RLS Policies:**
- `Services are viewable by everyone` (SELECT): Public read access for active services
- `Only authenticated users can manage services` (ALL): Authenticated users only

---

### 13. service_providers
**Purpose:** External service provider directory

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| name | text | No | - | Provider name |
| category | text | No | - | Category |
| description | text | Yes | - | Description |
| address | text | Yes | - | Physical address |
| location_lat | numeric | Yes | - | Latitude |
| location_lng | numeric | Yes | - | Longitude |
| contact_phone | text | Yes | - | Contact phone |
| contact_email | text | Yes | - | Contact email |
| rating | numeric | Yes | - | Rating |
| review_count | integer | Yes | 0 | Review count |
| api_endpoint | text | Yes | - | API endpoint |
| api_key_hash | text | Yes | - | API key hash |
| is_active | boolean | Yes | true | Active status |
| created_at | timestamp with time zone | Yes | now() | Creation timestamp |
| updated_at | timestamp with time zone | Yes | now() | Update timestamp |

**RLS Policies:**
- `Service providers are viewable by all` (SELECT): Public read access for active providers
- **INSERT, UPDATE, DELETE**: Not allowed via RLS (admin-only operations)

---

### 14. spiritual_events
**Purpose:** Spiritual calendar events and festivals

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| title | text | No | - | Event title |
| description | text | Yes | - | Event description |
| event_type | text | Yes | 'festival' | Type of event |
| event_date | date | No | - | Event date |
| location_lat | numeric | Yes | - | Latitude |
| location_lng | numeric | Yes | - | Longitude |
| significance | text | Yes | - | Spiritual significance |
| traditions | text | Yes | - | Traditions |
| is_recurring | boolean | Yes | false | Recurring event |
| recurrence_pattern | text | Yes | - | Recurrence pattern |
| created_at | timestamp with time zone | Yes | now() | Creation timestamp |

**RLS Policies:**
- No RLS policies defined (likely admin-managed content)

---

### 15. mantra_audio
**Purpose:** Store audio files for mantras and chants

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| mantra_id | text | No | - | Mantra identifier |
| mantra_name | text | No | - | Mantra name |
| audio_url | text | No | - | Audio file URL |
| language | text | No | 'sanskrit' | Language |
| duration_seconds | integer | Yes | - | Duration in seconds |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Update timestamp |

**RLS Policies:**
- `Mantra audio is viewable by everyone` (SELECT): Public read access
- `Authenticated users can manage mantra audio` (ALL): Authenticated users can manage

---

### 16. user_analytics
**Purpose:** Track user events and analytics

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | Yes | - | User reference |
| event_type | text | No | - | Type of event |
| event_data | jsonb | Yes | - | Event data |
| created_at | timestamp with time zone | Yes | now() | Creation timestamp |

**RLS Policies:**
- `Users can view their own analytics` (SELECT): Own data only
- `Users can insert their own analytics` (INSERT): Own data only
- **UPDATE, DELETE**: Not allowed

---

### 17. support_messages
**Purpose:** Support chat messages

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | Yes | - | User reference |
| message | text | No | - | Message content |
| role | text | No | 'user' | Message role |
| created_at | timestamp with time zone | Yes | now() | Creation timestamp |

**RLS Policies:**
- `users can read their own messages` (SELECT): Own messages only
- `users can insert their own messages` (INSERT): Own messages only
- **UPDATE, DELETE**: Not allowed

---

### 18. offline_cache
**Purpose:** Client-side cache for offline functionality

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | Yes | - | User reference |
| cache_key | text | No | - | Cache key |
| cache_data | jsonb | Yes | - | Cached data |
| expires_at | timestamp with time zone | Yes | - | Expiration time |
| created_at | timestamp with time zone | Yes | now() | Creation timestamp |

**RLS Policies:**
- No RLS policies defined

---

### 19. emergency_alerts
**Purpose:** Emergency alert system

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint | No | - | Primary key |
| note | text | Yes | - | Alert note |
| created_at | timestamp with time zone | Yes | now() | Creation timestamp |

**RLS Policies:**
- No RLS policies defined

---

### 20. emergency_locations
**Purpose:** Emergency location tracking

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint | No | - | Primary key |
| latitude | double precision | Yes | - | Latitude |
| longitude | double precision | Yes | - | Longitude |
| reported_at | timestamp with time zone | Yes | now() | Report timestamp |

**RLS Policies:**
- No RLS policies defined

---

## Database Functions

### 1. generate_group_code()
**Purpose:** Generate unique 6-character group join codes  
**Type:** SECURITY DEFINER  
**Returns:** text  

**Logic:**
- Generates random 6-character uppercase codes
- Checks for uniqueness against existing groups
- Loops until unique code is found

---

### 2. is_group_member(target_group_id uuid)
**Purpose:** Check if current user is an active member of a group  
**Type:** SECURITY DEFINER, STABLE  
**Returns:** boolean  

**Logic:**
- Checks if auth.uid() exists in group_members for the target group
- Only returns true for active members

**Usage:** Used in RLS policies to verify group membership

---

### 3. handle_new_user()
**Purpose:** Automatically create profile when user signs up  
**Type:** SECURITY DEFINER, TRIGGER FUNCTION  
**Returns:** trigger  

**Logic:**
- Creates profile record on auth.users INSERT
- Extracts display_name from user metadata
- Falls back to email username if no display_name

**Trigger:** Attached to auth.users table

---

### 4. update_updated_at_column()
**Purpose:** Automatically update updated_at timestamp  
**Type:** TRIGGER FUNCTION  
**Returns:** trigger  

**Logic:**
- Sets updated_at to current timestamp on row update

---

## Storage Buckets

### 1. community-photos
**Type:** Public  
**Purpose:** Store user-uploaded photos for community posts

### 2. mantra-audio
**Type:** Public  
**Purpose:** Store audio files for mantras and spiritual content

---

## Security Overview

### Authentication
- Uses Supabase Auth with email/password and Google OAuth
- JWT tokens for API authentication
- Session management via localStorage

### Row-Level Security (RLS)
**Enabled on most tables** with policies for:
- User data isolation (users can only access their own data)
- Group-based access control (members can see group data)
- Public read access for content (posts, services, providers)
- Role-based permissions (admins, moderators)

### Security Definer Functions
Used to avoid infinite recursion in RLS policies:
- `is_group_member()` - Safe membership checking
- `has_role()` - Role verification (if implemented)

### Critical Security Notes
1. **User Data Isolation:** Most user-specific tables restrict access via user_id matching
2. **Group Access Control:** Group data requires active membership
3. **No Direct auth.users References:** Uses profiles table for user data
4. **Audit Trail:** Timestamps on all major tables, deletion disabled on critical tables
5. **Missing RLS on Some Tables:** emergency_alerts, emergency_locations, offline_cache, spiritual_events, group_challenges need review

---

## Database Schema Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         v                                  v
┌─────────────────┐              ┌──────────────────┐
│    profiles     │              │   bookings       │
│  - user_id (FK) │              │   - user_id      │
│  - display_name │              │   - service_id   │
│  - email        │              └──────────────────┘
│  - role         │                        │
└────────┬────────┘                        v
         │                        ┌──────────────────┐
         │                        │    services      │
         │                        │  - name          │
         │                        │  - price         │
         │                        └──────────────────┘
         │
         ├────────────────────────────────┐
         │                                │
         v                                v
┌─────────────────┐              ┌──────────────────┐
│     groups      │◄─────────────│  group_members   │
│  - creator_id   │              │  - group_id (FK) │
│  - name         │              │  - user_id (FK)  │
│  - code         │              │  - steps_count   │
└────────┬────────┘              └──────────────────┘
         │                                │
         ├────────────────────────────────┤
         │                                │
         v                                v
┌─────────────────┐              ┌──────────────────┐
│ group_messages  │              │  live_locations  │
│  - group_id (FK)│              │  - group_id (FK) │
│  - user_id (FK) │              │  - user_id (FK)  │
└─────────────────┘              └──────────────────┘
         │
         v
┌─────────────────┐              ┌──────────────────┐
│  group_events   │              │ group_challenges │
│  - group_id (FK)│              │  - group_id (FK) │
└─────────────────┘              └──────────────────┘

┌─────────────────┐
│ community_posts │◄──────┐
│  - user_id (FK) │       │
└────────┬────────┘       │
         │                │
         ├────────────────┼─────────────┐
         │                │             │
         v                v             v
┌─────────────────┐  ┌─────────────┐  ┌─────────────┐
│  post_likes     │  │post_comments│  │mantra_audio │
│  - post_id (FK) │  │- post_id(FK)│  └─────────────┘
│  - user_id (FK) │  │- user_id(FK)│
└─────────────────┘  └─────────────┘

┌──────────────────┐  ┌──────────────────┐
│service_providers │  │ spiritual_events │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ user_analytics   │  │support_messages  │
│  - user_id (FK)  │  │  - user_id (FK)  │
└──────────────────┘  └──────────────────┘
```

---

## Recommendations

### Security Improvements
1. **Add RLS to missing tables:** emergency_alerts, emergency_locations, offline_cache, spiritual_events, group_challenges
2. **Implement user roles table:** Instead of role in profiles, create separate user_roles table
3. **Review admin permissions:** service_providers should have admin-only INSERT/UPDATE/DELETE
4. **Add foreign key constraints:** Many relationships lack explicit FK constraints

### Data Integrity
1. **Add NOT NULL constraints:** user_id should not be nullable in user-related tables
2. **Add unique constraints:** Prevent duplicate group memberships
3. **Add check constraints:** Validate status fields, dates, numeric ranges

### Performance
1. **Add indexes:** On frequently queried columns (user_id, group_id, created_at)
2. **Optimize queries:** Use materialized views for analytics
3. **Implement pagination:** For large datasets like messages and posts

### Features
1. **Soft deletes:** Add deleted_at instead of hard deletes
2. **Audit logging:** Track who changed what and when
3. **Data archival:** Archive old bookings and messages

---

*Document generated on: 2025*  
*Database version: PostgreSQL (Supabase)*
