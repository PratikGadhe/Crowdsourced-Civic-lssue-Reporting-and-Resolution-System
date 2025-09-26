// // Sync service to integrate mobile app with government dashboard
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export interface SyncedReport {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   priority: string;
//   status: 'pending' | 'progress' | 'resolved';
//   location: string;
//   coordinates?: {
//     lat: number;
//     lng: number;
//   };
//   images: string[];
//   user: {
//     name: string;
//     email: string;
//     phone: string;
//   };
//   timestamp: string;
//   createdAt: string;
//   aiAnalysis?: {
//     confidence: number;
//     tags: string[];
//     estimatedResolutionTime: string;
//     urgency: number;
//   };
// }

// class SyncService {
//   private static instance: SyncService;
//   private syncKey = 'civicReports';

//   static getInstance(): SyncService {
//     if (!SyncService.instance) {
//       SyncService.instance = new SyncService();
//     }
//     return SyncService.instance;
//   }

//   // Submit report to both local storage and sync with website
//   async submitReport(reportData: {
//     title: string;
//     description: string;
//     category: string;
//     priority: string;
//     location: {
//       latitude: number;
//       longitude: number;
//       address: string;
//     };
//     images: string[];
//     aiAnalysis?: any;
//   }, user: any): Promise<string> {
    
//     const reportId = this.generateId();
//     const timestamp = new Date().toISOString();
    
//     const syncedReport: SyncedReport = {
//       id: reportId,
//       title: reportData.title,
//       description: reportData.description,
//       category: reportData.category,
//       priority: reportData.priority,
//       status: 'pending',
//       location: reportData.location.address,
//       coordinates: {
//         lat: reportData.location.latitude,
//         lng: reportData.location.longitude,
//       },
//       images: reportData.images,
//       user: {
//         name: 'Pratik Gadhe',
//         email: 'pratikgadhe366@gmail.com',
//         phone: '+91 9876543210',
//       },
//       timestamp,
//       createdAt: timestamp,
//       aiAnalysis: reportData.aiAnalysis ? {
//         confidence: reportData.aiAnalysis.confidence,
//         tags: reportData.aiAnalysis.tags,
//         estimatedResolutionTime: reportData.aiAnalysis.estimatedResolutionTime,
//         urgency: reportData.aiAnalysis.urgency || 5,
//       } : undefined,
//     };

//     try {
//       // Save to mobile app storage
//       await this.saveToMobileStorage(syncedReport);
      
//       // Sync with website (localStorage for demo, Firebase for production)
//       await this.syncWithWebsite(syncedReport);
      
//       console.log('✅ Report synced successfully:', reportId);
//       return reportId;
      
//     } catch (error) {
//       console.error('❌ Sync failed:', error);
//       throw new Error('Failed to submit report');
//     }
//   }

//   // Save to mobile app's local storage
//   private async saveToMobileStorage(report: SyncedReport): Promise<void> {
//     try {
//       const existingReports = await AsyncStorage.getItem('userReports');
//       const reports = existingReports ? JSON.parse(existingReports) : [];
//       reports.push(report);
//       await AsyncStorage.setItem('userReports', JSON.stringify(reports));
//     } catch (error) {
//       console.error('Failed to save to mobile storage:', error);
//     }
//   }

//   // Sync with website (demo version using localStorage simulation)
//   private async syncWithWebsite(report: SyncedReport): Promise<void> {
//     try {
//       // For demo: simulate web localStorage
//       // In production, this would be a Firebase/API call
      
//       // Convert to website format
//       const websiteReport = {
//         ...report,
//         // Map mobile categories to website categories
//         category: this.mapCategoryForWebsite(report.category),
//       };

//       // Simulate API call delay
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       // In a real app, you would:
//       // 1. Send to Firebase: await db.collection('reports').add(websiteReport);
//       // 2. Send to API: await fetch('/api/reports', { method: 'POST', body: JSON.stringify(websiteReport) });
      
//       // For demo, we'll use a shared storage mechanism
//       if (typeof window !== 'undefined' && window.localStorage) {
//         // Running in web environment
//         const existingReports = localStorage.getItem(this.syncKey);
//         const reports = existingReports ? JSON.parse(existingReports) : [];
//         reports.push(websiteReport);
//         localStorage.setItem(this.syncKey, JSON.stringify(reports));
//       } else {
//         // Running in mobile environment - save to AsyncStorage for demo
//         try {
//           // Save reports in a format the website can read
//           const existingReports = await AsyncStorage.getItem('websiteReports');
//           const reports = existingReports ? JSON.parse(existingReports) : [];
//           reports.push(websiteReport);
//           await AsyncStorage.setItem('websiteReports', JSON.stringify(reports));
//           console.log('📡 Report saved for website sync:', websiteReport.id);
//         } catch (e) {
//           console.log('📡 Report would be synced to server:', websiteReport);
//         }
//       }
      
//     } catch (error) {
//       console.error('Failed to sync with website:', error);
//       throw error;
//     }
//   }

//   // Map mobile categories to website categories
//   private mapCategoryForWebsite(mobileCategory: string): string {
//     const categoryMap: { [key: string]: string } = {
//       'roads': 'infrastructure',
//       'water': 'infrastructure', 
//       'electricity': 'infrastructure',
//       'waste': 'environment',
//       'public': 'infrastructure',
//       'other': 'infrastructure',
//     };
    
//     return categoryMap[mobileCategory] || 'infrastructure';
//   }

//   // Get user's reports
//   async getUserReports(): Promise<SyncedReport[]> {
//     try {
//       const reports = await AsyncStorage.getItem('userReports');
//       return reports ? JSON.parse(reports) : [];
//     } catch (error) {
//       console.error('Failed to get user reports:', error);
//       return [];
//     }
//   }

//   // Update report status (when government updates it)
//   async updateReportStatus(reportId: string, newStatus: 'pending' | 'progress' | 'resolved'): Promise<void> {
//     try {
//       const reports = await this.getUserReports();
//       const reportIndex = reports.findIndex(r => r.id === reportId);
      
//       if (reportIndex !== -1) {
//         reports[reportIndex].status = newStatus;
//         await AsyncStorage.setItem('userReports', JSON.stringify(reports));
//         console.log('✅ Report status updated:', reportId, newStatus);
//       }
//     } catch (error) {
//       console.error('Failed to update report status:', error);
//     }
//   }

//   // Generate unique ID
//   private generateId(): string {
//     return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
//   }

//   // Real-time sync setup (for production)
//   setupRealtimeSync(): void {
//     // In production, set up Firebase listener or WebSocket connection
//     console.log('🔄 Real-time sync initialized');
    
//     // Example Firebase listener:
//     /*
//     db.collection('reports')
//       .where('user.email', '==', currentUser.email)
//       .onSnapshot((snapshot) => {
//         snapshot.docChanges().forEach((change) => {
//           if (change.type === 'modified') {
//             const updatedReport = { id: change.doc.id, ...change.doc.data() };
//             this.updateReportStatus(updatedReport.id, updatedReport.status);
//           }
//         });
//       });
//     */
//   }
// }

// export default SyncService;