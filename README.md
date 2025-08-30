# Construction Site AI Management Application

![Construction AI](https://img.shields.io/badge/Construction-AI-blue) ![Python](https://img.shields.io/badge/Python-3.8+-green) ![React](https://img.shields.io/badge/React-18.2-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-teal)

A comprehensive AI-powered construction site management application built with FastAPI backend, React frontend, and integrated machine learning capabilities for predictive analytics.

## 🏗️ Features

### Core Functionality
- **📦 Materials Management**: Track inventory, manage stock levels, supplier information
- **🛒 Purchase Orders**: Create, track, and manage procurement with automated workflows  
- **👷 Labour Management**: Worker assignments, task tracking, time logging, productivity analytics
- **⚠️ AI Delay Prediction**: Machine learning models predict project delays based on multiple factors
- **📊 Reports & Analytics**: Comprehensive reporting with CSV export capabilities
- **📁 File Upload**: Document management for blueprints, plans, and inspection reports

### AI & Machine Learning Features
- **Delay Risk Prediction**: Analyzes materials, weather, and labour data to predict delays
- **Supplier Recommendations**: AI suggests optimal suppliers based on price, reliability, and delivery performance  
- **Manpower Optimization**: Recommends optimal worker allocation for maximum efficiency
- **Material Demand Forecasting**: Predicts future material needs based on consumption patterns

### Technical Features
- **RESTful API**: Fully documented FastAPI backend with automatic OpenAPI documentation
- **JWT Authentication**: Secure token-based authentication system
- **Real-time Dashboard**: Live project statistics and KPI monitoring
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Database Agnostic**: Supports SQLite (development) and PostgreSQL (production)

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Automatic Setup

#### For Linux/Mac:
```bash
chmod +x setup.sh
./setup.sh
```

#### For Windows:
```batch
setup.bat
```

### Manual Setup

1. **Clone and setup backend**:
```bash
# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Setup database with demo data
python seed_data.py
```

2. **Setup frontend**:
```bash
cd frontend
npm install
```

3. **Start the application**:

Backend (Terminal 1):
```bash
python main.py
# Or use the script: ./run_backend.sh
```

Frontend (Terminal 2):
```bash
cd frontend
npm start
# Or use the script: ./run_frontend.sh
```

## 🔐 Login Credentials

The application comes with pre-configured demo users:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| manager | manager123 | Project Manager |

## 🌐 Access Points

- **Web Application**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs  
- **API Base URL**: http://localhost:8000

## 📚 API Documentation

The application provides comprehensive API documentation with interactive testing capabilities:

### Key Endpoints

#### Authentication
- `POST /token` - Login and get JWT token

#### Materials Management
- `GET /api/materials/` - List all materials
- `POST /api/materials/` - Create new material
- `GET /api/materials/low-stock` - Get low stock items
- `PUT /api/materials/{id}` - Update material
- `POST /api/materials/{id}/reorder` - Create reorder request

#### Purchase Orders
- `GET /api/purchase-orders/` - List purchase orders
- `POST /api/purchase-orders/` - Create new purchase order
- `POST /api/purchase-orders/{id}/receive` - Mark order as received

#### Labour Management  
- `GET /api/labour/workers` - List workers
- `GET /api/labour/tasks` - List tasks
- `POST /api/labour/time-logs` - Log work hours
- `GET /api/labour/productivity/{worker_id}` - Get productivity metrics

#### AI Predictions
- `POST /api/ai/predict-delay` - Run delay prediction
- `GET /api/ai/recommendations/suppliers` - Get supplier recommendations
- `GET /api/ai/recommendations/manpower` - Get manpower allocation suggestions

#### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/materials-report` - Generate materials report
- `GET /api/reports/labour-report` - Generate labour report

## 🏗️ Project Structure

```
construction-ai-app/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models and schemas
│   │   ├── routers/         # API route handlers
│   │   ├── services/        # Business logic services
│   │   └── ml/             # Machine learning models
│   ├── main.py             # FastAPI application entry point
│   ├── database.py         # Database configuration
│   ├── auth.py            # Authentication logic
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Main application pages
│   │   ├── contexts/      # React contexts for state management
│   │   └── services/      # API service layers
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
├── seed_data.py         # Database seeding script
├── setup.sh/.bat        # Setup scripts
└── README.md           # This file
```

## 🤖 AI Models

### Delay Prediction Model
- **Input Features**: Material availability, weather conditions, labour productivity, task complexity
- **Output**: Risk score (0-1), contributing factors, recommended actions
- **Algorithm**: Rule-based system (easily upgradeable to neural networks)

### Recommendation Engine
- **Supplier Optimization**: Analyzes price, reliability, delivery performance, and historical data
- **Manpower Allocation**: Considers workload, skills, and task requirements
- **Demand Forecasting**: Uses historical consumption patterns with seasonal adjustments

## 📊 Database Schema

### Core Entities
- **Materials**: Inventory items with stock levels and supplier information
- **Purchase Orders**: Procurement requests with items and tracking
- **Workers**: Personnel with skills and rates
- **Tasks**: Work assignments with time tracking
- **Time Logs**: Detailed work hour records
- **Delay Predictions**: AI model outputs with risk assessments

## 🔧 Configuration

### Environment Variables
```bash
DATABASE_URL=sqlite:///./construction_ai.db
SECRET_KEY=your-secret-key-here
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
```

### Database Options
- **Development**: SQLite (default, no setup required)
- **Production**: PostgreSQL (recommended for multi-user environments)

To switch to PostgreSQL:
1. Install PostgreSQL
2. Update `DATABASE_URL` in `.env` file
3. Install `psycopg2-binary` (already in requirements.txt)

## 📱 Frontend Features

### Responsive Design
- Mobile-first approach
- Collapsible sidebar navigation
- Touch-friendly interface
- Progressive Web App ready

### Key Components
- **Dashboard**: Real-time project statistics and quick actions
- **Materials**: Inventory management with low stock alerts
- **Purchase Orders**: Order tracking and receiving workflows
- **Labour**: Worker and task management with productivity analytics
- **Delay Risk**: AI predictions with visual risk indicators
- **Reports**: Data export and analytics

## 🧪 Testing

### Backend Testing
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment
1. Build production bundle:
```bash
cd frontend
npm run build
```
2. Serve static files with nginx or similar

### Database Migration
For production deployment:
```bash
# Install Alembic for migrations
pip install alembic

# Initialize migration environment
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

## 🛠️ Development

### Adding New Features
1. **Backend**: Add models in `app/models/`, create routes in `app/routers/`
2. **Frontend**: Create components in `src/components/`, pages in `src/pages/`  
3. **AI Models**: Extend functionality in `app/ml/`

### Code Style
- **Backend**: Follow PEP 8, use type hints
- **Frontend**: Use ESLint and Prettier configurations
- **Documentation**: Keep API docs updated

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start**:
- Ensure Python 3.8+ is installed
- Check if virtual environment is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`

**Frontend won't start**:
- Ensure Node.js 16+ is installed
- Delete `node_modules` and run `npm install` again
- Check if port 3000 is available

**Database issues**:
- Delete `construction_ai.db` and run `python seed_data.py` again
- Check file permissions in the application directory

**Login issues**:
- Use demo credentials: admin/admin123 or manager/manager123
- Clear browser cache and localStorage
- Check network tab for API connection issues

### Getting Help

1. Check the API documentation at http://localhost:8000/docs
2. Review browser console for frontend errors
3. Check backend logs in terminal
4. Ensure all services are running on correct ports

## 🎯 Roadmap

### Planned Features
- [ ] Advanced AI models (neural networks)
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Integration with external weather APIs
- [ ] Barcode/QR code scanning
- [ ] Advanced reporting with charts
- [ ] Multi-project support
- [ ] Role-based access control
- [ ] Audit logging
- [ ] API rate limiting

### Performance Improvements
- [ ] Database query optimization
- [ ] Frontend code splitting
- [ ] Caching layer
- [ ] Background job processing
- [ ] Real-time updates with WebSockets

## 📞 Support

For support and questions:
- 📧 Email: support@construction-ai.com
- 📖 Documentation: http://localhost:8000/docs
- 🐛 Issues: Create an issue in the repository

---

**Built with ❤️ for the Construction Industry**

*This application demonstrates modern full-stack development with AI integration, suitable for real-world construction project management.*
