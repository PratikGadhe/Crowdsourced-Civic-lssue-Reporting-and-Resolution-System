// Enhanced sync integration with varied dummy reports for Resolve360
class EnhancedDashboardSync {
    constructor() {
        this.syncKey = 'civicReports';
        this.lastSyncTime = Date.now();
        this.isPolling = false;
        this.reportCounter = 0;
        
        // Varied dummy reports for realistic testing
        this.dummyReports = [
            {
                title: "Large pothole on Main Street causing vehicle damage",
                description: "There is a dangerous pothole approximately 2 feet wide and 6 inches deep on Main Street near the intersection with Oak Avenue. Multiple vehicles have been damaged, and it poses a serious safety hazard especially during night hours.",
                category: "infrastructure",
                priority: "high",
                location: "Main Street & Oak Avenue Intersection",
                userType: "concerned_citizen"
            },
            {
                title: "Street light not working for 3 days",
                description: "The street light on Pine Avenue has been out for three consecutive days. This creates a safety concern for pedestrians and drivers, especially during evening hours. The area is poorly lit and accidents may occur.",
                category: "infrastructure", 
                priority: "medium",
                location: "Pine Avenue, Block 200",
                userType: "resident"
            },
            {
                title: "Water pipe burst flooding sidewalk",
                description: "A water main has burst on Elm Street causing significant flooding on the sidewalk and road. Water is continuously flowing and creating hazardous conditions. Immediate attention required to prevent further damage.",
                category: "infrastructure",
                priority: "critical",
                location: "Elm Street, Near City Park",
                userType: "emergency_reporter"
            },
            {
                title: "Overflowing garbage bins attracting pests",
                description: "The public garbage bins at Central Park have been overflowing for over a week. This is attracting rats, flies, and creating unsanitary conditions. Families with children are avoiding the area.",
                category: "environment",
                priority: "medium",
                location: "Central Park, East Entrance",
                userType: "parent"
            },
            {
                title: "Broken playground equipment - safety hazard",
                description: "The swing set at Riverside Park has broken chains and the slide has sharp edges. This poses a serious injury risk to children. The equipment needs immediate repair or removal until fixed.",
                category: "safety",
                priority: "high",
                location: "Riverside Park Playground",
                userType: "parent"
            },
            {
                title: "Traffic signal malfunction causing congestion",
                description: "The traffic light at the busy intersection of 5th and Broadway is stuck on red in all directions. This is causing major traffic backup during rush hour and confusion among drivers.",
                category: "transport",
                priority: "high",
                location: "5th Street & Broadway Intersection",
                userType: "commuter"
            },
            {
                title: "Illegal dumping in residential area",
                description: "Someone has dumped construction debris and old furniture behind the apartment complex on Maple Street. This is creating an eyesore and potential health hazard for residents.",
                category: "environment",
                priority: "low",
                location: "Maple Street Apartment Complex",
                userType: "resident"
            },
            {
                title: "Damaged sidewalk creating accessibility issues",
                description: "The sidewalk on Cherry Lane has multiple cracks and raised sections that make it impossible for wheelchairs and difficult for elderly residents to navigate safely.",
                category: "infrastructure",
                priority: "medium",
                location: "Cherry Lane, Residential Block",
                userType: "accessibility_advocate"
            }
        ];
    }

