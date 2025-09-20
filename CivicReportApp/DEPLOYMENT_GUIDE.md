# 🚀 **Resolve360 Deployment Guide**

## **📱 For SIH Demo (Recommended)**

**Simple Development Server:**
```bash
npx expo start --clear
```
- ✅ **Instant QR code** for Expo Go
- ✅ **Live reload** for real-time updates
- ✅ **Perfect for judges** to test on their phones
- ✅ **No setup required**

## **🌐 For Production Publishing (Optional)**

### **Step 1: Install EAS CLI**
```bash
npm install -g @expo/eas-cli
```

### **Step 2: Login to Expo**
```bash
eas login
```
*Use your Expo account credentials*

### **Step 3: Configure Project**
```bash
eas update:configure
```
*This will set up your project for updates*

### **Step 4: Publish Update**
```bash
eas update --branch main --message "SIH 2024 - Resolve360 Ready"
```

### **Step 5: Build for App Stores (Advanced)**
```bash
# For iOS
eas build --platform ios

# For Android
eas build --platform android

# For both
eas build --platform all
```

## **🎯 SIH Competition Setup**

### **Quick Demo Commands:**
```bash
# 1. Start development server
npx expo start --clear

# 2. Open government dashboard
open CivivWebsite/government-dashboard.html

# 3. Demo login credentials
# Email: admin@gov.local
# Password: password123
```

## **📱 Demo Flow for Judges:**

### **Mobile App Demo:**
1. **Show QR code** from terminal
2. **Judge scans** with Expo Go app
3. **Navigate through**: Home → Report → My Reports → Profile
4. **Demonstrate AI features**: Voice input, smart categorization
5. **Submit test report** with photos and location

### **Government Dashboard Demo:**
1. **Open browser** to government dashboard
2. **Login** with demo credentials
3. **Show real-time sync** - reports appear automatically
4. **Click "Test Sync"** to generate varied reports
5. **Update report status** to show workflow

### **Integration Demo:**
1. **Submit report** on mobile
2. **Show instant sync** to dashboard
3. **Update status** on dashboard
4. **Show notification** system working

## **🔧 Troubleshooting**

### **If Expo Go doesn't work:**
```bash
# Clear cache and restart
npx expo start --clear --reset-cache
```

### **If EAS commands fail:**
```bash
# Check EAS CLI version
eas --version

# Update EAS CLI
npm install -g @expo/eas-cli@latest
```

### **If build fails:**
```bash
# Check project configuration
eas build:configure
```

## **📊 Project Status**

- ✅ **Development Ready** - Works with `npx expo start`
- ✅ **EAS Configured** - Ready for production publishing
- ✅ **GitHub Updated** - All code pushed
- ✅ **Demo Ready** - Perfect for SIH presentation

## **🏆 SIH Success Tips**

1. **Keep it simple** - Use `npx expo start` for demo
2. **Have backup** - Test on multiple devices
3. **Practice flow** - Know the demo sequence
4. **Highlight features** - AI, real-time sync, professional UI
5. **Show impact** - Complete citizen-to-government solution

**Your Resolve360 project is competition-ready!** 🎉