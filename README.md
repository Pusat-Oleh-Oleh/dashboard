# Pusat Oleh-Oleh Admin Dashboard

Admin dashboard untuk mengelola platform marketplace souvenir Pusat Oleh-Oleh. Menyediakan interface admin untuk manajemen user, produk, toko, transaksi, dan analytics.

##  Teknologi yang Digunakan

- **Framework**: React 18 dengan Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useContext)
- **HTTP Client**: Axios
- **Authentication**: JWT dengan Cookies (js-cookie)
- **Charts & Analytics**: Chart.js dengan react-chartjs-2
- **Icons**: Lucide React
- **UI Components**: Radix UI
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM
- **Build Tool**: Vite dengan plugin React

##  Struktur Folder

```
pusatoleholeh-admindashboard/
├── public/
│   ├── index.html             # HTML template
│   └── favicon.ico            # Favicon
├── src/
│   ├── api/
│   │   └── auth.js            # API functions untuk authentication
│   ├── components/
│   │   ├── charts/            # Chart components
│   │   │   ├── DoughnutChart.jsx
│   │   │   ├── LineChart.jsx
│   │   │   └── BarChart.jsx
│   │   ├── DropdownProfile.jsx # Profile dropdown component
│   │   └── [other components] # Komponen UI lainnya
│   ├── css/
│   │   └── style.css          # Custom CSS styles
│   ├── images/                # Static images
│   ├── pages/
│   │   ├── AdminManagement.jsx # Halaman manajemen admin
│   │   ├── AdminProfile.jsx   # Halaman profil admin
│   │   ├── Analytics.jsx      # Halaman analytics
│   │   ├── Dashboard.jsx      # Dashboard utama
│   │   ├── Login.jsx          # Halaman login
│   │   ├── Products.jsx       # Halaman manajemen produk
│   │   ├── Shops.jsx          # Halaman manajemen toko
│   │   ├── Transactions.jsx   # Halaman manajemen transaksi
│   │   ├── Users.jsx          # Halaman manajemen user
│   │   └── [other pages]      # Halaman lainnya
│   ├── partials/
│   │   ├── Header.jsx         # Header component
│   │   ├── Sidebar.jsx        # Sidebar navigation
│   │   └── [other partials]   # Partial components
│   ├── utils/
│   │   └── Utils.js           # Utility functions
│   ├── App.jsx                # Main App component
│   ├── index.css              # Global CSS dengan Tailwind
│   └── main.jsx               # Entry point aplikasi
├── .env                       # Environment variables
├── .gitignore                 # Git ignore file
├── index.html                 # Vite HTML template
├── package.json               # Dependencies dan scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.js             # Vite configuration
└── README.md                  # Dokumentasi project
```

##  Environment Variables

Buat file `.env` di root directory dengan konfigurasi berikut:

```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_CDN_URL=http://localhost:9000
```

## Cara Menjalankan

### Prerequisites

- Node.js (v16 atau lebih baru)
- npm atau yarn
- Backend API server (pusatoleholeh-backend) harus running

### Instalasi

1. **Clone repository dan navigate ke folder admin dashboard**
   ```bash
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env sesuai konfigurasi backend Anda
   ```

### Menjalankan Aplikasi

**Development Mode:**
```bash
npm run dev
```

**Build untuk Production:**
```bash
npm run build
```

**Preview Production Build:**
```bash
npm run preview
```

**Lint Code:**
```bash
npm run lint
```

Aplikasi akan berjalan di `http://localhost:5173/` (atau port lain jika 5173 sedang digunakan).

## Fitur Utama

### Dashboard & Analytics
- **Overview Dashboard**: Statistik utama dan metrics
- **Real-time Analytics**: Charts dan grafik interaktif
- **Data Visualization**: Donut charts, line charts, bar charts
- **Performance Metrics**: KPI tracking dan monitoring

### User Management
- **Admin Management**: CRUD operations untuk admin
- **User Overview**: Manajemen buyer dan seller
- **Role Management**: Pengaturan permission dan role
- **Profile Management**: Edit profil dan foto admin

### Content Management
- **Product Management**: Manajemen produk dan kategori
- **Shop Management**: Manajemen toko dan seller
- **Transaction Monitoring**: Tracking dan manajemen transaksi
- **Content Moderation**: Review dan approval system

### System Features
- **Authentication**: JWT-based login dengan session management
- **Photo Upload**: Upload dan manajemen foto profil
- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Mode**: Theme switching
- **Real-time Updates**: Live data updates
- **Search & Filter**: Advanced filtering capabilities

## UI/UX Features

- **Modern Design**: Clean dan professional interface
- **Responsive Layout**: Mobile-first responsive design
- **Interactive Charts**: Chart.js integration untuk visualisasi data
- **Toast Notifications**: User feedback dengan react-hot-toast
- **Loading States**: Smooth loading indicators
- **Error Handling**: Comprehensive error management
- **Accessibility**: ARIA labels dan keyboard navigation

## Pages Overview

### Dashboard
- Overview statistics
- Quick actions
- Recent activities
- Performance charts

### User Management
- **Users**: Buyer dan seller management
- **Admins**: Admin CRUD operations dengan photo management

### Commerce
- **Products**: Product management dan categorization
- **Shops**: Shop management dan seller tools
- **Transactions**: Order tracking dan payment management

### Analytics
- Revenue analytics
- User growth metrics
- Performance insights
- Custom date ranges

### Settings
- **Admin Profile**: Personal profile management dengan photo upload
- System configuration
- Security settings

## Authentication Flow

1. **Login**: Admin login dengan email/password
2. **JWT Token**: Token disimpan di cookies
3. **Protected Routes**: Route protection dengan middleware
4. **Auto Logout**: Token expiration handling
5. **Session Management**: Persistent login state

## Dependencies

**Production:**
- react & react-dom
- react-router-dom
- axios
- js-cookie
- react-hot-toast
- chart.js & react-chartjs-2
- lucide-react
- @radix-ui/react-*
- tailwindcss

**Development:**
- @vitejs/plugin-react
- vite
- eslint
- postcss
- autoprefixer

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable styled components
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Built-in theme switching
- **Color Palette**: Consistent color scheme dengan violet primary

## API Integration

Dashboard terintegrasi dengan backend API untuk:
- Authentication endpoints
- User management
- Admin operations
- File upload (photos)
- Real-time data fetching

## Development

### Adding New Pages
1. Create component di `src/pages/`
2. Add route di `App.jsx`
3. Update sidebar navigation di `Sidebar.jsx`
4. Add API calls di `src/api/`

### Styling Guidelines
- Gunakan Tailwind CSS classes
- Follow responsive design patterns
- Maintain consistent spacing dan typography
- Use dark mode compatible colors

### State Management
- Local state dengan useState
- Context API untuk global state
- Efficient re-rendering dengan useCallback/useMemo

## Testing

```bash
# Run tests (jika ada)
npm run test

# Lint check
npm run lint

# Build check
npm run build
```

## Deployment

1. **Build application**
   ```bash
   npm run build
   ```

2. **Deploy dist folder** ke hosting provider
3. **Configure environment variables** di production
4. **Setup reverse proxy** jika diperlukan


## License

This project is licensed under the MIT License.