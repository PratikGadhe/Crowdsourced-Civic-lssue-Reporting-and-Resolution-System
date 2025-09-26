// Real API sync integration for Resolve360 Dashboard
class RealAPIDashboardSync {
    constructor() {
        this.apiBaseUrl = 'http://localhost:9000/api';
        this.reports = [];
        this.isPolling = false;
        this.pollInterval = 5000; // 5 seconds
    }

    // Initialize real API sync
    initialize() {
        console.log('🔄 Initializing Resolve360 real API sync...');
        this.loadReportsFromAPI();
        this.startPolling();
    }

    // Fetch reports from real API
    async loadReportsFromAPI() {
        try {
            console.log('📡 Fetching reports from API...');
            const response = await fetch(`${this.apiBaseUrl}/reports`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                this.reports = result.data;
                console.log(`✅ Loaded ${this.reports.length} reports from API`);
                this.updateDashboard();
                this.updateStats();
            } else {
                console.error('❌ API response error:', result);
            }
        } catch (error) {
            console.error('❌ Failed to fetch reports:', error);
            this.showConnectionError();
        }
    }

    // Start polling for new reports
    startPolling() {
        if (this.isPolling) return;
        
        this.isPolling = true;
        console.log('🔄 Started polling for new reports every 5 seconds');
        
        setInterval(() => {
            this.loadReportsFromAPI();
        }, this.pollInterval);
    }

    // Update dashboard with real data
    updateDashboard() {
        // Set global reports variable
        window.allReports = this.reports;
        window.filteredReports = this.reports;
        
        // Update reports display
        if (typeof window.displayReports === 'function') {
            window.displayReports();
        }
        
        // Update map markers
        if (typeof window.updateMapMarkers === 'function') {
            window.updateMapMarkers(this.reports);
        }
        
        // Apply current filters
        if (typeof window.applyFilters === 'function') {
            window.applyFilters();
        }
    }

    // Update statistics
    updateStats() {
        const stats = this.calculateStats();
        
        // Update stat cards
        document.getElementById('totalReports').textContent = stats.total;
        document.getElementById('pendingReports').textContent = stats.pending;
        document.getElementById('progressReports').textContent = stats.inProgress;
        document.getElementById('resolvedReports').textContent = stats.resolved;
        
        console.log('📊 Updated stats:', stats);
    }

    // Calculate statistics from reports
    calculateStats() {
        return {
            total: this.reports.length,
            pending: this.reports.filter(r => r.status === 'pending').length,
            inProgress: this.reports.filter(r => r.status === 'in-progress').length,
            resolved: this.reports.filter(r => r.status === 'resolved').length
        };
    }

    // Show connection error
    showConnectionError() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            Unable to connect to backend API. Please ensure the server is running on port 9000.
        `;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(errorDiv, mainContent.firstChild);
        }
    }

    // Get reports (for external access)
    getReports() {
        return this.reports;
    }

    // Update report status via API
    async updateReportStatus(reportId, newStatus) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Report status updated:', result.data);
                this.loadReportsFromAPI(); // Refresh data
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Failed to update report status:', error);
            throw error;
        }
    }
}

// Initialize real API sync
const realAPISync = new RealAPIDashboardSync();

// Export for global access
window.realAPISync = realAPISync;
window.loadReportsFromAPI = () => realAPISync.loadReportsFromAPI();

// Remove test sync - dashboard loads real data automatically

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    realAPISync.initialize();
});

console.log('✅ Real API sync loaded for Resolve360 dashboard');