    // Initialize enhanced sync
    initialize() {
        console.log('🔄 Initializing Resolve360 dashboard sync...');
        this.startPolling();
        
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (e) => {
                if (e.key === this.syncKey) {
                    console.log('📡 New reports detected from Resolve360 mobile app');
                    this.handleNewReports();
                }
            });
        }
        
        setInterval(() => {
            this.syncReports();
        }, 10000);
    }

    // Start polling for new reports
    startPolling() {
        if (this.isPolling) return;
        
        this.isPolling = true;
        console.log('🔄 Started polling for new Resolve360 reports');
        
        const poll = () => {
            this.checkForNewReports();
            setTimeout(poll, 5000);
        };
        
        poll();
    }

    // Check for new reports
    checkForNewReports() {
        try {
            const stored = localStorage.getItem(this.syncKey);
            if (stored) {
                const reports = JSON.parse(stored);
                const newReports = reports.filter(report => 
                    new Date(report.timestamp).getTime() > this.lastSyncTime
                );
                
                if (newReports.length > 0) {
                    console.log(`📥 Found ${newReports.length} new Resolve360 report(s)`);
                    this.handleNewReports(newReports);
                    this.lastSyncTime = Date.now();
                }
            }
        } catch (error) {
            console.error('Error checking for new reports:', error);
        }
    }

    // Handle new reports
    handleNewReports(newReports = null) {
        if (typeof window.loadReportsFromStorage === 'function') {
            window.loadReportsFromStorage();
        }
        
        if (newReports && newReports.length > 0) {
            newReports.forEach(report => {
                this.showNewReportNotification(report);
            });
            
            if (typeof window.updateStats === 'function') {
                window.updateStats();
            }
            
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
        }
    }

    // Show notification for new report
    showNewReportNotification(report) {
        const message = `🚨 New ${report.priority} priority ${report.category} report: "${report.title}"`;
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
        }
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Resolve360 Report', {
                body: `${report.title} - ${report.location}`,
                icon: '/favicon.ico',
                tag: report.id
            });
        }
    }

    // Generate varied dummy report (cycles through different types)
    generateVariedDummyReport() {
        const template = this.dummyReports[this.reportCounter % this.dummyReports.length];
        this.reportCounter++;
        
        const userNames = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Wilson', 'David Brown', 'Emma Garcia'];
        const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
        
        return {
            id: 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: template.title,
            description: template.description,
            category: template.category,
            priority: template.priority,
            status: 'pending',
            location: template.location,
            coordinates: this.generateRandomCoordinates(),
            user: {
                name: randomUser,
                email: randomUser.toLowerCase().replace(' ', '.') + '@resolve360.com',
                phone: this.generateRandomPhone()
            },
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            aiAnalysis: {
                confidence: Math.random() * 0.3 + 0.7, // 70-100%
                tags: this.generateRelevantTags(template.category),
                estimatedResolutionTime: this.getEstimatedTime(template.priority),
                urgency: this.getUrgencyScore(template.priority)
            }
        };
    }

    // Generate random coordinates
    generateRandomCoordinates() {
        return {
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1
        };
    }

    // Generate random phone number
    generateRandomPhone() {
        return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    }

    // Generate relevant tags based on category
    generateRelevantTags(category) {
        const tagMap = {
            infrastructure: ['maintenance', 'repair', 'safety', 'public-works'],
            environment: ['sanitation', 'health', 'cleanup', 'waste-management'],
            safety: ['urgent', 'hazard', 'public-safety', 'emergency'],
            transport: ['traffic', 'congestion', 'signals', 'road-safety']
        };
        
        const baseTags = tagMap[category] || ['general', 'civic'];
        return baseTags.slice(0, Math.floor(Math.random() * 3) + 2);
    }

    // Get estimated resolution time based on priority
    getEstimatedTime(priority) {
        const timeMap = {
            critical: '2-6 hours',
            high: '1-2 days', 
            medium: '3-5 days',
            low: '1-2 weeks'
        };
        return timeMap[priority] || '3-5 days';
    }

    // Get urgency score based on priority
    getUrgencyScore(priority) {
        const scoreMap = {
            critical: 9,
            high: 7,
            medium: 5,
            low: 3
        };
        return scoreMap[priority] || 5;
    }

    // Enhanced simulate mobile report with varied data
    simulateVariedMobileReport() {
        const mockReport = this.generateVariedDummyReport();

        // Add to storage
        const existing = localStorage.getItem(this.syncKey);
        const reports = existing ? JSON.parse(existing) : [];
        reports.push(mockReport);
        localStorage.setItem(this.syncKey, JSON.stringify(reports));

        console.log('📱 Simulated varied Resolve360 report:', mockReport);
        this.handleNewReports([mockReport]);
        
        return mockReport;
    }

    // Sync reports
    async syncReports() {
        try {
            console.log('🔄 Syncing Resolve360 reports...');
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            return permission === 'granted';
        }
        return false;
    }
}

// Initialize enhanced sync
const enhancedDashboardSync = new EnhancedDashboardSync();

// Export for global access
window.enhancedDashboardSync = enhancedDashboardSync;

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    enhancedDashboardSync.initialize();
    enhancedDashboardSync.requestNotificationPermission();
});

console.log('✅ Enhanced Resolve360 dashboard sync loaded');