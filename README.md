# 🏔️ Kawan Hiking - Platform Booking Trip Pendakian

<div align="center">

![Kawan Hiking](https://img.shields.io/badge/Kawan-Hiking-emerald?style=for-the-badge&logo=mountain)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Midtrans](https://img.shields.io/badge/Payment-Midtrans-blue?style=for-the-badge)

**Platform booking trip pendakian gunung yang modern, lengkap dengan sistem pembayaran, reviews, dan admin panel.**

[🚀 Demo](#) • [📖 Dokumentasi](#dokumentasi) • [🐛 Report Bug](https://github.com/Ballon14/kawan-hiking-fullstack/issues)

---

</div>

## 📋 Daftar Isi

- [Tentang Projekt](#-tentang-project)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Penggunaan](#-penggunaan)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Tentang Project

**Kawan Hiking** adalah platform booking trip pendakian gunung yang memudahkan:
- 👥 **User** untuk mencari, memesan, dan mereview trip pendakian
- 🏢 **Admin** untuk mengelola destinasi, trip, guide, dan user
- 💳 **Payment** terintegrasi langsung dengan Midtrans

### ✨ Kenapa Kawan Hiking?

- ✅ **Modern UI/UX** - Dark theme, smooth animations, responsive design
- ✅ **Complete Features** - Booking, payment, reviews, chat support
- ✅ **Production Ready** - Security, error handling, performance optimized
- ✅ **Admin Friendly** - Full CRUD operations, user management
- ✅ **User Friendly** - Easy search, filter, and booking process

---

## 🚀 Fitur Utama

### 👤 User Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 Authentication | Register & Login dengan JWT | ✅ |
| 🏔️ Browse Destinations | Cari destinasi dengan search & filter | ✅ |
| 🎒 Open Trip Booking | Booking trip public dengan sistem kuota | ✅ |
| 🔒 Private Trip Request | Request trip custom untuk grup | ✅ |
| 💳 Payment Gateway | Integrasi Midtrans (semua metode) | ✅ |
| ⭐ Reviews & Ratings | Beri review & rating 5-star | ✅ |
| 💬 Community Chat | Chat public dengan sesama pendaki | ✅ |
| 🆘 Support Chat | Chat langsung dengan admin | ✅ |
| 📱 My Trips | Riwayat booking & payment | ✅ |
| 👨‍🏫 Guide Profiles | Lihat profil & pengalaman guide | ✅ |
| 📄 FAQ & About | Halaman informasi lengkap | ✅ |

### 🔧 Admin Features

| Feature | Description | Status |
|---------|-------------|--------|
| 📊 Dashboard | Overview & statistics | ✅ |
| 🏔️ Manage Destinations | CRUD destinasi pendakian | ✅ |
| 🎒 Manage Open Trips | CRUD open trip offerings | ✅ |
| 🔒 Manage Private Trips | Kelola request private trip | ✅ |
| 👨‍🏫 Manage Guides | CRUD guide profiles | ✅ |
| 👥 **User Management** | Kelola users & roles | ✅ NEW |
| 💬 Support Chat | Respond to user messages | ✅ |
| 📸 **Image Upload** | Upload foto langsung | ✅ NEW |
| 🔍 Search & Filter | Cari & filter semua data | ✅ |

### 🎨 UX Enhancements

- ✅ **Toast Notifications** - Feedback modern tanpa alert()
- ✅ **Loading States** - Spinner & skeleton screens
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Empty States** - Engaging empty state designs
- ✅ **Responsive Design** - Perfect di mobile & desktop
- ✅ **Dark Theme** - Modern dark mode throughout

---

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** React Hooks + Context API
- **Notifications:** react-hot-toast
- **Image Upload:** HTML5 File API + Custom upload endpoint

### Backend
- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Database:** MongoDB (via mongodb driver)
- **Authentication:** JWT (jsonwebtoken + bcrypt)
- **File Storage:** Local filesystem (extensible to cloud)

### Payment & Integration
- **Payment Gateway:** Midtrans Payment Gateway
- **Methods:** Credit Card, Bank Transfer, E-wallet, etc.
- **Webhook:** Real-time payment notification

### DevOps
- **Version Control:** Git & GitHub
- **Package Manager:** npm
- **Environment:** .env configuration

---

## 📦 Instalasi

### Prerequisites

Pastikan sudah terinstall:
- Node.js 18+ 
- npm atau yarn
- MongoDB (local atau Atlas)
- Git

### Step-by-Step Installation

1. **Clone Repository**
```bash
git clone https://github.com/Ballon14/kawan-hiking-fullstack.git
cd kawan-hiking-fullstack
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` dan isi dengan credentials Anda:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Open Browser**
```
http://localhost:3000
```

---

## ⚙️ Konfigurasi

### MongoDB Setup

**Option 1: MongoDB Atlas (Cloud)**
1. Buat account di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster & database
3. Get connection string
4. Paste ke `MONGODB_URI` di `.env`

**Option 2: MongoDB Local**
1. Install MongoDB di komputer
2. Jalankan `mongod`
3. Connection string: `mongodb://localhost:27017/kawan_hiking`

### Midtrans Setup

1. **Register** di [Midtrans](https://dashboard.midtrans.com)
2. Pilih environment:
   - **Sandbox** untuk testing
   - **Production** untuk live
3. Get credentials:
   - Server Key → `MIDTRANS_SERVER_KEY`
   - Client Key → `MIDTRANS_CLIENT_KEY`
4. Setup notification URL di dashboard:
   ```
   https://your-domain.com/api/midtrans-webhook
   ```

### Default Admin Account

Buat admin pertama via MongoDB atau register lalu update role:
```javascript
// Via MongoDB Compass/Shell
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 🎮 Penggunaan

### User Flow

1. **Register/Login** → `/register` atau `/login`
2. **Browse Destinations** → `/destinasi`
3. **Pilih Trip** → `/open-trip/[id]`
4. **Register Trip** → Klik "Daftar Sekarang"
5. **Payment** → Pilih metode pembayaran
6. **My Trips** → Track pembayaran di `/my-trip`
7. **Review Trip** → Beri review setelah trip

### Admin Flow

1. **Login as Admin** → `/login` (dengan akun admin)
2. **Admin Panel** → Otomatis redirect ke `/admin`
3. **Manage Content:**
   - Destinations → `/admin/destinasi`
   - Open Trips → `/admin/open-trips`
   - Guides → `/admin/guides`
   - Users → `/admin/users` 🆕
4. **Upload Images** → Gunakan file upload di setiap form
5. **Support Chat** → `/admin/chat`

---

## 📡 API Documentation

### Authentication APIs

```typescript
// Register
POST /api/auth/register
Body: { username, email, password, nama }

// Login
POST /api/auth/login
Body: { email, password }

// Get Profile
GET /api/auth/profile
Headers: { Authorization: Bearer <token> }

// Update Profile
PUT /api/auth/profile
Body: { nama, email, ... }
```

### Destinations APIs

```typescript
// Get All Destinations
GET /api/destinations
Query: ?search=bromo&difficulty=sedang

// Get Single Destination
GET /api/destinations/[id]

// Create (Admin)
POST /api/destinations
Body: { nama_destinasi, lokasi, ketinggian, ... }

// Update (Admin)
PUT /api/destinations/[id]

// Delete (Admin)
DELETE /api/destinations/[id]
```

### Open Trips APIs

```typescript
// Get All Open Trips
GET /api/open-trips

// Get Single Trip
GET /api/open-trips/[id]

// Register to Trip
POST /api/open-trips/[id]/register
Body: { id_user }

// My Registrations
GET /api/open-trips/my/registrations
```

### Reviews APIs 🆕

```typescript
// Get Reviews
GET /api/reviews
Query: ?trip_id=xxx&trip_type=open_trip

// Post Review
POST /api/reviews
Body: { trip_id, trip_type, rating, comment }
```

### User Management APIs 🆕

```typescript
// Get All Users (Admin)
GET /api/admin/users
Query: ?search=john&role=admin

// Get User Detail (Admin)
GET /api/admin/users/[id]

// Update User (Admin)
PUT /api/admin/users/[id]
Body: { nama, email, role }

// Delete User (Admin)
DELETE /api/admin/users/[id]
```

### Payment APIs

```typescript
// Create Payment
POST /api/payment/create
Body: { trip_id, amount, user_id }

// Midtrans Webhook
POST /api/midtrans-webhook
Body: { ... midtrans notification }
```

---

## 📸 Screenshots

### User Interface

**Homepage**
- Hero section dengan CTA
- Featured destinations
- Why choose us section

**Destinasi Page**
- Grid destinasi dengan foto
- Search & filter functionality
- Difficulty badges

**Trip Detail**
- Comprehensive trip information
- Booking form
- Reviews & ratings section ⭐

**Payment Page**
- Midtrans payment interface
- Multiple payment methods
- Real-time status update

### Admin Panel

**Dashboard**
- Statistics overview
- Quick access menu
- Fixed sidebar navigation 🆕

**Manage Destinations**
- Table dengan search
- CRUD operations
- Image upload preview 🆕

**User Management** 🆕
- User list dengan roles
- Edit user details
- Role management (User ↔️ Admin)

---

## 🏗️ Project Structure

```
kawan-hiking/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin panel pages
│   │   ├── destinasi/      # Manage destinations
│   │   ├── open-trips/     # Manage open trips
│   │   ├── guides/         # Manage guides
│   │   ├── users/          # User management 🆕
│   │   └── chat/           # Support chat
│   ├── api/                # API routes
│   │   ├── auth/          # Authentication
│   │   ├── destinations/  # Destinations CRUD
│   │   ├── open-trips/    # Trips CRUD
│   │   ├── reviews/       # Reviews API 🆕
│   │   ├── admin/         # Admin-only APIs
│   │   └── payment/       # Payment handling
│   ├── destinasi/         # Public destinations page
│   ├── open-trip/         # Trip browsing & booking
│   ├── my-trip/           # User trip history
│   ├── faq/               # FAQ page 🆕
│   ├── tentang/           # About page 🆕
│   └── ...
├── components/             # React components
│   ├── ToastProvider.js   # Toast notifications 🆕
│   ├── ReviewSection.js   # Reviews component 🆕
│   ├── StarRating.js      # Star rating input 🆕
│   └── ...
├── lib/                    # Utilities & helpers
│   ├── mongodb.js         # MongoDB connection
│   ├── auth.js            # Auth middleware
│   ├── api-client.js      # API wrapper
│   └── toast.js           # Toast utility 🆕
├── contexts/              # React contexts
│   └── AuthContext.js     # Auth state management
├── public/                # Static files
└── .env.example           # Environment template
```

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt encryption
- ✅ **Role-Based Access** - Admin vs User permissions
- ✅ **API Route Protection** - Middleware guards
- ✅ **Input Validation** - Server-side validation
- ✅ **CORS Handling** - Proper cross-origin setup
- ✅ **Webhook Verification** - Midtrans signature check
- ✅ **Self-Protection** - Admins can't delete/demote self 🆕
- 🔄 **Recommended:** Rate limiting, CSRF tokens

---

## 🚀 Deployment

### Vercel (Recommended for Next.js)

1. Push ke GitHub
2. Import di [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy!

### Environment Variables untuk Production

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
MIDTRANS_SERVER_KEY=SB-Mid-server-... (atau production)
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Post-Deployment Checklist

- [ ] SSL certificate active
- [ ] Domain configured
- [ ] MongoDB Atlas (production tier)
- [ ] Midtrans production mode
- [ ] Environment variables set
- [ ] Webhook URL updated
- [ ] Admin account created
- [ ] Test booking flow
- [ ] Test payment flow

---

## 🧪 Testing

### Manual Testing Checklist

**User Flow:**
- [ ] Register new user
- [ ] Login & logout
- [ ] Browse destinations
- [ ] Search & filter
- [ ] Book open trip
- [ ] Complete payment
- [ ] Submit review
- [ ] Chat in community
- [ ] View my trips

**Admin Flow:**
- [ ] Login as admin
- [ ] Create destination
- [ ] Upload image
- [ ] Create open trip
- [ ] View registrations
- [ ] Manage users 🆕
- [ ] Change user role 🆕
- [ ] Respond to chat

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test before committing
- Update README if needed

---

## 📝 Changelog

### Version 2.0 (Latest) - Dec 30, 2025 🆕

**New Features:**
- ✨ Toast notifications (replaced all alerts)
- ⭐ Reviews & ratings system
- 🔍 Search & filter destinations
- 📸 Image upload for all admin pages
- 👥 User management system
- 📄 FAQ & About pages
- 🔒 Fixed admin sidebar

**Improvements:**
- Better UX with modern feedback
- Enhanced admin workflow
- Improved security (self-protection)
- Next.js 15 compatibility

### Version 1.0 - Earlier

**Core Features:**
- Authentication & authorization
- Destination management
- Open trip booking
- Payment gateway integration
- Admin panel
- Community chat

---

## 🐛 Known Issues

None reported! 🎉

If you find any bugs, please report via [GitHub Issues](https://github.com/Ballon14/kawan-hiking-fullstack/issues).

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Midtrans Documentation](https://docs.midtrans.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 📄 License

This project is licensed under the MIT License - see full terms below:

```
MIT License

Copyright (c) 2025 Kawan Hiking

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

**Developed by Iqbaldev**

- GitHub: [@Ballon14](https://github.com/Ballon14)
- Project: [Kawan Hiking](https://github.com/Ballon14/kawan-hiking-fullstack)

---

## 🌟 acknowledgments

- Next.js team for the amazing framework
- MongoDB for flexible database solution
- Midtrans for payment gateway integration
- Open source community for inspiration

---

## 💬 Support

Butuh bantuan? 

- 📧 Email: support@kawanhiking.com (example)
- 💬 GitHub Issues: [Report Bug](https://github.com/Ballon14/kawan-hiking-fullstack/issues)
- 📖 Documentation: [Read the docs](#dokumentasi)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ and ☕ by Iqbaldev**

[⬆ Back to Top](#-kawan-hiking---platform-booking-trip-pendakian)

</div>
